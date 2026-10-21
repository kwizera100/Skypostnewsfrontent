import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAdminAuth } from './AdminAuth';
import apiClient from '../api/client';
import { getImageSrc, onImgError } from '../utils/images';

interface Profile {
  name: string;
  bio: string;
  avatarUrl: string;
  socialTwitter: string;
  socialFacebook: string;
  socialInstagram: string;
}

const EMPTY: Profile = {
  name: '',
  bio: '',
  avatarUrl: '',
  socialTwitter: '',
  socialFacebook: '',
  socialInstagram: '',
};

const inputCls =
  'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent';
const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';

export default function AdminProfile() {
  const { user, token } = useAdminAuth();
  const [form, setForm] = useState<Profile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiClient
      .get('/users/me')
      .then(({ data }) => {
        setForm({
          name: data.name || user?.name || '',
          bio: data.bio || '',
          avatarUrl: data.avatarUrl || '',
          socialTwitter: data.socialTwitter || '',
          socialFacebook: data.socialFacebook || '',
          socialInstagram: data.socialInstagram || '',
        });
      })
      .catch(() => {
        // Endpoint may not return profile fields yet — still allow editing.
        setForm({ ...EMPTY, name: user?.name || '' });
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await axios.post('/api/upload', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setForm(f => ({ ...f, avatarUrl: data.url }));
      toast.success('Photo uploaded — remember to Save');
    } catch {
      toast.error('Photo upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await apiClient.put('/users/me', {
        name: form.name.trim(),
        bio: form.bio.trim(),
        avatarUrl: form.avatarUrl || null,
        socialTwitter: form.socialTwitter.trim() || null,
        socialFacebook: form.socialFacebook.trim() || null,
        socialInstagram: form.socialInstagram.trim() || null,
      });
      // Keep the header/user chip in sync if the name changed.
      if (data?.name) {
        const stored = localStorage.getItem('skypostnews_user');
        if (stored) {
          const u = JSON.parse(stored);
          u.name = data.name;
          localStorage.setItem('skypostnews_user', JSON.stringify(u));
        }
      }
      toast.success('Profile saved — it now shows on your articles');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to save profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const set = (key: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  if (loading) {
    return <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-400 animate-pulse">Loading profile…</div>;
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-black text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500">This info appears under articles you publish.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-lg shadow-sm p-6 space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <img
            src={getImageSrc(form.avatarUrl, '/logo-square.jpg')}
            alt={form.name || 'Profile photo'}
            onError={onImgError}
            className="w-20 h-20 rounded-full object-cover border-2 border-sky-100 flex-shrink-0"
          />
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 rounded font-bold text-sm text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#0ea5e9' }}
            >
              {uploading ? 'Uploading…' : form.avatarUrl ? 'Change Photo' : 'Upload Photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <p className="text-xs text-gray-400 mt-2">Square photos look best. JPG, PNG or WebP.</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className={labelCls}>Display Name</label>
          <input className={inputCls} value={form.name} onChange={set('name')} required maxLength={100} />
        </div>

        {/* Bio */}
        <div>
          <label className={labelCls}>Bio</label>
          <textarea
            className={inputCls}
            rows={3}
            value={form.bio}
            onChange={set('bio')}
            maxLength={500}
            placeholder="A short bio shown under your articles"
          />
        </div>

        {/* Socials */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Twitter / X URL</label>
            <input className={inputCls} type="url" value={form.socialTwitter} onChange={set('socialTwitter')} placeholder="https://x.com/…" />
          </div>
          <div>
            <label className={labelCls}>Facebook URL</label>
            <input className={inputCls} type="url" value={form.socialFacebook} onChange={set('socialFacebook')} placeholder="https://facebook.com/…" />
          </div>
          <div>
            <label className={labelCls}>Instagram URL</label>
            <input className={inputCls} type="url" value={form.socialInstagram} onChange={set('socialInstagram')} placeholder="https://instagram.com/…" />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-6 py-2 rounded font-bold text-sm text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#e05c1a' }}
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
