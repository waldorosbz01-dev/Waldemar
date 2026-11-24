import { useEffect, useState, type FormEvent } from 'react';
import {
  Check,
  Download,
  Image as ImageIcon,
  KeyRound,
  Link2,
  Lock,
  LogOut,
  Mail,
  Pencil,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';

export function AdminAuthModal() {
  const {
    loginModalOpen,
    closeLoginModal,
    needsSetup,
    usesEnvPassword,
    login,
    setupAdminPassword,
  } = useCms();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loginModalOpen) {
      setPassword('');
      setConfirmPassword('');
      setError(null);
    }
  }, [loginModalOpen]);

  useEffect(() => {
    if (!loginModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLoginModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loginModalOpen, closeLoginModal]);

  if (!loginModalOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (needsSetup) {
      if (password.length < 6) {
        setError('Please choose a password of at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setSubmitting(true);
      const res = await setupAdminPassword(password);
      setSubmitting(false);
      if (!res.ok) setError(res.error || 'Setup failed.');
      return;
    }

    if (!password) {
      setError('Please enter your admin password.');
      return;
    }
    setSubmitting(true);
    const res = await login(password);
    setSubmitting(false);
    if (!res.ok) setError(res.error || 'Incorrect password.');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cms-auth-title"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-md"
      onClick={closeLoginModal}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/15 bg-zinc-900 p-6 sm:p-8 text-zinc-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5A93C]/35 bg-[#E5A93C]/15 text-[#E5A93C]">
              <Lock className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="cms-auth-title" className="font-display text-xl font-bold text-white">
                {needsSetup ? 'Set Admin Password' : 'Admin CMS Sign In'}
              </h2>
              <p className="text-xs text-zinc-400">
                {needsSetup
                  ? 'First-run setup · stored hashed on server'
                  : 'Enter password to save changes (Default: admin123)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeLoginModal}
            aria-label="Close login modal"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-400/35 bg-red-950/50 px-3.5 py-2.5 text-xs text-red-200"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="cms-admin-password" className="block text-xs font-medium text-zinc-300">
              {needsSetup ? 'Choose Admin Password (min 6 chars)' : 'Admin Password'}
            </label>
            <input
              id="cms-admin-password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-zinc-950/80 px-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#E5A93C] focus:outline-none"
            />
          </div>

          {needsSetup && (
            <div>
              <label
                htmlFor="cms-admin-confirm"
                className="block text-xs font-medium text-zinc-300"
              >
                Confirm Password
              </label>
              <input
                id="cms-admin-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 h-11 w-full rounded-lg border border-white/15 bg-zinc-950/80 px-3.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#E5A93C] focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-zinc-500">Shortcut: Ctrl+Shift+E</span>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#E5A93C] px-5 py-2.5 text-xs font-semibold text-zinc-950 whitespace-nowrap shrink-0 transition-colors hover:bg-[#eab85c] disabled:opacity-60 cursor-pointer"
            >
              <span>{submitting ? 'Verifying...' : needsSetup ? 'Claim & Enter CMS' : 'Unlock Edit Mode'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ChangePasswordModal() {
  const { passwordModalOpen, closePasswordModal, changePassword } = useCms();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNew, setConfirmNew] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!passwordModalOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNew('');
      setError(null);
    }
  }, [passwordModalOpen]);

  if (!passwordModalOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNew) {
      setError('New passwords do not match.');
      return;
    }
    setSaving(true);
    const res = await changePassword(currentPassword, newPassword);
    setSaving(false);
    if (!res.ok) setError(res.error || 'Could not change password.');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cms-change-pw-title"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-md"
      onClick={closePasswordModal}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/15 bg-zinc-900 p-6 sm:p-8 text-zinc-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="cms-change-pw-title" className="font-display text-lg font-bold text-white">
            Change Admin Password
          </h2>
          <button
            type="button"
            onClick={closePasswordModal}
            aria-label="Close change password dialog"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-400/35 bg-red-950/50 px-3.5 py-2.5 text-xs text-red-200"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="pw-current" className="block text-xs font-medium text-zinc-300">
              Current Password
            </label>
            <input
              id="pw-current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-zinc-950/80 px-3 text-sm text-white focus:border-[#E5A93C] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="pw-new" className="block text-xs font-medium text-zinc-300">
              New Password (min 6 chars)
            </label>
            <input
              id="pw-new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-zinc-950/80 px-3 text-sm text-white focus:border-[#E5A93C] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="pw-confirm" className="block text-xs font-medium text-zinc-300">
              Confirm New Password
            </label>
            <input
              id="pw-confirm"
              type="password"
              value={confirmNew}
              onChange={(e) => setConfirmNew(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-zinc-950/80 px-3 text-sm text-white focus:border-[#E5A93C] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closePasswordModal}
              className="h-10 rounded-lg border border-white/15 px-4 text-xs font-medium text-zinc-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-lg bg-[#E5A93C] px-4 text-xs font-semibold text-zinc-950 hover:bg-[#eab85c] disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ImageEditorPopover() {
  const { imageEditor, closeImageEditor, uploadImage, showToast } = useCms();
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  useEffect(() => {
    if (imageEditor) {
      setSrc(imageEditor.src);
      setAlt(imageEditor.alt);
      setUploadErr(null);
    }
  }, [imageEditor]);

  if (!imageEditor) return null;

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setUploadErr(null);
    setUploading(true);
    try {
      const uploadedUrl = await uploadImage(file);
      setSrc(uploadedUrl);
      showToast('Image uploaded. Click Save Changes to persist.', 'info');
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    imageEditor.onApply({ src, alt });
    closeImageEditor();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={imageEditor.title}
      className="fixed inset-0 z-[65] flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm"
      onClick={closeImageEditor}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/15 bg-zinc-900 p-6 text-zinc-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ImageIcon className="h-4 w-4 text-[#E5A93C]" aria-hidden="true" />
            <h3 className="font-display text-base font-semibold text-white">
              {imageEditor.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={closeImageEditor}
            aria-label="Close image editor"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {src && (
            <div
              className={`overflow-hidden rounded-xl border border-white/10 bg-zinc-950 ${
                imageEditor.scrollPreview ? 'max-h-48 overflow-y-auto' : ''
              }`}
            >
              <img
                src={src}
                alt={alt || 'Preview'}
                referrerPolicy="no-referrer"
                className={
                  imageEditor.scrollPreview
                    ? 'block h-auto w-full'
                    : 'h-36 w-full object-cover object-center'
                }
              />
            </div>
          )}

          {uploadErr && (
            <div className="rounded-lg border border-red-400/35 bg-red-950/50 px-3 py-2 text-xs text-red-200">
              {uploadErr}
            </div>
          )}

          <div>
            <label htmlFor="img-editor-url" className="block text-xs font-medium text-zinc-300">
              Image URL
            </label>
            <input
              id="img-editor-url"
              type="text"
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              placeholder="/assets/... or https://..."
              className="mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 text-xs text-white placeholder:text-zinc-500 focus:border-[#E5A93C] focus:outline-none"
            />
          </div>

          <div>
            <span className="block text-xs font-medium text-zinc-300">Upload Replacement File</span>
            <label className="mt-1.5 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/25 bg-zinc-950/60 px-3 text-xs font-medium text-zinc-200 hover:border-[#E5A93C]/70 hover:text-[#E5A93C]">
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{uploading ? 'Uploading...' : 'Choose PNG, JPG, WebP, or GIF'}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={uploading}
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
            </label>
          </div>

          <div>
            <label htmlFor="img-editor-alt" className="block text-xs font-medium text-zinc-300">
              Alt Text
            </label>
            <input
              id="img-editor-alt"
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image for accessibility"
              className="mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 text-xs text-white placeholder:text-zinc-500 focus:border-[#E5A93C] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            {imageEditor.allowClear ? (
              <button
                type="button"
                onClick={() => {
                  imageEditor.onApply({ src: '', alt });
                  closeImageEditor();
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-xs font-medium text-zinc-300 hover:border-red-400/50 hover:text-red-300 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{imageEditor.clearLabel ?? 'Use Vector Plate'}</span>
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeImageEditor}
                className="h-10 rounded-lg border border-white/15 px-4 text-xs font-medium text-zinc-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 rounded-lg bg-[#E5A93C] px-4 text-xs font-semibold text-zinc-950 hover:bg-[#eab85c] cursor-pointer"
              >
                Apply Image
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ActionEditorPopover() {
  const { actionEditor, closeActionEditor } = useCms();
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('whatsapp');

  useEffect(() => {
    if (actionEditor) {
      setLabel(actionEditor.label);
      setUrl(actionEditor.url);
      setSelectedIcon(actionEditor.icon ?? 'whatsapp');
    }
  }, [actionEditor]);

  if (!actionEditor) return null;

  const ICON_OPTIONS = [
    { id: 'whatsapp', name: 'WhatsApp', color: '#25D366' },
    { id: 'email', name: 'Email', color: '#EA4335' },
    { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
    { id: 'instagram', name: 'Instagram', color: '#E4405F' },
    { id: 'facebook', name: 'Facebook', color: '#1877F2' },
    { id: 'github', name: 'GitHub', color: '#E2E8F0' },
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const matched = ICON_OPTIONS.find((i) => i.id === selectedIcon);
    actionEditor.onApply({
      label,
      url,
      icon: selectedIcon,
      color: matched ? matched.color : actionEditor.color,
    });
    closeActionEditor();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={actionEditor.title}
      className="fixed inset-0 z-[65] flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm"
      onClick={closeActionEditor}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/15 bg-zinc-900 p-6 text-zinc-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Link2 className="h-4 w-4 text-[#E5A93C]" aria-hidden="true" />
            <h3 className="font-display text-base font-semibold text-white">
              {actionEditor.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={closeActionEditor}
            aria-label="Close link editor"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="action-label" className="block text-xs font-medium text-zinc-300">
              {actionEditor.labelFieldTitle ?? 'Label Text'}
            </label>
            <input
              id="action-label"
              type="text"
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 text-sm text-white focus:border-[#E5A93C] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="action-url" className="block text-xs font-medium text-zinc-300">
                {actionEditor.urlFieldTitle ?? 'Destination URL'}
              </label>
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="text-[11px] text-zinc-400 hover:text-red-300 cursor-pointer"
                >
                  Clear URL
                </button>
              )}
            </div>
            <input
              id="action-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={actionEditor.urlPlaceholder ?? '#my-work or https://...'}
              className="mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 text-xs text-white placeholder:text-zinc-500 focus:border-[#E5A93C] focus:outline-none"
            />
            {actionEditor.showSectionPresets !== false && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {['#home', '#my-work', '#lets-talk'].map((anchor) => (
                  <button
                    key={anchor}
                    type="button"
                    onClick={() => setUrl(anchor)}
                    className="rounded border border-white/15 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-300 hover:border-[#E5A93C]/60 hover:text-[#E5A93C] cursor-pointer"
                  >
                    {anchor}
                  </button>
                ))}
              </div>
            )}
          </div>

          {actionEditor.showIconSelector && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">
                Select Icon & Brand Color
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ICON_OPTIONS.map((opt) => {
                  const isSelected = selectedIcon === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedIcon(opt.id)}
                      className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#E5A93C] bg-[#E5A93C]/10 text-white'
                          : 'border-white/10 bg-zinc-950 text-zinc-300 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      <span
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded"
                        style={{ backgroundColor: `${opt.color}25`, color: opt.color }}
                      >
                        {opt.id === 'whatsapp' && (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.79 14.12c-.24.68-1.41 1.3-1.96 1.38-.51.08-1.15.11-1.86-.12-.43-.14-.98-.32-1.69-.63-2.98-1.29-4.92-4.29-5.07-4.49-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.04-2.48.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.24.59.83 2.02.9 2.17.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.32.4-.45.53-.15.15-.31.31-.13.61.18.3.79 1.3 1.7 2.11 1.17 1.04 2.15 1.36 2.45 1.51.3.15.48.13.66-.08.18-.2.75-.88.95-1.18.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.34.08.13.08.73-.16 1.41z" />
                          </svg>
                        )}
                        {opt.id === 'email' && <Mail className="h-3.5 w-3.5" />}
                        {opt.id === 'linkedin' && (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        )}
                        {opt.id === 'instagram' && (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        )}
                        {opt.id === 'facebook' && (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        )}
                        {opt.id === 'github' && (
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.793 5.927.451.383.856 1.122.856 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        )}
                      </span>
                      <span className="text-xs font-medium truncate">{opt.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeActionEditor}
              className="h-10 rounded-lg border border-white/15 px-4 text-xs font-medium text-zinc-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 rounded-lg bg-[#E5A93C] px-4 text-xs font-semibold text-zinc-950 hover:bg-[#eab85c] cursor-pointer"
            >
              Update Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminToolbar() {
  const {
    isAuthenticated,
    editMode,
    toggleEditMode,
    hasUnsavedChanges,
    isSaving,
    usesEnvPassword,
    saveChanges,
    discardChanges,
    resetToDefaults,
    exportBackup,
    openPasswordModal,
    logout,
  } = useCms();

  const [confirmReset, setConfirmReset] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <div
      role="region"
      aria-label="Admin CMS Toolbar"
      className="fixed bottom-4 left-1/2 z-[60] flex max-w-[96vw] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/15 bg-zinc-950/92 px-3 py-2 text-xs text-zinc-100 shadow-2xl backdrop-blur-xl"
    >
      {/* Edit Mode Toggle */}
      <button
        type="button"
        onClick={toggleEditMode}
        aria-pressed={editMode}
        className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
          editMode
            ? 'bg-[#E5A93C] text-zinc-950'
            : 'border border-white/15 bg-zinc-900 text-zinc-200 hover:text-white'
        }`}
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Edit Mode: {editMode ? 'On' : 'Off'}</span>
      </button>

      {/* Save Changes */}
      <button
        type="button"
        onClick={() => void saveChanges()}
        disabled={isSaving || !hasUnsavedChanges}
        className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-default ${
          hasUnsavedChanges
            ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
            : 'border border-white/15 bg-zinc-900 text-zinc-300'
        }`}
      >
        <Save className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
      </button>

      {/* Discard / Reset */}
      {hasUnsavedChanges ? (
        <button
          type="button"
          onClick={discardChanges}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-zinc-900 px-3 font-medium text-zinc-200 whitespace-nowrap shrink-0 hover:border-white/30 hover:text-white cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Discard</span>
        </button>
      ) : confirmReset ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setConfirmReset(false);
              void resetToDefaults();
            }}
            className="inline-flex h-9 items-center rounded-lg bg-red-500/90 px-3 font-semibold text-white whitespace-nowrap shrink-0 hover:bg-red-500 cursor-pointer"
          >
            Confirm Reset
          </button>
          <button
            type="button"
            onClick={() => setConfirmReset(false)}
            className="inline-flex h-9 items-center rounded-lg border border-white/15 px-2.5 text-zinc-300 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-zinc-900 px-3 font-medium text-zinc-300 whitespace-nowrap shrink-0 hover:border-white/30 hover:text-white cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Reset</span>
        </button>
      )}

      {/* Export JSON Backup */}
      <button
        type="button"
        onClick={exportBackup}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-zinc-900 px-3 font-medium text-zinc-200 whitespace-nowrap shrink-0 hover:border-white/30 hover:text-white cursor-pointer"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Export JSON</span>
      </button>

      {!usesEnvPassword && (
        <button
          type="button"
          onClick={openPasswordModal}
          aria-label="Change admin password"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-zinc-900 px-2.5 font-medium text-zinc-300 whitespace-nowrap shrink-0 hover:border-white/30 hover:text-white cursor-pointer"
        >
          <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Password</span>
        </button>
      )}

      {/* Logout */}
      <button
        type="button"
        onClick={logout}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-zinc-900 px-3 font-medium text-zinc-300 whitespace-nowrap shrink-0 hover:border-red-400/50 hover:text-red-300 cursor-pointer"
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Logout</span>
      </button>
    </div>
  );
}

export function CmsToast() {
  const { toast } = useCms();
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-20 right-5 z-[75] flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-xl backdrop-blur-xl ${
        toast.tone === 'error'
          ? 'border-red-400/40 bg-red-950/90 text-red-100'
          : toast.tone === 'info'
            ? 'border-white/20 bg-zinc-900/95 text-zinc-100'
            : 'border-[#E5A93C]/50 bg-zinc-950/95 text-[#E5A93C]'
      }`}
    >
      <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{toast.text}</span>
    </div>
  );
}
