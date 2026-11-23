import { useState } from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { useSettings } from '../context/SettingsContext';
import type { SettingsKey } from '../lib/settingsKeys';

export default function Header() {
  const { get } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToForm = () => {
    document.getElementById('reserve-form')?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const isEnabled = (key: string) => {
    const settingKey = `nav.${key}.enabled` as SettingsKey;
    return get(settingKey) !== 'false';
  };

  const navItems = [
    { key: 'method', label: 'The Method', href: '#method' },
    { key: 'why', label: 'Why Go\'Buzz', href: '#why' },
    { key: 'facilities', label: 'Facilities', href: '#facilities' },
    { key: 'booking', label: 'Booking', href: '#booking' },
    { key: 'membership', label: 'Membership', href: '#membership' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-parchment/90 dark:bg-ink/90 backdrop-blur-md border-b border-ink/10 dark:border-parchment/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        
        {/* Left: Mobile Menu Button (Hidden on Desktop) */}
        <div className="flex-1 flex items-center lg:hidden">
          <button 
            className="p-2 -ml-2 text-ink dark:text-parchment"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Center: Logo */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <Logo className="h-6 sm:h-8 md:h-10" />
        </div>

        {/* Desktop Navigation (Right side) */}
        <nav className="hidden lg:flex flex-1 items-center justify-end gap-6 xl:gap-8 text-sm font-medium text-ink/70 dark:text-parchment/70 tracking-wider mr-6">
          {navItems.map((item) => (
            isEnabled(item.key) && (
              <a 
                key={item.key} 
                href={item.href} 
                className="hover:text-gold dark:hover:text-gold transition-colors duration-200"
              >
                {item.label}
              </a>
            )
          ))}
        </nav>

        {/* Right: Actions (Language, Theme, Book) */}
        <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
          <div className="hidden sm:block">
            <LanguageToggle />
          </div>
          <ThemeToggle />
          <button
            onClick={scrollToForm}
            className="hidden lg:block bg-gold text-white px-5 py-2.5 rounded-full text-xs md:text-sm font-semibold tracking-wider hover:bg-deepgold transition-colors duration-300 shadow-sm"
          >
            Book a Session
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-parchment dark:bg-ink border-b border-ink/10 dark:border-parchment/10 shadow-xl py-6 px-6 flex flex-col gap-5">
          
          {/* Mobile Language Toggle */}
          <div className="sm:hidden flex justify-end mb-2">
             <LanguageToggle />
          </div>

          {navItems.map((item) => (
            isEnabled(item.key) && (
              <a 
                key={item.key} 
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base text-ink/80 dark:text-parchment/80 font-medium hover:text-gold border-b border-ink/5 dark:border-parchment/5 pb-3"
              >
                {item.label}
              </a>
            )
          ))}
          <button
            onClick={scrollToForm}
            className="bg-gold text-white px-6 py-3.5 rounded-full text-sm font-semibold mt-4 shadow-md"
          >
            Book a Session
          </button>
        </div>
      )}
    </header>
  );
}