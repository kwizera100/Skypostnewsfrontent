import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import axios from 'axios';
import { useAdminAuth } from './AdminAuth';
import { resolveUploadUrl } from '../utils/images';

interface Category { id: number; name: string; slug: string; }

function SmartImageUploader({ 
  onInsert, 
  onCancel, 
  token 
}: { 
  onInsert: (url: string, caption: string) => void;
  onCancel: () => void;
  token: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [imageInfo, setImageInfo] = useState<{ name: string; size: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    setUploading(true);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    
    // Smart: Extract image info
    setImageInfo({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type
    });

    const fd = new FormData();
    fd.append('file', file);
    
    try {
      const { data } = await axios.post('/api/upload', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setPreview(resolveUploadUrl(data.url));
      setUploading(false);
    } catch {
      // Fallback: use local object URL
      setPreview(previewUrl);
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleInsert = () => {
    if (preview) {
      onInsert(preview, caption);
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-in slide-in-from-top-2 fade-in duration-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Insert Image
        </h3>
        <button onClick={onCancel} className="text-white/80 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        {!preview ? (
          <div className="space-y-4">
            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
                dragActive 
                  ? 'border-orange-400 bg-orange-50 scale-[1.02] shadow-lg' 
                  : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    {uploading ? 'Uploading...' : dragActive ? 'Drop image here' : 'Click or drag image'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Smart Tips
              </p>
              <ul className="text-xs text-blue-600 space-y-1 ml-4">
                <li>• Drag & drop images anywhere in editor</li>
                <li>• Add captions for better SEO</li>
                <li>• Images auto-optimize on upload</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-sm">
              <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
              <button
                onClick={() => { setPreview(null); setCaption(''); setImageInfo(null); }}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-sm font-semibold">Uploading...</div>
                </div>
              )}
            </div>

            {/* Smart Image Info */}
            {imageInfo && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Filename</span>
                  <span className="text-gray-700 font-medium truncate max-w-48">{imageInfo.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Size</span>
                  <span className="text-gray-700 font-medium">{imageInfo.size}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Type</span>
                  <span className="text-gray-700 font-medium">{imageInfo.type}</span>
                </div>
              </div>
            )}
            
            {/* Caption Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Caption (optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Describe your image for accessibility..."
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">Good captions improve SEO and accessibility</p>
            </div>

            {/* Insert Button */}
            <button
              onClick={handleInsert}
              disabled={uploading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Insert Image
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SmartYouTubeUploader({ 
  onInsert, 
  onCancel 
}: { 
  onInsert: (videoId: string) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);

  const extractVideoId = (youtubeUrl: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&?/]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
      const match = youtubeUrl.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    const id = extractVideoId(newUrl);
    setVideoId(id);
  };

  const handleInsert = () => {
    if (videoId) {
      onInsert(videoId);
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-in slide-in-from-top-2 fade-in duration-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Insert YouTube Video
        </h3>
        <button onClick={onCancel} className="text-white/80 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* URL Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            YouTube URL
          </label>
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
          <p className="text-xs text-gray-400 mt-1">Paste any YouTube video URL or embed link</p>
        </div>

        {/* Thumbnail Preview */}
        {videoId && (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-sm">
              <img 
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                alt="Video thumbnail"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Video ID</span>
                <span className="text-gray-700 font-medium">{videoId}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Status</span>
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Ready to insert
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Insert Button */}
        <button
          onClick={handleInsert}
          disabled={!videoId}
          className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Insert Video
        </button>
      </div>
    </div>
  );
}

function EditorToolbar({ editor, token }: { editor: any; token: string }) {
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showYouTubeUploader, setShowYouTubeUploader] = useState(false);
  const imageButtonRef = useRef<HTMLButtonElement>(null);
  const youtubeButtonRef = useRef<HTMLButtonElement>(null);

  if (!editor) return null;
  const btn = (action: () => void, label: string, active?: boolean) => (
    <button type="button" onClick={action}
      className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}>
      {label}
    </button>
  );

  const handleImageInsert = (url: string, caption: string) => {
    let html = `<figure class="my-6"><img src="${url}" alt="${caption || ''}" class="w-full rounded-xl shadow-lg" />`;
    if (caption) html += `<figcaption class="text-center text-sm text-gray-500 mt-3 italic font-medium">${caption}</figcaption>`;
    html += `</figure>`;
    editor.chain().focus().insertContent(html).run();
    setShowImageUploader(false);
  };

  const handleYouTubeInsert = (videoId: string) => {
    const html = `<p><iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen class="rounded-xl shadow-lg my-6"></iframe></p>`;
    editor.chain().focus().insertContent(html).run();
    setShowYouTubeUploader(false);
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1 p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        {btn(() => editor.chain().focus().toggleBold().run(), 'Bold', editor.isActive('bold'))}
        {btn(() => editor.chain().focus().toggleItalic().run(), 'Italic', editor.isActive('italic'))}
        {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2', editor.isActive('heading', { level: 2 }))}
        {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3', editor.isActive('heading', { level: 3 }))}
        {btn(() => editor.chain().focus().toggleBulletList().run(), '• List', editor.isActive('bulletList'))}
        {btn(() => editor.chain().focus().toggleOrderedList().run(), '1. List', editor.isActive('orderedList'))}
        {btn(() => editor.chain().focus().toggleBlockquote().run(), 'Quote', editor.isActive('blockquote'))}
        
        <div className="relative">
          <button
            ref={imageButtonRef}
            type="button"
            onClick={() => { setShowImageUploader(!showImageUploader); setShowYouTubeUploader(false); }}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              showImageUploader
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            🖼 Image
          </button>
          {showImageUploader && (
            <SmartImageUploader
              onInsert={handleImageInsert}
              onCancel={() => setShowImageUploader(false)}
              token={token}
            />
          )}
        </div>

        <div className="relative">
          <button
            ref={youtubeButtonRef}
            type="button"
            onClick={() => { setShowYouTubeUploader(!showYouTubeUploader); setShowImageUploader(false); }}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              showYouTubeUploader
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            ▶ YouTube
          </button>
          {showYouTubeUploader && (
            <SmartYouTubeUploader
              onInsert={handleYouTubeInsert}
              onCancel={() => setShowYouTubeUploader(false)}
            />
          )}
        </div>

        {btn(() => editor.chain().focus().undo().run(), '↩ Undo')}
        {btn(() => editor.chain().focus().redo().run(), '↪ Redo')}
      </div>
    </div>
  );
}

export default function AdminArticleEditor() {
  const { token } = useAdminAuth();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle]           = useState('');
  const [excerpt, setExcerpt]       = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [published, setPublished]   = useState(false);
  const [thumbUrl, setThumbUrl]     = useState('');
  const [readTime, setReadTime]     = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [thumbPreview, setThumbPreview] = useState('');
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [editorDragActive, setEditorDragActive] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Image.configure({
      HTMLAttributes: {
        class: 'w-full rounded-lg shadow-md my-4',
      },
    }), Link.configure({ openOnClick: false })],
    content: '',
    editorProps: {
      attributes: { class: 'prose prose-sm max-w-none p-4 min-h-48 focus:outline-none' },
    },
  });

  // Fetch categories
  useEffect(() => {
    axios.get('/api/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  // Load article if editing
  useEffect(() => {
    if (!isEdit || !id) return;
    axios.get(`/api/articles/by-id/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .catch(() => axios.get(`/api/articles?pageSize=200`).then(r => {
        const a = (r.data.data || r.data).find((x: any) => x.id === parseInt(id));
        if (!a) throw new Error('Not found');
        return { data: a };
      }))
      .then(r => {
        const a = r.data;
        setTitle(a.title || '');
        setExcerpt(a.excerpt || '');
        setCategoryId(a.category?.id || '');
        setPublished(a.published ?? false);
        setThumbUrl(a.thumbnailUrl || a.imageUrl || '');
        setThumbPreview(a.thumbnailUrl || a.imageUrl || '');
        setReadTime(a.readTime || 1);
        if (editor && a.content) editor.commands.setContent(a.content);
      })
      .catch(() => setError('Failed to load article'));
  }, [id, isEdit, editor]);

  const handleThumbUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await axios.post('/api/upload', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setThumbUrl(data.url);
      setThumbPreview(resolveUploadUrl(data.url));
    } catch {
      // Fallback: use local object URL
      const url = URL.createObjectURL(file);
      setThumbPreview(url);
      setThumbUrl(url);
    } finally {
      setUploadingThumb(false);
    }
  }, [token]);

  const handleEditorDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setEditorDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    // Upload the dropped image
    const fd = new FormData();
    fd.append('file', file);
    
    try {
      const { data } = await axios.post('/api/upload', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      const url = resolveUploadUrl(data.url);
      
      // Insert image at cursor position
      if (editor) {
        const html = `<figure class="my-6"><img src="${url}" alt="" class="w-full rounded-xl shadow-lg" /></figure>`;
        editor.chain().focus().insertContent(html).run();
      }
    } catch {
      // Fallback: use local object URL
      const url = URL.createObjectURL(file);
      if (editor) {
        const html = `<figure class="my-6"><img src="${url}" alt="" class="w-full rounded-xl shadow-lg" /></figure>`;
        editor.chain().focus().insertContent(html).run();
      }
    }
  }, [editor, token]);

  const handleEditorDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setEditorDragActive(true);
    } else if (e.type === 'dragleave') {
      setEditorDragActive(false);
    }
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !categoryId || !editor) return;
    setError('');
    setSaving(true);

    const payload = {
      title: title.trim(),
      excerpt: excerpt.trim() || title.slice(0, 200),
      content: editor.getHTML(),
      categoryId: Number(categoryId),
      published,
      readTime,
      thumbnailUrl: thumbUrl || null,
      imageUrl: thumbUrl || null,
      ...(published && !isEdit ? { publishedAt: new Date().toISOString() } : {}),
    };

    try {
      if (isEdit) {
        await axios.put(`/api/articles/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('/api/articles', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate('/admin/articles');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-900">{isEdit ? 'Edit Article' : 'New Article'}</h1>
        <button onClick={() => navigate('/admin/articles')}
          className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Articles
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main fields */}
          <div className="md:col-span-2 space-y-4">
            {/* Title */}
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} required
                  placeholder="Enter article title…"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Excerpt</label>
                <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2}
                  placeholder="Short description shown in article cards…"
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-orange-500" />
              </div>
            </div>

            {/* Rich text editor */}
            <div 
              className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 ${
                editorDragActive ? 'ring-2 ring-orange-400 ring-offset-2 scale-[1.01]' : ''
              }`}
              onDragEnter={handleEditorDrag}
              onDragLeave={handleEditorDrag}
              onDragOver={handleEditorDrag}
              onDrop={handleEditorDrop}
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <label className="text-xs font-bold text-gray-700">Content *</label>
              </div>
              <EditorToolbar editor={editor} token={token} />
              <div className="relative">
                <EditorContent editor={editor} />
                {editorDragActive && (
                  <div className="absolute inset-0 bg-orange-50/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-orange-700">Drop image to insert</p>
                      <p className="text-xs text-orange-600 mt-1">Image will be uploaded and inserted at cursor position</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar options */}
          <div className="space-y-4">
            {/* Featured Image - Prominent */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Featured Image
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {thumbPreview ? (
                  <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                    <img src={thumbPreview} alt="preview"
                      className="w-full h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setThumbUrl(''); setThumbPreview(''); }}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-orange-400 hover:bg-orange-50 transition-all">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-gray-700">
                        {uploadingThumb ? 'Uploading...' : 'Click to upload image'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleThumbUpload} className="hidden" />
                  </label>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">or URL:</span>
                  <input value={thumbUrl} onChange={e => { 
                    const url = e.target.value;
                    setThumbUrl(url); 
                    setThumbPreview(resolveUploadUrl(url)); 
                  }}
                    placeholder="https://…"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
                </div>
              </div>
            </div>

            {/* Publish */}
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Publish</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)}
                  className="rounded" />
                <span className="text-sm font-medium text-gray-700">
                  {published ? '✅ Published' : '🟡 Draft'}
                </span>
              </label>
              <button type="submit" disabled={saving}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-opacity disabled:opacity-60 shadow-lg shadow-orange-500/25"
                style={{ backgroundColor: '#e05c1a' }}>
                {saving ? 'Saving…' : isEdit ? 'Update Article' : 'Publish Article'}
              </button>
            </div>

            {/* Category */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <label className="block text-xs font-bold text-gray-700 mb-2">Category *</label>
              <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all">
                <option value="">Select category…</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Read time */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <label className="block text-xs font-bold text-gray-700 mb-2">Read Time (minutes)</label>
              <input type="number" min={1} max={60} value={readTime}
                onChange={e => setReadTime(parseInt(e.target.value) || 1)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
