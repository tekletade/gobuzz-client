import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Comment {
  id: number;
  parent_id: number | null;
  author_name: string;
  content: string;
  created_at: string;
  replies: Comment[];
}

interface CommentsProps {
  postId: number;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [form, setForm] = useState({ name: '', email: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => {
    axios
      .get(`${API_URL}/api/posts/${postId}/comments`)
      .then((res) => setComments(res.data.data))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, [postId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.content) return;

    setSubmitting(true);
    setMessage('');

    try {
      await axios.post(`${API_URL}/api/posts/${postId}/comments`, {
        author_name: form.name,
        author_email: form.email,
        content: form.content,
        visitor_id: localStorage.getItem('visitorId'),
      });

      setForm({ name: '', email: '', content: '' });
      setMessage('Comment submitted. It will appear after moderation.');
      load();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <div key={comment.id} style={{ marginLeft: depth * 20 }} className="mb-4">
      <div className="bg-parchment/5 p-4 border border-parchment/10">
        <p className="text-gold text-sm font-medium mb-1">
          {comment.author_name}
        </p>
        <p className="text-parchment text-sm mb-2">{comment.content}</p>
        <p className="text-xs text-warmgray">
          {new Date(comment.created_at).toLocaleDateString()}
        </p>
      </div>
      {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
    </div>
  );

  return (
    <div className="mt-8 pt-8 border-t border-parchment/10">
      <h3 className="text-lg font-serif text-parchment mb-6">
        Comments ({comments.length})
      </h3>

      {comments.length > 0 && (
        <div className="mb-8">{comments.map((c) => renderComment(c))}</div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-4 py-3 bg-parchment/5 border border-parchment/20 text-parchment text-sm outline-none focus:border-gold"
          />
          <input
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="px-4 py-3 bg-parchment/5 border border-parchment/20 text-parchment text-sm outline-none focus:border-gold"
          />
        </div>
        <textarea
          placeholder="Share your thoughts..."
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 bg-parchment/5 border border-parchment/20 text-parchment text-sm outline-none focus:border-gold"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-gold text-white px-6 py-3 text-sm tracking-widest hover:bg-deepgold transition disabled:opacity-50"
        >
          {submitting ? 'SUBMITTING...' : 'POST COMMENT'}
        </button>

        {message && (
          <p className="text-gold text-xs tracking-widest">{message}</p>
        )}
      </form>
    </div>
  );
}