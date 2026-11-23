import { motion } from 'framer-motion';
import { useContent } from '../hooks/useContent';

export default function Hero() {
  const content = useContent();

  return (
    <section className="relative min-h-[90vh] md:min-h-screen bg-parchment dark:bg-ink text-ink dark:text-parchment flex items-center pt-24 md:pt-20 overflow-hidden">
      
      {/* Background Pulse Line - Hidden on mobile */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[80vw] md:w-[60vw] h-[40vw] opacity-10 pointer-events-none dark:opacity-20 text-gold translate-x-[20%] hidden sm:block">
        <svg viewBox="272.1 318.6 991.7 399.0" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <clipPath id="clip_LogoMark">
              <path transform="matrix(1,0,0,-1,0,1024)" d="M0 1024H1536V0H0Z"></path>
            </clipPath>
          </defs>
          <g clipPath="url(#clip_LogoMark)">
            <path
              transform="matrix(1,0,0,-1,1035.4328,537.85159)"
              d="M0 0C3.613-.755 3.892 .978 5.442 3.429 16.038 20.179 17.734 53.771 27.906 69.868 30.661 74.228 39.154 79.373 44.307 79.015 69.156 77.286 68.734 17.979 95.012 5.122 117.921-6.088 161.783-3.876 188.809-4.885 191.198-4.975 205.202-5.138 222.436-5.726 200.326-6.945 179.321-9.372 158.628-10.182 142.368-10.818 114.439-13.32 97.815-11.832 63.598-8.768 62.235 10.181 48.354 35.604 47.548 37.078 47.789 41.185 44.468 39.487 35.183 34.739 26.693-34.073 6.008-40.647-12.505-46.53-17.74-22.79-21.167-10.3-34.15 37.019-35.678 90.233-47.43 137.29-48.117 140.042-47.405 143.452-51.355 144.208L-93.409-136.77C-96.157-160.92-119.154-173.765-128.314-145.107L-160.059 25.669C-163.721 28.54-180.53-28.147-182.236-32.138-189.368-48.821-197.478-57.034-216.544-59.056-226.399-60.101-233.89-60.04-242.716-59.951-331.51-59.052-420.138-55.81-508.65-55.245-587.358-54.743-678.615-55.807-757.302-55.307-745.196-53.141-634.388-51.746-631.367-51.712-541.833-50.703-548.619-50.731-461.235-49.481-393.842-48.518-309.191-52.846-244.031-45.416-185.927-38.79-194.88 22.179-174.238 64.572-163.85 85.907-148.96 82.026-140.381 62.12-130.188 13.401-125.712-36.58-115.966-85.361-115.195-89.219-115.993-96.466-110.656-94.847-103.349-41.968-96.718 11.149-88.643 63.929-82.581 103.552-77.685 149.675-68.572 188.077-66.27 197.776-63.665 213.19-50.379 213.213-42.996 213.226-35.76 202.551-34.155 196.005Z"
              fill="currentColor"
            />
          </g>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-6 w-full z-10 py-12 md:py-0">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-6 md:mb-8"
          >
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-gold block"></span>
            <p className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-ink/60 dark:text-parchment/60">
              {content('hero.label', 'hero.label')}
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[3.2rem] leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl font-serif mb-6 md:mb-8"
          >
            Move.<br/>
            Think.<br/>
            <span className="text-gold italic font-light">Recover.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-ink/70 dark:text-parchment/70 text-base md:text-lg max-w-md leading-relaxed mb-8 md:mb-10"
          >
            {content('hero.subtitle', 'hero.subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full sm:w-auto"
          >
            <button
              onClick={() => document.getElementById('reserve-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto bg-gold text-white px-6 md:px-8 py-4 md:py-3.5 rounded-full text-sm font-semibold tracking-wider hover:bg-deepgold transition flex items-center justify-center gap-2"
            >
              Book a Session <span>→</span>
            </button>
            <a
              href="#method"
              className="w-full sm:w-auto px-6 md:px-8 py-4 md:py-3.5 rounded-full text-sm font-semibold tracking-wider border border-ink/20 dark:border-parchment/20 hover:bg-ink/5 dark:hover:bg-parchment/5 transition text-center"
            >
              The Method
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}