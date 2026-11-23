import { useState } from 'react';
import axios from 'axios';
import { useContent } from '../hooks/useContent';
import PulseLine from './PulseLine';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function NewsletterSignup() {
  const content = useContent();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await axios.post(`${API_URL}/api/posts/newsletter/subscribe`, { email, name });
      setStatus('success');
      setMessage(res.data.message);
      setEmail('');
      setName('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to subscribe.');
    }
  };

  return (
    <section className="bg-white dark:bg-ink text-ink dark:text-parchment transition-colors duration-300">
      <PulseLine />
      <div className="py-12 md:py-24 px-4 md:px-6 max-w-2xl mx-auto text-center">
        <p className="text-gold tracking-[0.3em] text-[10px] md:text-sm mb-3 md:mb-4 uppercase font-semibold">
          {content('newsletter.label') || 'NEWSLETTER'}
        </p>
        <h3 className="text-xl md:text-3xl font-serif mb-3 md:mb-4">
          {content('newsletter.title') || 'Weekly updates, no noise.'}
        </h3>
        <p className="text-ink/60 dark:text-parchment/60 text-sm md:text-base mb-6 md:mb-8">
          {content('newsletter.subtitle') || 'Get opening updates, event invitations, and founding member details.'}
        </p>

        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder={content('newsletter.namePlaceholder') || 'Your name (optional)'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-3 bg-parchment dark:bg-white/5 border border-ink/10 dark:border-parchment/20 text-ink dark:text-parchment text-sm outline-none focus:border-gold transition-colors rounded-md sm:rounded-none"
          />
          <input
            type="email"
            placeholder={content('newsletter.emailPlaceholder') || 'Your email'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 bg-parchment dark:bg-white/5 border border-ink/10 dark:border-parchment/20 text-ink dark:text-parchment text-sm outline-none focus:border-gold transition-colors rounded-md sm:rounded-none"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-gold text-white px-8 py-3 text-sm tracking-widest hover:bg-deepgold transition disabled:opacity-50 rounded-md sm:rounded-none"
          >
            {status === 'loading' ? '...' : content('newsletter.button') || 'SUBSCRIBE'}
          </button>
        </form>

        {message && (
          <p className={`text-xs tracking-widest mt-4 ${status === 'success' ? 'text-gold' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </div>
    </section>
  );
}