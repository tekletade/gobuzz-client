import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { motion, useMotionValue, animate, useInView } from 'framer-motion';
import Logo from './Logo';

const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const API_URL = (rawApiUrl?.trim() || 'http://localhost:5000').replace(/\/+$/, '');

const ECG = "M0 100 H480 C520 100 540 92 556 84 L576 122 L604 18 L634 168 L662 62 L682 112 C700 101 716 100 736 100 H900";

// Inline PulseLine Component for the signature
function PulseLine({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathLength = useMotionValue(0);
  const isInView = useInView(svgRef, { once: true, margin: "0px 0px -40px 0px" });

  useEffect(() => {
    if (!isInView) return;
    animate(pathLength, 1, {
      duration: 2.5,
      delay: 0.15,
      ease: [0.65, 0, 0.35, 1],
    });
  }, [isInView, pathLength]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 900 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="pl-glow" x="-10%" y="-80%" width="120%" height="360%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d={ECG}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#pl-glow)"
        style={{ pathLength }}
      />
    </svg>
  );
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Teaser() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Theme init
  useEffect(() => {
    const storedTheme = localStorage.getItem('gobuzz-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = storedTheme === 'dark' || (!storedTheme && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('gobuzz-theme', newDark ? 'dark' : 'light');
  };

  // Scrolled header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      await axios.post(`${API_URL}/api/leads`, {
        firstName: name.split(' ')[0] || 'Teaser',
        lastName: name.split(' ').slice(1).join(' ') || 'Subscriber',
        email,
        phone: phone || '0000000000',
        language: 'en',
        wantsFounding: true,
      });

      setStatus('success');
      setMessage('Your request has been received. We will contact you soon.');
      setEmail('');
      setName('');
      setPhone('');
    } catch (err) {
      setStatus('error');
      const axiosErr = err as AxiosError<{ message?: string }>;
      if (axiosErr.response?.status === 409) {
        setMessage('This email is already on the list.');
      } else if (axiosErr.response?.data?.message) {
        setMessage(axiosErr.response.data.message);
      } else {
        setMessage('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="teaser-wrapper min-h-screen relative grain">
      {/* HEADER */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled
            ? 'bg-bg/80 backdrop-blur-md border-b border-line-soft'
            : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <a href="/" className="text-gold transition-colors hover:text-gold-bright" aria-label="Go'Buzz Wellness home">
            <div className="h-7 sm:h-9 w-auto flex items-center">
              <Logo className="h-full w-auto" />
            </div>
          </a>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line-soft text-faint transition-colors hover:border-gold hover:text-gold"
            >
              <svg
                className={`absolute h-[18px] w-[18px] transition-all duration-500 ${
                  isDark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="4" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2m-2.34 5.66l-1.41-1.41m-11.32-11.32L4.93 4.93" />
              </svg>
              <svg
                className={`absolute h-[18px] w-[18px] transition-all duration-500 ${
                  isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
              </svg>
            </button>

            <a
              href="#invitation"
              className="group inline-flex h-11 items-center gap-2 rounded-full px-3 text-[12px] font-semibold text-ink transition-colors hover:text-gold sm:px-4 sm:text-[13px]"
            >
              Request invitation
              <svg className="h-3.5 w-3.5 text-gold transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m0 0l-7-7m7 7l7-7" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="relative flex items-center overflow-hidden min-h-[calc(100svh-2.5rem)]">
          <div
            className="absolute -bottom-1/3 -left-1/4 h-[80vh] w-[80vh] rounded-full opacity-70 pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--glow) 0%, transparent 65%)' }}
            aria-hidden="true"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[8%] top-1/2 hidden -translate-y-1/2 lg:block"
            style={{ opacity: 0.05 }}
          >
            <svg viewBox="272.1 318.6 991.7 399.0" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[58vw] text-gold">
              <defs><clipPath id="clip_LogoMark"><path transform="matrix(1,0,0,-1,0,1024)" d="M0 1024H1536V0H0Z" /></clipPath></defs>
              <g clipPath="url(#clip_LogoMark)">
                <path transform="matrix(1,0,0,-1,1035.4328,537.85159)" d="M0 0C3.613-.755 3.892 .978 5.442 3.429 16.038 20.179 17.734 53.771 27.906 69.868 30.661 74.228 39.154 79.373 44.307 79.015 69.156 77.286 68.734 17.979 95.012 5.122 117.921-6.088 161.783-3.876 188.809-4.885 191.198-4.975 205.202-5.138 222.436-5.726 200.326-6.945 179.321-9.372 158.628-10.182 142.368-10.818 114.439-13.32 97.815-11.832 63.598-8.768 62.235 10.181 48.354 35.604 47.548 37.078 47.789 41.185 44.468 39.487 35.183 34.739 26.693-34.073 6.008-40.647-12.505-46.53-17.74-22.79-21.167-10.3-34.15 37.019-35.678 90.233-47.43 137.29-48.117 140.042-47.405 143.452-51.355 144.208L-93.409-136.77C-96.157-160.92-119.154-173.765-128.314-145.107L-160.059 25.669C-163.721 28.54-180.53-28.147-182.236-32.138-189.368-48.821-197.478-57.034-216.544-59.056-226.399-60.101-233.89-60.04-242.716-59.951-331.51-59.052-420.138-55.81-508.65-55.245-587.358-54.743-678.615-55.807-757.302-55.307-745.196-53.141-634.388-51.746-631.367-51.712-541.833-50.703-548.619-50.731-461.235-49.481-393.842-48.518-309.191-52.846-244.031-45.416-185.927-38.79-194.88 22.179-174.238 64.572-163.85 85.907-148.96 82.026-140.381 62.12-130.188 13.401-125.712-36.58-115.966-85.361-115.195-89.219-115.993-96.466-110.656-94.847-103.349-41.968-96.718 11.149-88.643 63.929-82.581 103.552-77.685 149.675-68.572 188.077-66.27 197.776-63.665 213.19-50.379 213.213-42.996 213.226-35.76 202.551-34.155 196.005Z" fill="currentColor" />
              </g>
            </svg>
          </div>

          <div className="relative mx-auto w-full max-w-7xl px-6 pt-32 pb-20 lg:px-10 z-10">
            <p className="eyebrow">Private Wellness Club — Addis Ababa</p>
            <h1 className="display mt-8 text-[17vw] leading-[0.92] sm:text-[13vw] lg:text-[9.5rem]">
              <span className="block overflow-hidden"><span className="inline-block overflow-hidden align-bottom"><span className="inline-block slide-up">Move.</span></span></span>
              <span className="block overflow-hidden pl-[8vw] lg:pl-36"><span className="inline-block overflow-hidden align-bottom"><span className="inline-block slide-up" style={{ animationDelay: '0.1s' }}>Think.</span></span></span>
              <span className="block overflow-hidden italic text-gold"><span className="inline-block overflow-hidden align-bottom"><span className="inline-block slide-up" style={{ animationDelay: '0.2s' }}>Recover.</span></span></span>
            </h1>
          </div>
        </section>

        {/* SAUNA IMAGE */}
        <section className="border-y border-line-soft bg-surface">
          <figure className="relative min-h-[72svh] overflow-hidden sm:min-h-[78svh]">
            <img src="/sauna.jpg" alt="Cedar-lined sauna" className="absolute inset-0 h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-[#0a0908]/28 dark:bg-[#0a0908]/48" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0a0908]/90 via-[#0a0908]/42 to-transparent" aria-hidden="true" />
            <figcaption className="absolute inset-x-0 bottom-0 px-6 pb-10 text-[#fffdf7] sm:pb-14 lg:px-10 lg:pb-16">
              <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[#d2b45a]">Opening in Addis Ababa</p>
                  <h2 className="mt-3 max-w-3xl font-serif text-[clamp(2.25rem,5.6vw,5.25rem)] leading-[1.02] tracking-[-0.025em] text-balance">Something quieter is taking shape.</h2>
                </div>
                <a href="#invitation" className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 text-[#fffdf7] transition-colors hover:border-[#d2b45a] hover:text-[#d2b45a]">
                  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m0 0l-7-7m7 7l7-7" /></svg>
                </a>
              </div>
            </figcaption>
          </figure>
        </section>

        {/* FOUNDER QUOTE */}
        <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-10 lg:py-40">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="eyebrow">A new kind of club</p>
              <h2 className="display mt-6 max-w-lg text-5xl sm:text-6xl text-ink">
                Built for how Addis wants to <em className="text-gold">feel.</em>
              </h2>
            </div>
            <div className="lg:border-l border-line-soft lg:pl-16">
              <figure>
                <span className="block h-12 font-serif text-[72px] leading-none text-gold/80" aria-hidden="true">&ldquo;</span>
                <blockquote className="max-w-2xl text-pretty font-serif text-[21px] leading-[1.62] sm:text-[25px] text-ink">
                  Wellness is not a product, it is a practice. Go&rsquo;Buzz is bringing that practice home.
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  {/* UPDATED: Added PulseLine component here */}
                  <PulseLine className="w-16 text-gold" />
                  <span>
                    <span className="block text-[12px] font-semibold text-ink">Mack Kifle</span>
                    <span className="mt-0.5 block text-[11px] text-muted">Founder and CEO</span>
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* INVITATION FORM */}
        <section id="invitation" className="flex min-h-[calc(100svh-5rem)] scroll-mt-20 items-center bg-[#0a0908] text-[#fffdf7]">
          <div className="mx-auto grid w-full max-w-7xl gap-14 px-6 py-24 sm:py-32 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-10 lg:py-40">
            <div>
              <p className="text-[11px] font-semibold text-[#d2b45a]">Founding access</p>
              <h2 className="mt-5 max-w-xl font-serif text-[clamp(3rem,6vw,5.75rem)] leading-[0.98] tracking-[-0.03em] text-balance">
                Limited spaces <em className="text-[#d2b45a]">only.</em>
              </h2>
              <p className="mt-7 max-w-md text-[15px] leading-7 text-[#b3a98f]">
                Founding members will be the first inside, with priority access to opening programming and membership invitations.
              </p>
              {/* UPDATED: Changed location text */}
              <div className="mt-8 flex items-center gap-2 text-[12px] text-[#8f8777]">
                <svg className="h-3.5 w-3.5 text-[#d2b45a]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Bole, Addis Ababa — CMC Summit, Addis Ababa
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-1">
              <div className="mb-8">
                <h3 className="text-[18px] font-semibold">Request your invitation</h3>
                <p className="mt-2 max-w-md text-[13px] leading-6 text-[#8f8777]">
                  Tell us where to reach you. Invitations will be released privately before opening.
                </p>
              </div>

              {status === 'success' ? (
                <div role="status" className="bg-[#c9a84c]/10 border border-[#c9a84c] p-6 text-[#c9a84c] rounded-xl text-center">
                  <p>{message}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-semibold text-[#b3a98f]">Your name</span>
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-[14px] text-[#fffdf7] outline-none transition-colors placeholder:text-[#756c56] focus:border-[#c9a84c]" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-semibold text-[#b3a98f]">Email address</span>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-[14px] text-[#fffdf7] outline-none transition-colors placeholder:text-[#756c56] focus:border-[#c9a84c]" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold text-[#b3a98f]">Phone <span className="font-normal text-[#756c56]">(optional)</span></span>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251" autoComplete="tel" className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-[14px] text-[#fffdf7] outline-none transition-colors placeholder:text-[#756c56] focus:border-[#c9a84c]" />
                  </label>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-xs text-[11px] leading-5 text-[#756c56]">
                      By requesting access, you agree to receive invitation and opening updates from Go&rsquo;Buzz.
                    </p>
                    <button type="submit" disabled={status === 'loading'} className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#c9a84c] px-6 text-[13px] font-semibold text-[#0a0908] transition-colors hover:bg-[#e0c47a] disabled:opacity-50">
                      {status === 'loading' ? 'Sending...' : 'Request an invitation'}
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m0 0l-7-7m7 7l-7 7" /></svg>
                    </button>
                  </div>
                  {message && status === 'error' && <p role="alert" className="text-red-400 text-xs">{message}</p>}
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0a0908] text-[#fffdf7]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-white/10 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <Logo className="h-7 w-auto text-[#d2b45a]" />
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-[#756c56]">
            <a href="mailto:hello@gobuzzwellness.com" className="transition-colors hover:text-[#d2b45a]">hello@gobuzzwellness.com</a>
            <span>Go&rsquo;Buzz Wellness, Addis Ababa</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}