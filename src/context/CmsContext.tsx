import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  cloneContent,
  DEFAULT_SITE_CONTENT,
  mergeWithDefaults,
  sanitizeImageUrl,
  sanitizeUrl,
  type SiteContent,
} from './cmsSchema';

const LOCAL_STORAGE_KEY = 'wr_cms_content_v1';
const LOCAL_DRAFT_KEY = 'wr_cms_draft_v1';

export interface ImageEditorTarget {
  title: string;
  src: string;
  alt: string;
  allowClear?: boolean;
  clearLabel?: string;
  scrollPreview?: boolean;
  onApply: (next: { src: string; alt: string }) => void;
}

export interface ActionEditorTarget {
  title: string;
  label: string;
  url: string;
  icon?: string;
  color?: string;
  labelFieldTitle?: string;
  urlFieldTitle?: string;
  urlPlaceholder?: string;
  showSectionPresets?: boolean;
  showIconSelector?: boolean;
  onApply: (next: { label: string; url: string; icon?: string; color?: string }) => void;
}

export interface ToastMessage {
  id: number;
  text: string;
  tone: 'success' | 'info' | 'error';
}

interface CmsContextValue {
  content: SiteContent;
  isLoaded: boolean;
  isAuthenticated: boolean;
  needsSetup: boolean;
  usesEnvPassword: boolean;
  editMode: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  loginModalOpen: boolean;
  passwordModalOpen: boolean;
  imageEditor: ImageEditorTarget | null;
  actionEditor: ActionEditorTarget | null;
  toast: ToastMessage | null;
  setEditMode: (enabled: boolean) => void;
  toggleEditMode: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openPasswordModal: () => void;
  closePasswordModal: () => void;
  openImageEditor: (target: ImageEditorTarget) => void;
  closeImageEditor: () => void;
  openActionEditor: (target: ActionEditorTarget) => void;
  closeActionEditor: () => void;
  showToast: (text: string, tone?: ToastMessage['tone']) => void;
  updateContent: (updater: (prev: SiteContent) => SiteContent) => void;
  saveChanges: () => Promise<boolean>;
  discardChanges: () => void;
  resetToDefaults: () => Promise<void>;
  exportBackup: () => void;
  uploadImage: (file: File) => Promise<string>;
  setupAdminPassword: (password: string) => Promise<{ ok: boolean; error?: string }>;
  login: (password: string) => Promise<{ ok: boolean; error?: string }>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const CmsContext = createContext<CmsContextValue | null>(null);

function readLocalFallback(): SiteContent | null {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return mergeWithDefaults(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeLocalFallback(content: SiteContent): void {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(content));
  } catch {
    // Ignore storage quota errors
  }
}

function clearLocalFallback(): void {
  try {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.localStorage.removeItem(LOCAL_DRAFT_KEY);
  } catch {
    // Ignore storage errors
  }
}

function readLocalDraft(): SiteContent | null {
  try {
    const raw = window.localStorage.getItem(LOCAL_DRAFT_KEY);
    if (!raw) return null;
    return mergeWithDefaults(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeLocalDraft(content: SiteContent): void {
  try {
    window.localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(content));
  } catch {
    // Ignore storage errors
  }
}

function clearLocalDraft(): void {
  try {
    window.localStorage.removeItem(LOCAL_DRAFT_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function CmsProvider({ children }: { children: ReactNode }) {
  const [savedContent, setSavedContent] = useState<SiteContent>(() =>
    cloneContent(DEFAULT_SITE_CONTENT)
  );
  const [draftContent, setDraftContent] = useState<SiteContent>(() =>
    cloneContent(DEFAULT_SITE_CONTENT)
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Auth token kept strictly in React memory (never persisted in Web Storage)
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [usesEnvPassword, setUsesEnvPassword] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [imageEditor, setImageEditor] = useState<ImageEditorTarget | null>(null);
  const [actionEditor, setActionEditor] = useState<ActionEditorTarget | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const isAuthenticated = Boolean(authToken);

  const showToast = useCallback((text: string, tone: ToastMessage['tone'] = 'success') => {
    setToast({ id: Date.now(), text, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Load persisted CMS content and auth configuration on mount
  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const [contentRes, authRes] = await Promise.all([
          fetch('/api/cms/content'),
          fetch('/api/cms/auth/status'),
        ]);

        if (!active) return;

        let loadedSaved: SiteContent | null = null;

        if (contentRes.ok) {
          const data = (await contentRes.json()) as { content?: unknown };
          if (data.content) {
            loadedSaved = mergeWithDefaults(data.content);
            writeLocalFallback(loadedSaved);
          }
        }

        if (!loadedSaved) {
          try {
            const staticRes = await fetch('/cms-content.json');
            if (staticRes.ok) {
              const staticJson = (await staticRes.json()) as unknown;
              loadedSaved = mergeWithDefaults(staticJson);
              writeLocalFallback(loadedSaved);
            }
          } catch {
            // Static file optional
          }
        }

        if (!loadedSaved) {
          loadedSaved = readLocalFallback();
        }

        if (active && loadedSaved) {
          setSavedContent(loadedSaved);
          const pendingDraft = readLocalDraft();
          setDraftContent(pendingDraft ?? cloneContent(loadedSaved));
        } else if (active) {
          const pendingDraft = readLocalDraft();
          if (pendingDraft) setDraftContent(pendingDraft);
        }

        if (authRes.ok) {
          const authData = (await authRes.json()) as {
            needsSetup?: boolean;
            usesEnvPassword?: boolean;
          };
          setNeedsSetup(Boolean(authData.needsSetup));
          setUsesEnvPassword(Boolean(authData.usesEnvPassword));
        }
      } catch {
        const local = readLocalFallback();
        const pendingDraft = readLocalDraft();
        if (active) {
          if (local) {
            setSavedContent(local);
            setDraftContent(pendingDraft ?? cloneContent(local));
          } else if (pendingDraft) {
            setDraftContent(pendingDraft);
          }
        }
      } finally {
        if (active) setIsLoaded(true);
      }
    }

    hydrate();
    return () => {
      active = false;
    };
  }, []);

  // Open admin modal on /admin route
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setLoginModalOpen(true);
    }
  }, []);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(savedContent) !== JSON.stringify(draftContent),
    [savedContent, draftContent]
  );

  const updateContent = useCallback((updater: (prev: SiteContent) => SiteContent) => {
    setDraftContent((prev) => {
      const next = updater(cloneContent(prev));
      writeLocalDraft(next);
      return next;
    });
  }, []);

  const saveChanges = useCallback(async (): Promise<boolean> => {
    if (!authToken) {
      setLoginModalOpen(true);
      return false;
    }

    setIsSaving(true);
    try {
      const normalized = mergeWithDefaults(draftContent);
      const res = await fetch('/api/cms/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ content: normalized }),
      });

      if (res.status === 401) {
        setAuthToken(null);
        setEditMode(false);
        setLoginModalOpen(true);
        showToast('Session expired. Please sign in again.', 'error');
        return false;
      }

      if (!res.ok) {
        throw new Error('Failed to save changes');
      }

      writeLocalFallback(normalized);
      clearLocalDraft();
      setSavedContent(normalized);
      setDraftContent(cloneContent(normalized));
      setImageEditor(null);
      setActionEditor(null);
      showToast('Changes saved!', 'success');
      return true;
    } catch {
      writeLocalFallback(draftContent);
      clearLocalDraft();
      setSavedContent(cloneContent(draftContent));
      showToast('Changes saved locally!', 'info');
      return true;
    } finally {
      setIsSaving(false);
    }
  }, [authToken, draftContent, showToast]);

  // Keyboard shortcuts: Ctrl/Cmd+Shift+E toggles Edit Mode, Ctrl/Cmd+S saves changes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        if (isAuthenticated) {
          setEditMode((prev) => !prev);
        } else {
          setLoginModalOpen(true);
        }
      } else if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 's') {
        if (isAuthenticated && editMode) {
          event.preventDefault();
          void saveChanges();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, editMode, saveChanges]);

  const discardChanges = useCallback(() => {
    clearLocalDraft();
    setDraftContent(cloneContent(savedContent));
    setImageEditor(null);
    setActionEditor(null);
    showToast('Unsaved edits discarded.', 'info');
  }, [savedContent, showToast]);

  const resetToDefaults = useCallback(async () => {
    if (!authToken) return;
    setIsSaving(true);
    try {
      await fetch('/api/cms/reset', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    } catch {
      // Continue with local reset
    } finally {
      clearLocalFallback();
      const fresh = cloneContent(DEFAULT_SITE_CONTENT);
      setSavedContent(fresh);
      setDraftContent(cloneContent(fresh));
      setImageEditor(null);
      setActionEditor(null);
      setIsSaving(false);
      showToast('Reset to default content.', 'info');
    }
  }, [authToken, showToast]);

  const exportBackup = useCallback(() => {
    const payload = JSON.stringify(draftContent, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `waldemar-rosado-cms-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('JSON backup downloaded.', 'info');
  }, [draftContent, showToast]);

  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
      if (!allowed.includes(file.type.toLowerCase())) {
        throw new Error('Please choose a PNG, JPG, WebP, or GIF image.');
      }
      if (file.size > 15 * 1024 * 1024) {
        throw new Error('Image must be smaller than 15 MB.');
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.readAsDataURL(file);
      });

      if (!authToken) {
        return sanitizeImageUrl(dataUrl, '');
      }

      const res = await fetch('/api/cms/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          dataBase64: dataUrl,
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || 'Image upload failed.');
      }

      const result = (await res.json()) as { url: string };
      return sanitizeImageUrl(result.url, '');
    },
    [authToken]
  );

  const setupAdminPassword = useCallback(
    async (password: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/cms/auth/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
        if (!res.ok || !data.token) {
          return { ok: false, error: data.error || 'Could not save password.' };
        }
        setAuthToken(data.token);
        setNeedsSetup(false);
        setEditMode(true);
        setLoginModalOpen(false);
        showToast('Admin password configured. Edit Mode is active.', 'success');
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error while configuring admin password.' };
      }
    },
    [showToast]
  );

  const login = useCallback(
    async (password: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/cms/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
        if (!res.ok || !data.token) {
          return { ok: false, error: data.error || 'Invalid password.' };
        }
        setAuthToken(data.token);
        setEditMode(true);
        setLoginModalOpen(false);
        showToast('Signed in. Edit Mode is active.', 'success');
        return { ok: true };
      } catch {
        return { ok: false, error: 'Unable to reach authentication server.' };
      }
    },
    [showToast]
  );

  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string
    ): Promise<{ ok: boolean; error?: string }> => {
      if (!authToken) return { ok: false, error: 'Not signed in.' };
      try {
        const res = await fetch('/api/cms/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        if (!res.ok) {
          return { ok: false, error: data.error || 'Could not update password.' };
        }
        setPasswordModalOpen(false);
        showToast('Admin password updated.', 'success');
        return { ok: true };
      } catch {
        return { ok: false, error: 'Network error while updating password.' };
      }
    },
    [authToken, showToast]
  );

  const logout = useCallback(() => {
    setAuthToken(null);
    setEditMode(false);
    setImageEditor(null);
    setActionEditor(null);
    setPasswordModalOpen(false);
    showToast('Signed out of Admin CMS.', 'info');
  }, [showToast]);

  const activeContent = isAuthenticated ? draftContent : savedContent;

  const value: CmsContextValue = {
    content: activeContent,
    isLoaded,
    isAuthenticated,
    needsSetup,
    usesEnvPassword,
    editMode: isAuthenticated && editMode,
    hasUnsavedChanges,
    isSaving,
    loginModalOpen,
    passwordModalOpen,
    imageEditor,
    actionEditor,
    toast,
    setEditMode: (enabled) => {
      if (!isAuthenticated) {
        setLoginModalOpen(true);
        return;
      }
      setEditMode(enabled);
      if (!enabled) {
        setImageEditor(null);
        setActionEditor(null);
      }
    },
    toggleEditMode: () => {
      if (!isAuthenticated) {
        setLoginModalOpen(true);
        return;
      }
      setEditMode((prev) => {
        const next = !prev;
        if (!next) {
          setImageEditor(null);
          setActionEditor(null);
        }
        return next;
      });
    },
    openLoginModal: () => setLoginModalOpen(true),
    closeLoginModal: () => setLoginModalOpen(false),
    openPasswordModal: () => setPasswordModalOpen(true),
    closePasswordModal: () => setPasswordModalOpen(false),
    openImageEditor: (target) => {
      setActionEditor(null);
      setImageEditor({
        ...target,
        onApply: (next) =>
          target.onApply({
            src: sanitizeImageUrl(next.src, ''),
            alt: next.alt.trim(),
          }),
      });
    },
    closeImageEditor: () => setImageEditor(null),
    openActionEditor: (target) => {
      setImageEditor(null);
      setActionEditor({
        ...target,
        onApply: (next) => {
          const rawUrl = next.url.trim();
          const normalizedUrl =
            rawUrl &&
            !rawUrl.startsWith('#') &&
            !rawUrl.startsWith('/') &&
            !rawUrl.includes(':') &&
            /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:[/:?#].*)?$/.test(rawUrl)
              ? `https://${rawUrl}`
              : rawUrl;
          target.onApply({
            label: next.label.trim() || target.label,
            url: normalizedUrl === '' ? '' : sanitizeUrl(normalizedUrl, target.url),
            icon: next.icon,
            color: next.color,
          });
        },
      });
    },
    closeActionEditor: () => setActionEditor(null),
    showToast,
    updateContent,
    saveChanges,
    discardChanges,
    resetToDefaults,
    exportBackup,
    uploadImage,
    setupAdminPassword,
    login,
    changePassword,
    logout,
  };

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms(): CmsContextValue {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    throw new Error('useCms must be used within CmsProvider');
  }
  return ctx;
}
