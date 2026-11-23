import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface SocialPost {
  id: number;
  platform: string;
  post_url: string;
  caption: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export default function SocialPosts() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    platform: 'instagram',
    post_url: '',
    caption: '',
    image_url: '',
    display_order: 0,
  });
  const token = localStorage.getItem('adminToken');

  const load = async () => {
    const res = await axios.get(`${API_URL}/api/admin/social-posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPosts(res.data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form.post_url) {
      alert('Post URL is required.');
      return;
    }
    await axios.post(`${API_URL}/api/admin/social-posts`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setShowForm(false);
    setForm({
      platform: 'instagram',
      post_url: '',
      caption: '',
      image_url: '',
      display_order: 0,
    });
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this social post?')) return;
    await axios.delete(`${API_URL}/api/admin/social-posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900">Social Media Posts</h1>
          <p className="text-gray-600 text-sm mt-1">
            Add Instagram, Facebook, TikTok posts to display on your landing page
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gold text-white px-6 py-3 tracking-widest text-sm rounded hover:bg-deepgold"
        >
          + ADD POST
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 mb-6 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">Add Social Post</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded text-gray-900 outline-none focus:border-gold"
            >
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="twitter">Twitter</option>
              <option value="youtube">YouTube</option>
            </select>
            <input
              type="url"
              placeholder="Post URL"
              value={form.post_url}
              onChange={(e) => setForm({ ...form, post_url: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded text-gray-900 outline-none focus:border-gold"
            />
            <input
              type="url"
              placeholder="Image URL (optional)"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded text-gray-900 outline-none focus:border-gold"
            />
            <input
              type="text"
              placeholder="Caption (optional)"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded text-gray-900 outline-none focus:border-gold"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={save}
              className="bg-gold text-white px-6 py-3 rounded text-sm tracking-widest hover:bg-deepgold"
            >
              SAVE
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-3 border border-gray-300 rounded text-sm text-gray-700"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            {post.image_url ? (
              <div
                className="h-40 bg-cover bg-center"
                style={{ backgroundImage: `url(${post.image_url})` }}
              />
            ) : (
              <div className="h-40 bg-gradient-to-br from-gold to-deepgold flex items-center justify-center">
                <span className="text-white text-sm tracking-widest uppercase">
                  {post.platform}
                </span>
              </div>
            )}
            <div className="p-4">
              <p className="text-xs text-gray-600 mb-2">{post.platform}</p>
              {post.caption && (
                <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                  {post.caption}
                </p>
              )}
              <div className="flex gap-2">
                <a
                  href={post.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gold hover:underline"
                >
                  View
                </a>
                <button
                  onClick={() => remove(post.id)}
                  className="text-xs text-red-600 hover:underline ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="bg-white p-12 text-center rounded-lg border border-gray-200">
          <p className="text-gray-500">No social posts yet.</p>
        </div>
      )}
    </div>
  );
}