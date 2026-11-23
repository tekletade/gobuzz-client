import { useContent } from '../hooks/useContent';
import PulseLine from './PulseLine';

export default function Footer() {
  const content = useContent();

  return (
    <footer className="bg-parchment dark:bg-ink text-ink dark:text-parchment transition-colors duration-300">
      
      {/* Top Pulse Divider */}
      <PulseLine />

      <div className="py-12 md:py-16 px-4 md:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <p className="text-gold font-serif text-3xl md:text-4xl tracking-widest mb-4">
            GO'BUZZ
          </p>
          <p className="text-ink/70 dark:text-parchment/70 text-sm md:text-base max-w-2xl mx-auto mb-2">
            {content('footer.tagline', 'footer.tagline')}
          </p>
          <p className="text-ink/50 dark:text-parchment/50 text-xs tracking-widest uppercase">
            {content('footer.location', 'footer.location')}
          </p>
        </div>

        <div className="flex justify-center gap-6 mb-8">
          <a href="https://instagram.com/gobuzzwellness" target="_blank" rel="noopener noreferrer" className="text-ink/50 dark:text-parchment/50 hover:text-gold dark:hover:text-gold transition uppercase text-xs tracking-widest">
            {content('footer.instagram') || 'Instagram'}
          </a>
          <a href="https://facebook.com/gobuzzwellness" target="_blank" rel="noopener noreferrer" className="text-ink/50 dark:text-parchment/50 hover:text-gold dark:hover:text-gold transition uppercase text-xs tracking-widest">
            {content('footer.facebook') || 'Facebook'}
          </a>
          <a href="https://tiktok.com/@gobuzzwellness" target="_blank" rel="noopener noreferrer" className="text-ink/50 dark:text-parchment/50 hover:text-gold dark:hover:text-gold transition uppercase text-xs tracking-widest">
            {content('footer.tiktok') || 'TikTok'}
          </a>
        </div>

        <div className="text-center text-xs text-ink/40 dark:text-parchment/40 pt-6 border-t border-ink/10 dark:border-parchment/10">
          {content('footer.copyright') || `© ${new Date().getFullYear()} Go'Buzz Wellness. All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}