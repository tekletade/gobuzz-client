import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Comment {
  id: number;
  post_id: number;
  author_name: string;
  author_email: string;
  content: string;
  status: string;
  post_title: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  spam: 'bg-red-100 text-red-800',
  rejected: 'bg-gray-100 text-gray-800',
};

export default function CommentsModeration() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState('pending');
  const token = localStorage.getItem('adminToken');

  const load = async () => {
    const res = await axios.get(
      `${API_URL}/api/admin/comments${filter ? `?status=${filter}` : ''}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setComments(res.data.data);
  };

  useEffect(() => {
    load();
  }, [filter]);

  const update = async (id: number, status: string) => {
    await axios.patch(
      `${API_URL}/api/admin/comments/${id}`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this comment?')) return;
    await axios.delete(`${API_URL}/api/admin/comments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-gray-900">Comments Moderation</h1>
        <p className="text-gray-600 text-sm mt-1">
          Approve, reject, or delete visitor comments
        </p>
      </div>

      <div className="bg-white p-4 mb-6 rounded-lg border border-gray-200 flex gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded text-sm text-gray-900 outline-none focus:border-gold"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="spam">Spam</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {comment.author_name}
                </p>
                <p className="text-xs text-gray-500">{comment.author_email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  on: {comment.post_title}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded ${
                  statusColors[comment.status]
                }`}
              >
                {comment.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-4">{comment.content}</p>
            <div className="flex gap-2 text-xs">
              {comment.status !== 'approved' && (
                <button
                  onClick={() => update(comment.id, 'approved')}
                  className="text-green-600 hover:underline font-medium"
                >
                  Approve
                </button>
              )}
              {comment.status !== 'rejected' && (
                <button
                  onClick={() => update(comment.id, 'rejected')}
                  className="text-gray-600 hover:underline font-medium"
                >
                  Reject
                </button>
              )}
              {comment.status !== 'spam' && (
                <button
                  onClick={() => update(comment.id, 'spam')}
                  className="text-red-600 hover:underline font-medium"
                >
                  Mark Spam
                </button>
              )}
              <button
                onClick={() => remove(comment.id)}
                className="text-red-600 hover:underline font-medium ml-auto"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="bg-white p-12 text-center rounded-lg border border-gray-200">
            <p className="text-gray-500">No comments.</p>
          </div>
        )}
      </div>
    </div>
  );
}