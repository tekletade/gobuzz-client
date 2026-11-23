import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function NewPostBadge() {
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    const lastSeen = localStorage.getItem('lastSeenPost');
    axios
      .get(`${API_URL}/api/posts?limit=1`)
      .then((res) => {
        const latest = res.data.data[0];
        if (latest && (!lastSeen || new Date(latest.published_at) > new Date(lastSeen))) {
          setHasNew(true);
        }
      })
      .catch(() => {});
  }, []);

  if (!hasNew) return null;

  return (
    <a
      href="#posts"
      className="fixed bottom-6 right-6 z-40 bg-gold text-white px-5 py-3 rounded-full shadow-lg hover:bg-deepgold transition flex items-center gap-2"
      onClick={() => localStorage.setItem('lastSeenPost', new Date().toISOString())}
    >
      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
      <span className="text-xs font-semibold tracking-widest">NEW UPDATE</span>
    </a>
  );
}