export function PulseLine({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`w-full flex items-center justify-center text-gold/30 dark:text-gold/20 pointer-events-none select-none px-4 md:px-0 ${className}`}
    >
      {/* Left line */}
      <div className="h-[1px] flex-1 bg-current" />

      {/* Center Pulse */}
      <div className="mx-2 md:mx-4">
        <svg
          viewBox="0 0 100 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 md:w-24 h-6 md:h-8 text-gold"
          aria-hidden="true"
        >
          <path
            d="M0,20 L30,20 C35,20 38,10 42,5 C46,0 48,35 52,35 C56,35 58,15 62,10 C66,5 70,20 75,20 L100,20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Right line */}
      <div className="h-[1px] flex-1 bg-current" />
    </div>
  );
}

export default PulseLine;