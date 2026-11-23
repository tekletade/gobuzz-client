import { useEffect, useState } from 'react';
import axios from 'axios';
import RichTextEditor from '../components/RichTextEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Newsletter() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    subject_am: '',
    preview_text: '',
    content: '',
    content_am: '',
    template: 'weekly_digest',
    send_now: false,
  });
  const [sending, setSending] = useState(false);
  const token = localStorage.getItem('adminToken');

  const load = async () => {
    const [subs, camps] = await Promise.all([
      axios.get(`${API_URL}/api/admin/newsletter/subscribers`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_URL}/api/admin/newsletter/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    setSubscribers(subs.data.data);
    setCampaigns(camps.data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form.subject || !form.content) {
      alert('Subject and content required.');
      return;
    }
    setSending(true);
    try {
      await axios.post(`${API_URL}/api/admin/newsletter/campaigns`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowForm(false);
      setForm({
        subject: '',
        subject_am: '',
        preview_text: '',
        content: '',
        content_am: '',
        template: 'weekly_digest',
        send_now: false,
      });
      load();
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-gray-900">Newsletter</h1>
          <p className="text-gray-600 text-sm mt-1">
            {subscribers.length} active subscribers
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gold text-white px-6 py-3 tracking-widest text-sm rounded hover:bg-deepgold"
        >
          + NEW CAMPAIGN
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 mb-6 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">Create Campaign</h3>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Subject (English)"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded outline-none focus:border-gold"
            />
            <input
              type="text"
              placeholder="Subject (Amharic)"
              value={form.subject_am}
              onChange={(e) => setForm({ ...form, subject_am: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded outline-none focus:border-gold"
            />
            <input
              type="text"
              placeholder="Preview text"
              value={form.preview_text}
              onChange={(e) => setForm({ ...form, preview_text: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded outline-none focus:border-gold"
            />

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                Content (English)
              </label>
              <RichTextEditor
                value={form.content}
                onChange={(v) => setForm({ ...form, content: v })}
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.send_now}
                onChange={(e) => setForm({ ...form, send_now: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-900">
                Send immediately to all {subscribers.length} subscribers
              </span>
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={save}
              disabled={sending}
              className="bg-gold text-white px-6 py-3 rounded text-sm tracking-widest hover:bg-deepgold disabled:opacity-50"
            >
              {sending ? 'SAVING...' : form.send_now ? 'SEND NOW' : 'SAVE DRAFT'}
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

      {/* Campaigns */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h2 className="font-medium text-gray-900">Campaigns</h2>
        </div>
        {campaigns.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">No campaigns yet.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 text-xs font-semibold text-gray-700">SUBJECT</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-700">STATUS</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-700">SENT</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-700">RECIPIENTS</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-gray-100">
                  <td className="p-3 text-sm text-gray-900">{c.subject}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        c.status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-700">
                    {c.sent_at ? new Date(c.sent_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3 text-sm text-gray-700">{c.recipients_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Subscribers */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h2 className="font-medium text-gray-900">
            Subscribers ({subscribers.length})
          </h2>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="text-left p-3 text-xs font-semibold text-gray-700">EMAIL</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-700">NAME</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-700">STATUS</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-700">JOINED</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-gray-100">
                  <td className="p-3 text-sm text-gray-900">{s.email}</td>
                  <td className="p-3 text-sm text-gray-700">{s.name || '—'}</td>
                  <td className="p-3 text-xs">
                    <span
                      className={`px-2 py-1 rounded ${
                        s.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(s.subscribed_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}