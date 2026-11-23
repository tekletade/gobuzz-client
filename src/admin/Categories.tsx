import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Category {
  id: number;
  name: string;
  name_am: string | null;
  slug: string;
  color: string;
  display_order: number;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  post_count?: number;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const token = localStorage.getItem('adminToken');

  const load = async () => {
    const res = await axios.get(`${API_URL}/api/admin/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCategories(res.data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (data: any) => {
    if (editing) {
      await axios.patch(`${API_URL}/api/admin/categories/${editing.id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await axios.post(`${API_URL}/api/admin/categories`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    await axios.delete(`${API_URL}/api/admin/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900">Categories</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage post categories and their colors
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="bg-gold text-white px-6 py-3 tracking-widest text-sm rounded hover:bg-deepgold"
        >
          + NEW CATEGORY
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-6 rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{cat.icon || '📁'}</span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{cat.name}</h3>
            {cat.name_am && (
              <p className="text-sm text-gray-600">{cat.name_am}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">slug: {cat.slug}</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setEditing(cat);
                  setShowForm(true);
                }}
                className="text-gold text-xs hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => remove(cat.id)}
                className="text-red-600 text-xs hover:underline ml-auto"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <CategoryForm
          category={editing}
          onSave={save}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function CategoryForm({
  category,
  onSave,
  onCancel,
}: {
  category: Category | null;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: category?.name || '',
    name_am: category?.name_am || '',
    slug: category?.slug || '',
    color: category?.color || '#86691c',
    icon: category?.icon || '',
    description: category?.description || '',
    display_order: category?.display_order || 0,
  });

  const submit = async () => {
    if (!form.name || !form.slug) {
      alert('Name and slug required.');
      return;
    }
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-8">
        <h2 className="text-2xl font-serif text-gray-900 mb-6">
          {category ? 'Edit Category' : 'New Category'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Name (English) *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Name (Amharic)
            </label>
            <input
              type="text"
              value={form.name_am}
              onChange={(e) => setForm({ ...form, name_am: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Slug
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                Color
              </label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full h-12 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                Icon (emoji)
              </label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="📰"
                className="w-full px-4 py-3 border border-gray-300 rounded outline-none focus:border-gold text-2xl text-center"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={submit}
            className="flex-1 bg-gold text-white py-3 rounded tracking-widest text-sm hover:bg-deepgold"
          >
            {category ? 'UPDATE' : 'CREATE'}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded text-sm text-gray-700"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}