import { useEffect, useState } from 'react';
import { categoriesApi } from '../api/endpoints';
import type { Category } from '../types';
import toast from 'react-hot-toast';

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const PRESET_COLORS = [
  '#0ea5e9', '#0284c7', '#075985', '#ef4444', '#f97316', '#84cc16',
  '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1', '#f59e0b', '#10b981',
];

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#0ea5e9');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getAll();
      setCategories(res.data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) setSlug(slugify(val));
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setColor('#0ea5e9');
    setEditingId(null);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setColor(cat.color);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: name.trim(), slug: slug.trim(), description: description.trim() || undefined, color };
      if (editingId) {
        await categoriesApi.update(editingId, payload);
        toast.success('Category updated');
      } else {
        await categoriesApi.create(payload);
        toast.success('Category created');
      }
      resetForm();
      await fetchCategories();
    } catch (err: any) {
      const msg = err?.response?.data?.error || `Failed to ${editingId ? 'update' : 'create'} category`;
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this category? Articles must be reassigned first.')) return;
    try {
      await categoriesApi.delete(id);
      toast.success('Category deleted');
      await fetchCategories();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to delete category';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Categories</h1>

      {/* Create form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3 max-w-xl">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="e.g. Technology"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="e.g. technology"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Short description"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-7 h-7 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
              title="Custom color"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2 rounded transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : (editingId ? 'Update Category' : 'Create Category')}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Slug</th>
              <th className="px-4 py-3 text-left font-semibold">Color</th>
              <th className="px-4 py-3 text-left font-semibold">Articles</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">Loading…</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No categories found</td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block w-4 h-4 rounded-full align-middle mr-1 border border-gray-200" style={{ backgroundColor: cat.color }} />
                    <span className="text-gray-500 text-xs">{cat.color}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{cat._count?.articles ?? 0}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-sky-600 hover:text-sky-800 text-xs font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
