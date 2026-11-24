import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type NextFunction, type Request, type Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const DATA_DIR = path.resolve(__dirname, 'data');
const CONTENT_FILE = path.resolve(DATA_DIR, 'cms-content.json');
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const PUBLIC_CONTENT_FILE = path.resolve(PUBLIC_DIR, 'cms-content.json');
const AUTH_FILE = path.resolve(DATA_DIR, 'cms-auth.json');
const UPLOADS_DIR = path.resolve(PUBLIC_DIR, 'uploads');

const ENV_ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '').trim();
const SESSION_SECRET =
  (process.env.SESSION_SECRET || '').trim() || crypto.randomBytes(32).toString('hex');
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

interface StoredAuthRecord {
  salt: string;
  hash: string;
  updatedAt: string;
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function ensureDataDirs(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(AUTH_FILE) && !ENV_ADMIN_PASSWORD) {
    writeAuthRecord('admin123');
  }
}

function readAuthRecord(): StoredAuthRecord | null {
  try {
    if (!fs.existsSync(AUTH_FILE)) return null;
    const raw = fs.readFileSync(AUTH_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoredAuthRecord>;
    if (typeof parsed.salt === 'string' && typeof parsed.hash === 'string') {
      return {
        salt: parsed.salt,
        hash: parsed.hash,
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
      };
    }
  } catch {
    return null;
  }
  return null;
}

function writeAuthRecord(password: string): void {
  ensureDataDirs();
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  const record: StoredAuthRecord = {
    salt,
    hash,
    updatedAt: new Date().toISOString(),
  };
  const tmpFile = `${AUTH_FILE}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(record, null, 2), 'utf8');
  fs.renameSync(tmpFile, AUTH_FILE);
}

function timingSafeTextEqual(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function verifyPassword(candidate: string): boolean {
  if (ENV_ADMIN_PASSWORD.length > 0) {
    return timingSafeTextEqual(candidate, ENV_ADMIN_PASSWORD);
  }
  const record = readAuthRecord();
  if (!record) return false;
  const derived = crypto.scryptSync(candidate, record.salt, 64);
  const stored = Buffer.from(record.hash, 'hex');
  if (derived.length !== stored.length) return false;
  return crypto.timingSafeEqual(derived, stored);
}

function signSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'admin',
      exp: Date.now() + TOKEN_TTL_MS,
      jti: crypto.randomUUID(),
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  if (!payload || !sig) return false;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };
    return decoded.role === 'admin' && typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);
  if (!token || !verifySessionToken(token)) {
    res.status(401).json({ error: 'Unauthorized. Please sign in as admin.' });
    return;
  }
  next();
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 12) {
    return false;
  }
  entry.count += 1;
  return true;
}

const MIME_TO_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function hasValidImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 12) return false;
  if (mimeType === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === 'image/gif') {
    const header = buffer.subarray(0, 6).toString('ascii');
    return header === 'GIF87a' || header === 'GIF89a';
  }
  if (mimeType === 'image/webp') {
    return (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  return false;
}

async function startServer(): Promise<void> {
  ensureDataDirs();

  const app = express();
  app.use(express.json({ limit: '22mb' }));

  // Serve uploaded CMS media safely from confined directory
  app.use(
    '/uploads',
    express.static(UPLOADS_DIR, {
      fallthrough: false,
      index: false,
      setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      },
    })
  );

  // Auth status
  app.get('/api/cms/auth/status', (req, res) => {
    const token = extractBearerToken(req);
    const authenticated = Boolean(token && verifySessionToken(token));
    const usesEnvPassword = ENV_ADMIN_PASSWORD.length > 0;
    const hasStoredHash = Boolean(readAuthRecord());
    const needsSetup = !usesEnvPassword && !hasStoredHash;
    res.json({ authenticated, needsSetup, usesEnvPassword });
  });

  // One-time atomic first-run password claim (locked once set or if ADMIN_PASSWORD env is set)
  app.post('/api/cms/auth/setup', (req, res) => {
    if (ENV_ADMIN_PASSWORD.length > 0 || readAuthRecord() !== null) {
      res.status(409).json({ error: 'Admin password is already configured.' });
      return;
    }

    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (password.length < 6 || password.length > 128) {
      res.status(400).json({ error: 'Password must be between 6 and 128 characters.' });
      return;
    }

    writeAuthRecord(password);
    const token = signSessionToken();
    res.status(201).json({ token });
  });

  // Admin password login
  app.post('/api/cms/auth/login', (req, res) => {
    const ip = req.ip || 'unknown';
    if (!checkRateLimit(ip)) {
      res.status(429).json({ error: 'Too many login attempts. Please wait a few minutes.' });
      return;
    }

    const usesEnvPassword = ENV_ADMIN_PASSWORD.length > 0;
    if (!usesEnvPassword && !readAuthRecord()) {
      res.status(409).json({ error: 'Admin password has not been set up yet.' });
      return;
    }

    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!password || !verifyPassword(password)) {
      res.status(401).json({ error: 'Incorrect admin password.' });
      return;
    }

    loginAttempts.delete(ip);
    const token = signSessionToken();
    res.json({ token });
  });

  // Update admin password when not overridden by ADMIN_PASSWORD env var
  app.post('/api/cms/auth/change-password', requireAdmin, (req, res) => {
    if (ENV_ADMIN_PASSWORD.length > 0) {
      res.status(400).json({
        error: 'Password is managed via ADMIN_PASSWORD environment variable.',
      });
      return;
    }

    const currentPassword =
      typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (!verifyPassword(currentPassword)) {
      res.status(401).json({ error: 'Current password is incorrect.' });
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 128) {
      res.status(400).json({ error: 'New password must be between 6 and 128 characters.' });
      return;
    }

    writeAuthRecord(newPassword);
    res.json({ ok: true });
  });

  // Read saved CMS content (data store first, then public/cms-content.json)
  app.get('/api/cms/content', (_req, res) => {
    try {
      const target = fs.existsSync(CONTENT_FILE)
        ? CONTENT_FILE
        : fs.existsSync(PUBLIC_CONTENT_FILE)
          ? PUBLIC_CONTENT_FILE
          : null;
      if (!target) {
        res.json({ content: null });
        return;
      }
      const raw = fs.readFileSync(target, 'utf8');
      const parsed = JSON.parse(raw) as unknown;
      res.json({ content: parsed });
    } catch {
      res.json({ content: null });
    }
  });

  // Save CMS content permanently to data store and public/cms-content.json
  app.put('/api/cms/content', requireAdmin, (req, res) => {
    const content = req.body?.content;
    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      res.status(400).json({ error: 'Invalid content payload.' });
      return;
    }

    ensureDataDirs();
    const serialized = JSON.stringify(content, null, 2);

    const tmpData = `${CONTENT_FILE}.${crypto.randomUUID()}.tmp`;
    fs.writeFileSync(tmpData, serialized, 'utf8');
    fs.renameSync(tmpData, CONTENT_FILE);

    const tmpPublic = `${PUBLIC_CONTENT_FILE}.${crypto.randomUUID()}.tmp`;
    fs.writeFileSync(tmpPublic, serialized, 'utf8');
    fs.renameSync(tmpPublic, PUBLIC_CONTENT_FILE);

    res.json({ ok: true, savedAt: new Date().toISOString() });
  });

  // Reset CMS content back to factory defaults
  app.post('/api/cms/reset', requireAdmin, (_req, res) => {
    if (fs.existsSync(CONTENT_FILE)) {
      fs.unlinkSync(CONTENT_FILE);
    }
    if (fs.existsSync(PUBLIC_CONTENT_FILE)) {
      fs.unlinkSync(PUBLIC_CONTENT_FILE);
    }
    res.json({ ok: true });
  });

  // Upload replacement image file
  app.post('/api/cms/upload', requireAdmin, (req, res) => {
    const mimeType = typeof req.body?.mimeType === 'string' ? req.body.mimeType.toLowerCase() : '';
    const dataBase64 = typeof req.body?.dataBase64 === 'string' ? req.body.dataBase64 : '';

    const ext = MIME_TO_EXT[mimeType];
    if (!ext) {
      res.status(400).json({ error: 'Unsupported image type. Use PNG, JPG, WebP, or GIF.' });
      return;
    }

    const cleanBase64 = dataBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    if (buffer.length === 0 || buffer.length > 15 * 1024 * 1024) {
      res.status(400).json({ error: 'Image must be non-empty and under 15 MB.' });
      return;
    }

    if (!hasValidImageMagicBytes(buffer, mimeType)) {
      res.status(400).json({ error: 'File contents do not match the declared image format.' });
      return;
    }

    ensureDataDirs();
    const safeFilename = `${crypto.randomUUID()}${ext}`;
    const targetPath = path.resolve(UPLOADS_DIR, safeFilename);
    if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
      res.status(400).json({ error: 'Invalid upload destination.' });
      return;
    }

    fs.writeFileSync(targetPath, buffer);
    res.status(201).json({ url: `/uploads/${safeFilename}` });
  });

  if (IS_PRODUCTION) {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
