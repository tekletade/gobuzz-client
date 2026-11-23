import { useEffect, useState } from 'react';
import axios from 'axios';
import ImageUpload from '../components/ImageUpload';
import RichTextEditor from '../components/RichTextEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ==================================================
// TYPES
// ==================================================

interface Post {
  id: number;
  title: string;
  title_am: string | null;
  content: string;
  content_am: string | null;
  excerpt: string | null;
  excerpt_am: string | null;
  category: string;
  status: string;
  is_featured: boolean;
  image_url: string | null;
  video_url: string | null;
  published_at: string | null;
  created_at: string;
  scheduled_for: string | null;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-500',
};

// ==================================================
// HELPERS
// ==================================================
function getImageUrl(url: string | null) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

// ==================================================
// MAIN COMPONENT
// ==================================================

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');

  const loadPosts = async () => {
    setLoading(true);
    try {
      const url = `${API_URL}/api/admin/posts${filter ? `?status=${filter}` : ''}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data.data);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const handleSave = async (data: any) => {
    if (editing) {
      await axios.patch(`${API_URL}/api/admin/posts/${editing.id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await axios.post(`${API_URL}/api/admin/posts`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    setEditing(null);
    setShowForm(false);
    loadPosts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    await axios.delete(`${API_URL}/api/admin/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadPosts();
  };

  const toggleStatus = async (post: Post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    await axios.patch(
      `${API_URL}/api/admin/posts/${post.id}`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadPosts();
  };

  return (
    <div className="pb-12">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900">
            Posts & Announcements
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Create and manage updates displayed on the landing page
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="bg-[#86691c] text-white px-6 py-3 tracking-widest text-sm rounded shadow-sm hover:bg-[#6b5416] transition"
        >
          + NEW POST
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 mb-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-900 outline-none focus:border-[#86691c]"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
          <option value="scheduled">Scheduled</option>
        </select>
        <span className="text-sm text-gray-500">{posts.length} posts found</span>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <PostForm
          post={editing}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {/* POSTS LIST */}
      {loading ? (
        <div className="text-center p-12 text-gray-500">Loading posts...</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition flex gap-6 items-center"
            >
              {/* Thumbnail */}
              <div className="w-40 h-28 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden border border-gray-200">
                {post.image_url ? (
                  <img
                    src={getImageUrl(post.image_url)}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No Image
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${statusColors[post.status]}`}>
                    {post.status}
                  </span>
                  <span className="text-[10px] text-gray-600 bg-gray-100 px-2 py-1 rounded uppercase tracking-wider font-semibold">
                    {post.category}
                  </span>
                  {post.is_featured && (
                    <span className="text-[10px] text-[#86691c] font-bold tracking-wider bg-[#86691c]/10 px-2 py-1 rounded">
                      ★ FEATURED
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-serif text-gray-900 truncate">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                  {post.excerpt || stripHtml(post.content).substring(0, 160)}
                </p>
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  {post.published_at
                    ? `Published: ${new Date(post.published_at).toLocaleDateString()}`
                    : `Created: ${new Date(post.created_at).toLocaleDateString()}`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0 border-l border-gray-100 pl-6 min-w-[140px]">
                <button
                  onClick={() => toggleStatus(post)}
                  className={`text-xs px-4 py-2 rounded border font-medium transition ${
                    post.status === 'published'
                      ? 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      : 'border-green-500 text-green-700 hover:bg-green-50'
                  }`}
                >
                  {post.status === 'published' ? 'Unpublish' : 'Publish Now'}
                </button>
                <button
                  onClick={() => {
                    setEditing(post);
                    setShowForm(true);
                  }}
                  className="text-xs bg-gray-100 text-gray-800 px-4 py-2 rounded font-medium hover:bg-gray-200 transition"
                >
                  Edit Post
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-xs text-red-600 hover:underline px-4 py-1 text-center font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="bg-white p-16 text-center rounded-lg border border-gray-200">
              <p className="text-gray-500">No posts found. Create your first announcement.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==================================================
// POST FORM COMPONENT (Updated)
// ==================================================

function PostForm({
  post,
  onSave,
  onCancel,
}: {
  post: Post | null;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: post?.title || '',
    title_am: post?.title_am || '',
    content: post?.content || '',
    content_am: post?.content_am || '',
    excerpt: post?.excerpt || '',
    excerpt_am: post?.excerpt_am || '',
    image_url: post?.image_url || '',
    video_url: post?.video_url || '',
    category: post?.category || 'news',
    status: post?.status || 'draft',
    is_featured: post?.is_featured || false,
    scheduled_for: post?.scheduled_for || '',
  });
  
  const [saving, setSaving] = useState(false);

  const update = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const submit = async () => {
    if (!form.title || !form.content) {
      alert('Title and Content (English) are required.');
      return;
    }
    setSaving(true);
    try {
      // Clean the payload before sending to the backend
      const payload = {
        ...form,
        is_featured: Boolean(form.is_featured), // Ensure strict boolean
      };
      await onSave(payload);
    } catch (error) {
      alert('Failed to save. Check console for details.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-5xl w-full my-8 shadow-2xl flex flex-col h-[85vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
          <h2 className="text-2xl font-serif text-gray-900">
            {post ? 'Edit Post' : 'Create New Post'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-900 text-3xl leading-none transition"
          >
            &times;
          </button>
        </div>

        {/* BODY - Two Columns */}
        <div className="flex-1 overflow-hidden flex">
          
          {/* LEFT COLUMN - Main Content */}
          <div className="w-2/3 p-6 overflow-y-auto space-y-6 border-r border-gray-200">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Title (English) *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Enter a clear, catchy title..."
                className="w-full px-4 py-3 border border-gray-300 rounded focus:border-[#86691c] focus:ring-1 focus:ring-[#86691c] outline-none text-lg font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Title (Amharic)
              </label>
              <input
                type="text"
                value={form.title_am}
                onChange={(e) => update('title_am', e.target.value)}
                placeholder="የአማርኛ ርዕስ..."
                className="w-full px-4 py-3 border border-gray-300 rounded focus:border-[#86691c] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Short Excerpt (For card preview)
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => update('excerpt', e.target.value)}
                rows={2}
                placeholder="A brief summary shown on the landing page..."
                className="w-full px-4 py-3 border border-gray-300 rounded focus:border-[#86691c] outline-none text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Main Content (English) *
              </label>
              <RichTextEditor
                value={form.content}
                onChange={(v) => update('content', v)}
                placeholder="Write the full post content here..."
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Main Content (Amharic)
              </label>
              <RichTextEditor
                value={form.content_am}
                onChange={(v) => update('content_am', v)}
                placeholder="የአማርኛ ይዘት እዚህ ይጻፉ..."
              />
            </div>
          </div>

          {/* RIGHT COLUMN - Settings & Preview */}
          <div className="w-1/3 bg-gray-50 p-6 overflow-y-auto space-y-6">
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">Publish Settings</h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => update('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#86691c]"
                >
                  <option value="draft">Draft (Hidden)</option>
                  <option value="published">Publish Now (Live)</option>
                  <option value="scheduled">Schedule</option>
                </select>
              </div>

              {form.status === 'scheduled' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={form.scheduled_for}
                    onChange={(e) => update('scheduled_for', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#86691c]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#86691c]"
                >
                  <option value="news">News</option>
                  <option value="promotion">Promotion</option>
                  <option value="update">Update</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => update('is_featured', e.target.checked)}
                  className="w-4 h-4 accent-[#86691c]"
                />
                <span className="text-sm font-medium text-gray-800">
                  Feature on Landing Page
                </span>
              </label>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4 shadow-sm">
               <h3 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">Media</h3>
               <ImageUpload
                  label="Featured Image"
                  value={form.image_url}
                  onChange={(url) => update('image_url', url)}
                />
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Video URL (YouTube/Vimeo)</label>
                  <input
                    type="url"
                    value={form.video_url}
                    onChange={(e) => update('video_url', e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#86691c]"
                  />
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
               <div className="bg-[#1b1710] px-4 py-2 text-xs font-bold text-[#86691c] tracking-widest uppercase">
                 Live Card Preview
               </div>
               <div className="p-4">
                 {form.image_url && (
                   <div className="h-32 bg-gray-100 rounded mb-3 overflow-hidden">
                     <img src={getImageUrl(form.image_url)} className="w-full h-full object-cover" />
                   </div>
                 )}
                 <span className="text-[10px] text-[#86691c] font-bold uppercase tracking-wider">{form.category}</span>
                 <h4 className="font-serif text-lg text-gray-900 leading-tight mt-1">{form.title || 'Post Title'}</h4>
                 <p className="text-xs text-gray-500 mt-2 line-clamp-3">{form.excerpt || 'Excerpt will appear here...'}</p>
               </div>
            </div>

          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-8 py-2 bg-[#86691c] text-white rounded text-sm font-medium tracking-wider hover:bg-[#6b5416] transition disabled:opacity-50"
          >
            {saving ? 'SAVING...' : post ? 'SAVE CHANGES' : 'PUBLISH POST'}
          </button>
        </div>

      </div>
    </div>
  );
}