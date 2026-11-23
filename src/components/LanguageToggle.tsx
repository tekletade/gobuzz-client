import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const toggle = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en');
  };

  return (
    <button
      onClick={toggle}
      className="border border-ink/20 dark:border-parchment/20 text-ink dark:text-parchment px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm tracking-widest hover:border-gold hover:text-gold transition-colors rounded-sm font-medium"
    >
      {i18n.language === 'en' ? 'አማርኛ' : 'EN'}
    </button>
  );
}