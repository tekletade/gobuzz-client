import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
import Reactions from './Reactions';
import Comments from './Comments';
import { trackEvent } from '../lib/analytics';
import PulseLine from './PulseLine';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Post {
  id: number;
  title: string;
  title_am: string | null;
  content: string;
  content_am: string | null;
  excerpt: string | null;
  excerpt_am: string | null;
  image_url: string | null;
  video_type: string | null;
  video_id: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  category: string;
  is_featured: boolean;
  published_at: string;
}

const categoryColors: Record<string, string> = {
  news: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  promotion: 'bg-gold text-white',
  update: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  event: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
  social: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200',
};

export default function PostFeed() {
  const { i18n } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/posts?limit=6`).then((res) => {
        setPosts(res.data.data || []);
        setLoading(false);
        if (res.data.data?.length > 0) trackEvent('page_view', { metadata: { section: 'post_feed' } });
      }).catch((err) => {
        setError(err?.response ? `Request failed with status ${err.response.status}` : err?.message);
        setLoading(false);
      });
  }, []);

  if (loading) return null;
  const isAmharic = i18n.language === 'am';

  return (
    <section id="posts" className="bg-white dark:bg-ink text-ink dark:text-parchment transition-colors duration-300">
      <PulseLine />
      <div className="py-12 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <p className="text-gold tracking-[0.3em] text-[10px] md:text-sm mb-3 md:mb-4 uppercase font-semibold">
            {isAmharic ? 'ዜና እና ዝመና' : 'NEWS & UPDATES'}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif mb-3 md:mb-4">
            {isAmharic ? "ከGo'Buzz የቅርብ ጊዜ" : "Latest from Go'Buzz"}
          </h2>
          <p className="text-ink/60 dark:text-parchment/60 max-w-2xl mx-auto text-sm md:text-base">
            {isAmharic ? 'የመክፈቻ ዝመናዎች፣ ማስታወቂያዎች እና ልዩ ዝግጅቶች።' : 'Opening updates, announcements, and exclusive events.'}
          </p>
        </div>

        {!error && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post, index) => {
              const title = isAmharic && post.title_am ? post.title_am : post.title;
              const content = isAmharic && post.content_am ? post.content_am : post.content;
              const excerpt = isAmharic && post.excerpt_am ? post.excerpt_am : post.excerpt || content;
              const isExpanded = expandedId === post.id;

              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`bg-parchment dark:bg-white/5 border border-ink/10 dark:border-white/10 overflow-hidden flex flex-col rounded-lg shadow-sm ${
                    post.is_featured ? 'md:col-span-2 lg:col-span-3' : ''
                  }`}
                >
                  {post.video_type && post.video_id && (
                    <div className="w-full border-b border-ink/10 dark:border-white/10">
                      <VideoPlayer videoType={post.video_type} videoId={post.video_id} thumbnail={post.thumbnail_url} title={post.title} />
                    </div>
                  )}
                  {!post.video_type && post.image_url && (
                    <div
                      className={`${post.is_featured ? 'h-64 md:h-80' : 'h-40 md:h-48'} bg-cover bg-center border-b border-ink/10 dark:border-white/10`}
                      style={{ backgroundImage: `url(${post.image_url.startsWith('http') ? post.image_url : `${API_URL}${post.image_url}`})` }}
                    />
                  )}
                  <div className="p-4 md:p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                      <span className={`text-[9px] md:text-[10px] px-2 md:px-3 py-1 tracking-widest uppercase font-bold rounded-full ${categoryColors[post.category] || 'bg-ink/10 dark:bg-white/10 text-ink dark:text-parchment'}`}>
                        {post.category}
                      </span>
                      {post.is_featured && (
                        <span className="text-[9px] md:text-[10px] text-gold font-bold tracking-widest uppercase">★ {isAmharic ? 'ተመራጭ' : 'FEATURED'}</span>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-serif text-ink dark:text-parchment mb-2 md:mb-3">{title}</h3>
                    <div
                      className={`text-ink/70 dark:text-parchment/70 text-xs md:text-sm leading-relaxed mb-3 md:mb-4 flex-1 ${isExpanded ? 'prose-content dark:prose-invert' : ''}`}
                      dangerouslySetInnerHTML={{ __html: isExpanded ? content : excerpt.length > 150 ? `${excerpt.substring(0, 150)}...` : excerpt }}
                    />
                    {excerpt.length > 150 && (
                      <button
                        onClick={() => {
                          setExpandedId(isExpanded ? null : post.id);
                          if (!isExpanded) trackEvent('post_read', { postId: post.id });
                        }}
                        className="text-gold text-[10px] md:text-xs font-bold tracking-widest self-start hover:underline mb-3 md:mb-4 uppercase"
                      >
                        {isExpanded ? (isAmharic ? 'ያሳጥሩ' : 'READ LESS') : (isAmharic ? 'ተጨማሪ ያንብቡ' : 'READ MORE →')}
                      </button>
                    )}
                    <Reactions postId={post.id} />
                    <p className="text-[9px] md:text-[10px] text-ink/40 dark:text-parchment/40 mt-3 md:mt-4 tracking-widest uppercase font-medium">
                      {new Date(post.published_at).toLocaleDateString(isAmharic ? 'am-ET' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {isExpanded && <Comments postId={post.id} />}
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}