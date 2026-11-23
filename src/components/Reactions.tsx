import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const reactionEmojis: Record<string, string> = {
  like: '👍',
  love: '❤️',
  fire: '🔥',
  wow: '😮',
  clap: '👏',
  star: '⭐',
};

const reactions = Object.keys(reactionEmojis);

interface ReactionsProps {
  postId: number;
}

export default function Reactions({ postId }: ReactionsProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);

  const visitorId = localStorage.getItem('visitorId');

  const load = () => {
    axios
      .get(`${API_URL}/api/posts/${postId}/reactions?visitor_id=${visitorId}`)
      .then((res) => {
        setCounts(res.data.data.counts);
        setUserReactions(res.data.data.userReactions);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, [postId]);

  const toggle = async (type: string) => {
    await axios.post(`${API_URL}/api/posts/${postId}/reactions`, {
      reaction_type: type,
      visitor_id: visitorId,
    });
    load();
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {reactions.map((type) => (
        <button
          key={type}
          onClick={() => toggle(type)}
          className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs transition ${
            userReactions.includes(type)
              ? 'bg-gold text-white border-gold'
              : 'border-parchment/30 text-parchment hover:border-gold hover:text-gold'
          }`}
        >
          <span>{reactionEmojis[type]}</span>
          {counts[type] > 0 && <span>{counts[type]}</span>}
        </button>
      ))}
    </div>
  );
}