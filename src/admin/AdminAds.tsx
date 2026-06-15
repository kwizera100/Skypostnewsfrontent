import { useEffect, useState, useRef } from 'react';
import { useAdminAuth } from './AdminAuth';
import { adsApi, type AdBanner } from '../api/endpoints';
import { API_ORIGIN } from '../api/client';
import toast from 'react-hot-toast';
import axios from 'axios';

const POSITIONS = ['left', 'center', 'right'] as const;
const POS_LABELS: Record<string, string> = {
  left: 'Left Banner',
  center: 'Center Banner',
  right: 'Right Banner',
};

function resolveUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
  return url;
}

export default function AdminAds() {
  const { token } = useAdminAuth();
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingPos, setSavingPos] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await adsApi.getAllAdmin();
      setBanners(res.data || []);
    } catch {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const getBanner = (pos: string) => banners.find(b => b.position === pos);

  const handleUpload = async (position: string, file: File) => {
    if (!file) return;
    setSavingPos(position);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post(`${API_ORIGIN}/api/upload`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const url: string = res.data.url;
      await saveBanner(position, { imageUrl: url });
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Upload failed');
    } finally {
      setSavingPos(null);
    }
  };

  const saveBanner = async (position: string, patch: Partial<AdBanner>) => {
    const existing = getBanner(position);
    const payload = {
      imageUrl: patch.imageUrl ?? existing?.imageUrl ?? '',
      linkUrl: patch.linkUrl !== undefined ? patch.linkUrl : (existing?.linkUrl ?? ''),
      altText: patch.altText !== undefined ? patch.altText : (existing?.altText ?? ''),
      width: patch.width !== undefined ? patch.width : (existing?.width ?? 100),
      height: patch.height !== undefined ? patch.height : (existing?.height ?? 90),
      active: patch.active !== undefined ? patch.active : (existing?.active ?? true),
      sortOrder: patch.sortOrder !== undefined ? patch.sortOrder : (existing?.sortOrder ?? 0),
    };
    try {
      await adsApi.update(position, payload);
      await fetchBanners();
    } catch {
      toast.error('Failed to save banner');
    }
  };

  const toggleActive = async (position: string) => {
    const b = getBanner(position);
    if (!b) {
      toast.error('Upload an image first before toggling');
      return;
    }
    setSavingPos(position);
    await saveBanner(position, { active: !b.active });
    setSavingPos(null);
    toast.success(b.active ? 'Banner hidden from site' : 'Banner is now visible');
  };

  const removeBanner = async (position: string) => {
    if (!confirm(`Delete the ${POS_LABELS[position]}?`)) return;
    setSavingPos(position);
    try {
      await adsApi.delete(position);
      setBanners(prev => prev.filter(b => b.position !== position));
      toast.success('Banner removed');
    } catch {
      toast.error('Failed to remove banner');
    } finally {
      setSavingPos(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Ad Banners</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage the three header ad banners. Upload images (recommended size 400×90px). The right slot shows a "Advertise with us" box by default.
        </p>
      </div>

      {loading && banners.length === 0 ? (
        <div className="text-sm text-gray-400 animate-pulse">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {POSITIONS.map(pos => {
            const b = getBanner(pos);
            const isSaving = savingPos === pos;
            return (
              <div key={pos} className="bg-white rounded-lg shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 text-sm">{POS_LABELS[pos]}</h2>
                  {b && (
                    <button
                      onClick={() => toggleActive(pos)}
                      disabled={isSaving}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
                        b.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {b.active ? 'Visible' : 'Hidden'}
                    </button>
                  )}
                </div>

                {/* Preview */}
                <div className="border border-gray-200 rounded bg-gray-50 flex items-center justify-center overflow-hidden" style={{ height: 100 }}>
                  {b?.imageUrl ? (
                    <img
                      src={resolveUrl(b.imageUrl)}
                      alt={b.altText || POS_LABELS[pos]}
                      className="w-full h-full object-contain"
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No image</span>
                  )}
                </div>

                {/* File upload */}
                <div>
                  <input
                    ref={el => { fileRefs.current[pos] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(pos, file);
                      e.target.value = '';
                    }}
                  />
                  <button
                    onClick={() => fileRefs.current[pos]?.click()}
                    disabled={isSaving}
                    className="w-full text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-md transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Uploading…' : 'Upload / Replace Image'}
                  </button>
                </div>

                {/* Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Link URL (optional)</label>
                    <input
                      type="text"
                      defaultValue={b?.linkUrl || ''}
                      onBlur={e => saveBanner(pos, { linkUrl: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Alt text</label>
                    <input
                      type="text"
                      defaultValue={b?.altText || ''}
                      onBlur={e => saveBanner(pos, { altText: e.target.value })}
                      placeholder="Banner description"
                      className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-sky-400"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Width %</label>
                      <input
                        type="number"
                        defaultValue={b?.width ?? 100}
                        onBlur={e => saveBanner(pos, { width: parseInt(e.target.value) || 100 })}
                        className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-sky-400"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Height px</label>
                      <input
                        type="number"
                        defaultValue={b?.height ?? 90}
                        onBlur={e => saveBanner(pos, { height: parseInt(e.target.value) || 90 })}
                        className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>
                </div>

                {b && (
                  <button
                    onClick={() => removeBanner(pos)}
                    disabled={isSaving}
                    className="w-full text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md transition-colors"
                  >
                    Remove Banner
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 text-sm text-sky-800">
        <p className="font-semibold mb-1">How it works:</p>
        <ul className="list-disc list-inside space-y-0.5 text-xs">
          <li>Upload an image for each banner slot. Recommended size: 400×90 pixels.</li>
          <li>Set a link URL if you want the banner to be clickable.</li>
          <li>Toggle visibility to show or hide banners without deleting them.</li>
          <li>The right slot defaults to an "Advertise with us" text box if no image is uploaded.</li>
        </ul>
      </div>
    </div>
  );
}
