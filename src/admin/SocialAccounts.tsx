import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SocialAccounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    platform: 'instagram',
    account_name: '',
    access_token: '',
    platform_user_id: '',
  });
  const token = localStorage.getItem('adminToken');

  const load = async () => {
    const [acc, q] = await Promise.all([
      axios.get(`${API_URL}/api/admin/social/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_URL}/api/admin/social/queue`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    setAccounts(acc.data.data);
    setQueue(q.data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form.access_token) {
      alert('Access token required.');
      return;
    }
    await axios.post(`${API_URL}/api/admin/social/accounts`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setShowForm(false);
    setForm({
      platform: 'instagram',
      account_name: '',
      access_token: '',
      platform_user_id: '',
    });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900">Social Publishing</h1>
          <p className="text-gray-600 text-sm mt-1">
            Connect accounts and auto-publish posts
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gold text-white px-6 py-3 tracking-widest text-sm rounded hover:bg-deepgold"
        >
          + CONNECT ACCOUNT
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 mb-6 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">Connect Social Account</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded outline-none focus:border-gold"
            >
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter / X</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
            </select>
            <input
              type="text"
              placeholder="Account name"
              value={form.account_name}
              onChange={(e) => setForm({ ...form, account_name: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded outline-none focus:border-gold"
            />
            <input
              type="text"
              placeholder="Platform user ID"
              value={form.platform_user_id}
              onChange={(e) =>
                setForm({ ...form, platform_user_id: e.target.value })
              }
              className="px-4 py-3 border border-gray-300 rounded outline-none focus:border-gold"
            />
            <input
              type="password"
              placeholder="Access token"
              value={form.access_token}
              onChange={(e) => setForm({ ...form, access_token: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded outline-none focus:border-gold"
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

      {/* Connected Accounts */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h2 className="font-medium text-gray-900">
            Connected Accounts ({accounts.length})
          </h2>
        </div>
        {accounts.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">No accounts connected yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {accounts.map((acc) => (
              <div key={acc.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {acc.platform.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">{acc.account_name}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    acc.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {acc.is_active ? 'active' : 'inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publish Queue */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h2 className="font-medium text-gray-900">Publishing Queue</h2>
        </div>
        {queue.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">No posts in queue.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 text-xs font-semibold text-gray-700">POST</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-700">PLATFORM</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-700">STATUS</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-700">PUBLISHED</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((q) => (
                <tr key={q.id} className="border-b border-gray-100">
                  <td className="p-3 text-sm text-gray-900">{q.post_title}</td>
                  <td className="p-3 text-sm text-gray-700 uppercase">{q.platform}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        q.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : q.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {q.published_at
                      ? new Date(q.published_at).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}