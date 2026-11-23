import { motion } from 'framer-motion';
import { useContent } from '../hooks/useContent';
import { PulseLine } from './PulseLine';

const pillars = ['move', 'think', 'recover'] as const;

const icons: Record<string, string> = {
  move: '🏃',
  think: '🧠',
  recover: '❄️',
};

function extractTags(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((t) => String(t).trim()).filter(Boolean);
  if (typeof raw === 'string') {
    if (raw.startsWith('[') && raw.endsWith(']')) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed))
          return parsed.map((t) => String(t).trim()).filter(Boolean);
      } catch {
        /* not JSON, fall through */
      }
    }
    if (raw.includes('|')) return raw.split('|').map((t) => t.trim()).filter(Boolean);
    if (raw.includes(',')) return raw.split(',').map((t) => t.trim()).filter(Boolean);
    return [raw.trim()];
  }
  return [];
}

export default function Method() {
  const content = useContent();

  return (
    <section className="bg-white dark:bg-ink text-ink dark:text-parchment transition-colors duration-300">
      <PulseLine className="w-full h-12 md:h-16 text-gold/40 dark:text-gold/30" />
      <div className="py-12 md:py-20 lg:py-24 px-4 md:px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <p className="text-gold tracking-[0.3em] text-[10px] md:text-sm mb-3 md:mb-4 uppercase font-semibold">
            {content('method.label', 'method.label')}
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif mb-3 md:mb-6">
            {content('method.title', 'method.title')}
          </h2>
          <p className="text-ink/60 dark:text-parchment/60 text-sm md:text-lg max-w-2xl mx-auto">
            {content('method.subtitle', 'method.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {pillars.map((pillar, index) => {
            const rawTags = content(`method.${pillar}.tags`, `method.${pillar}.tags`);
            const tags = extractTags(rawTags);

            return (
              <motion.div
                key={pillar}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="group text-center p-6 md:p-8 border border-ink/10 dark:border-parchment/10 hover:border-gold/50 dark:hover:border-gold/50 transition-colors duration-300 bg-parchment dark:bg-white/5 rounded-lg"
              >
                <div className="text-3xl md:text-5xl mb-3 md:mb-6">{icons[pillar]}</div>
                <h3 className="text-xl md:text-3xl font-serif text-gold mb-3 md:mb-4">
                  {content(`method.${pillar}.title`, `method.${pillar}.title`)}
                </h3>
                <p className="text-ink/70 dark:text-parchment/70 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">
                  {content(`method.${pillar}.description`, `method.${pillar}.description`)}
                </p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] md:text-xs tracking-widest uppercase text-gold border border-gold/30 px-2 md:px-3 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}