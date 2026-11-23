import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Subscription {
  id: number;
  visitor_id: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

interface Campaign {
  id: number;
  title: string;
  body: string;
  url: string;
  total_sent: number;
  sent_count: number;
  failed_count: number;
  removed_count: number;
  sent_by_name: string | null;
  created_at: string;
}

export default function PushNotifications() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [form, setForm] = useState({ title: '', body: '', url: '/' });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const token = localStorage.getItem('adminToken');

  const load = async () => {
    try {
      const [subsRes, campaignsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/push/subscriptions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/admin/push/campaigns`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSubs(subsRes.data.data);
      setCampaigns(campaignsRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const send = async () => {
    if (!form.title || !form.body) {
      setMessageType('error');
      setMessage('Title and body are required.');
      return;
    }

    if (!confirm(`Send to all ${activeSubs} subscribers?`)) return;

    setSending(true);
    setMessage('');

    try {
      const res = await axios.post(
        `${API_URL}/api/admin/push/send`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { sent, failed, removed } = res.data.data;

      setMessageType('success');
      setMessage(
        `✓ Sent: ${sent} | Failed: ${failed} | Removed (expired): ${removed}`
      );

      setForm({ title: '', body: '', url: '/' });
      load();
    } catch (err: any) {
      setMessageType('error');
      setMessage(err.response?.data?.message || 'Failed to send.');
    } finally {
      setSending(false);
    }
  };

  const test = async (id: number) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/admin/push/test`,
        { subscriptionId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessageType('success');
      setMessage(`✓ Test sent: ${res.data.data.sent ? 'success' : 'failed'}`);
    } catch (err: any) {
      setMessageType('error');
      setMessage('Test failed.');
    }
  };

  const activeSubs = subs.filter((s) => s.is_active).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-gray-900">
          Push Notifications
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          {activeSubs} active subscriber{activeSubs !== 1 ? 's' : ''} ·{' '}
          {subs.length} total
        </p>
      </div>

      {message && (
        <div
          className={`p-4 mb-6 text-sm rounded ${
            messageType === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Send Form */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="font-medium text-gray-900 mb-4">
            Send Notification
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="New update from Go'Buzz"
                className="w-full px-4 py-3 border border-gray-300 rounded outline-none focus:border-[#86691c] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                Message
              </label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={4}
                placeholder="Opening soon — reserve your spot."
                className="w-full px-4 py-3 border border-gray-300 rounded outline-none focus:border-[#86691c] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                Link URL (optional)
              </label>
              <input
                type="text"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="/"
                className="w-full px-4 py-3 border border-gray-300 rounded outline-none focus:border-[#86691c] text-sm"
              />
            </div>
          </div>

          <button
            onClick={send}
            disabled={sending || activeSubs === 0}
            className="w-full bg-[#86691c] text-white py-3 rounded tracking-widest text-sm hover:bg-[#6b5416] mt-6 disabled:opacity-50"
          >
            {sending
              ? 'SENDING...'
              : `SEND TO ${activeSubs} SUBSCRIBERS`}
          </button>

          {activeSubs === 0 && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              No active subscribers yet. Users need to enable notifications
              on the landing page.
            </p>
          )}
        </div>

        {/* Subscriptions */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="font-medium text-gray-900 mb-4">
            Subscriptions ({subs.length})
          </h2>

          <div className="max-h-96 overflow-y-auto">
            {subs.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No subscribers yet.
              </p>
            ) : (
              <div className="space-y-2">
                {subs.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 text-sm gap-2"
                  >
                    <span className="text-gray-700 font-mono text-xs truncate flex-1">
                      {s.visitor_id.substring(0, 20)}...
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
                        s.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.is_active ? 'active' : 'inactive'}
                    </span>
                    {s.is_active && (
                      <button
                        onClick={() => test(s.id)}
                        className="text-xs text-[#86691c] hover:underline font-medium flex-shrink-0"
                      >
                        Test
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Campaign History */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h2 className="font-medium text-gray-900">Campaign History</h2>
        </div>

        {campaigns.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">No campaigns sent yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">
                    TITLE
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">
                    SENT
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">
                    FAILED
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">
                    REMOVED
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-700">
                    DATE
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-100"
                  >
                    <td className="p-3 text-sm text-gray-900">{c.title}</td>
                    <td className="p-3 text-sm text-green-600 font-medium">
                      {c.sent_count}
                    </td>
                    <td className="p-3 text-sm text-red-600">
                      {c.failed_count}
                    </td>
                    <td className="p-3 text-sm text-gray-500">
                      {c.removed_count}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}