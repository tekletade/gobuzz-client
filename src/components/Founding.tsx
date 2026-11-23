import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useContent } from '../hooks/useContent';
import { leadsApi } from '../lib/api';
import PulseLine from './PulseLine';

export default function Founding() {
  const content = useContent();
  const [count, setCount] = useState({
    total: 0,
    founding: 0,
    foundingRemaining: 0,
    maxSpots: 200,
  });

  const loadCount = () => {
    leadsApi
      .count()
      .then((res) => {
        setCount({
          total: res.data.data.total ?? 0,
          founding: res.data.data.founding ?? 0,
          foundingRemaining: res.data.data.foundingRemaining ?? 0,
          maxSpots: res.data.data.maxSpots ?? 200,
        });
      })
      .catch((err) => console.error('Failed to load count:', err));
  };

  useEffect(() => {
    loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const benefitsRaw = content('founding.benefits', 'founding.benefits');
  const benefits = Array.isArray(benefitsRaw)
    ? benefitsRaw
    : typeof benefitsRaw === 'string'
      ? benefitsRaw.replace(/^\[|\]$/g, '').split(',').map((b) => b.replace(/^"|"$/g, '').trim()).filter(Boolean)
      : [];

  const progress = count.maxSpots > 0 ? ((count.maxSpots - count.foundingRemaining) / count.maxSpots) * 100 : 0;

  return (
    <section className="bg-white dark:bg-ink text-ink dark:text-parchment transition-colors duration-300">
      
      {/* Top Pulse Divider */}
      <PulseLine />

      <div className="py-20 md:py-28 px-4 md:px-6 relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <p className="text-gold tracking-[0.3em] text-xs md:text-sm mb-4 uppercase font-semibold">
            {content('founding.label', 'founding.label')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4 md:mb-6">
            {content('founding.title', 'founding.title')}
          </h2>
          <p className="text-ink/60 dark:text-parchment/60 text-sm md:text-lg max-w-2xl mx-auto mb-10 md:mb-16">
            {content('founding.subtitle', 'founding.subtitle')}
          </p>

          <div className="grid grid-cols-3 gap-3 md:gap-8 my-10 md:my-16">
            {[
              { label: content('founding.registered', 'founding.registered'), value: count.total },
              { label: content('founding.founding', 'founding.founding'), value: count.founding },
              { label: content('founding.remaining', 'founding.remaining'), value: count.foundingRemaining, highlight: true },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="bg-parchment dark:bg-white/5 border border-ink/10 dark:border-parchment/10 p-4 md:p-6 rounded-lg"
              >
                <div className={`text-3xl md:text-5xl lg:text-6xl font-serif ${item.highlight ? 'text-gold' : 'text-ink dark:text-parchment'}`}>
                  {item.value}
                </div>
                <p className="text-[10px] md:text-xs text-ink/50 dark:text-parchment/50 mt-2 tracking-widest uppercase">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="max-w-md mx-auto mb-10 md:mb-16">
            <div className="h-2 bg-ink/10 dark:bg-parchment/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                viewport={{ once: true }}
                className="h-full bg-gold"
              />
            </div>
            <p className="text-xs text-ink/50 dark:text-parchment/50 mt-2 tracking-widest uppercase">
              {Math.round(progress)}% {content('founding.claimed', 'founding.claimed') || 'claimed'}
            </p>
          </div>

          <ul className="text-left max-w-2xl mx-auto space-y-3 md:space-y-4">
            {benefits.map((benefit, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-3 text-ink/80 dark:text-parchment/80 text-sm md:text-base bg-parchment dark:bg-white/5 p-4 border border-ink/5 dark:border-parchment/10 rounded"
              >
                <span className="text-gold mt-0.5 flex-shrink-0 text-lg">✓</span>
                <span>{String(benefit).trim()}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}