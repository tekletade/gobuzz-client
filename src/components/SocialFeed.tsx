import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import PulseLine from './PulseLine';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface SocialPost {
  id: number;
  platform: string;
  post_url: string;
  embed_code: string | null;
  caption: string | null;
  image_url: string | null;
  posted_at: string;
}

const platformIcons: Record<string, string> = {
  instagram: '📷 Instagram',
  facebook: '👥 Facebook',
  tiktok: '🎵 TikTok',
  twitter: '🐦 Twitter',
  youtube: '▶️ YouTube',
};

const platformColors: Record<string, string> = {
  instagram: 'from-purple-500 to-pink-500',
  facebook: 'from-blue-600 to-blue-400',
  tiktok: 'from-black to-gray-800',
  twitter: 'from-sky-500 to-sky-400',
  youtube: 'from-red-600 to-red-500',
};

export default function SocialFeed() {
  const { i18n } = useTranslation();
  const [posts, setPosts] = useState<SocialPost[]>([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/posts/social`).then((res) => setPosts(res.data.data)).catch(() => {});
  }, []);

  if (posts.length === 0) return null;
  const isAmharic = i18n.language === 'am';

  return (
    <section className="bg-white dark:bg-ink text-ink dark:text-parchment transition-colors duration-300">
      <PulseLine />
      <div className="py-12 md:py-20 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <p className="text-gold tracking-[0.3em] text-[10px] md:text-sm mb-3 md:mb-4 uppercase font-semibold">
            {isAmharic ? 'በማህበራዊ ሚዲያ' : 'ON SOCIAL MEDIA'}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif mb-3 md:mb-4">
            {isAmharic ? 'ይከተሉን' : 'Follow Us'}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {posts.map((post, index) => (
            <motion.a
              key={post.id}
              href={post.post_url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group relative aspect-square overflow-hidden bg-parchment dark:bg-white/5 border border-ink/10 dark:border-parchment/10 rounded-lg"
            >
              {post.image_url ? (
                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${post.image_url})` }} />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${platformColors[post.platform] || 'from-gold to-deepgold'}`} />
              )}
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition" />
              <div className="relative h-full p-3 md:p-4 flex flex-col justify-between">
                <span className="text-[10px] md:text-xs text-white tracking-widest font-semibold">
                  {platformIcons[post.platform] || post.platform}
                </span>
                {post.caption && <p className="text-white text-[10px] md:text-xs line-clamp-3">{post.caption}</p>}
              </div>
              <div className="absolute top-3 right-3 md:top-4 md:right-4 text-white opacity-0 group-hover:opacity-100 transition">↗</div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}