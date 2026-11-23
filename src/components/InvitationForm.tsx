import { useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import type { AxiosError } from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const API_URL = (rawApiUrl?.trim() || 'http://localhost:5000').replace(/\/+$/, '');

type Status = 'idle' | 'loading' | 'success' | 'error';

interface LeadResponse {
  message?: string;
}

export function InvitationForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot field
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Honeypot check: if a bot fills this hidden field, silently ignore
    if (website) {
      setStatus('success');
      setMessage('Your request has been received. We will contact you soon.');
      return;
    }

    setStatus('loading');
    setMessage('');

    const [firstName = 'Teaser', ...rest] = name.trim().split(/\s+/);
    const lastName = rest.join(' ') || 'Subscriber';

    try {
      await axios.post<LeadResponse>(`${API_URL}/api/leads`, {
        firstName,
        lastName,
        email,
        phone: phone.trim() || '0000000000',
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
      const axiosErr = err as AxiosError<LeadResponse>;
      if (axiosErr.response?.status === 409) {
        setMessage('This email is already on the list.');
      } else if (axiosErr.response?.data?.message) {
        setMessage(axiosErr.response.data.message);
      } else {
        setMessage('Something went wrong. Please try again.');
      }
    }
  };

  if (status === 'success') {
    return (
      <div
        role="status"
        className="bg-[#c9a84c]/10 border border-[#c9a84c] p-6 text-[#c9a84c] rounded-xl text-center"
      >
        <p>{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold text-[#b3a98f]">
            Your name
          </span>
          <input
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            autoComplete="name"
            className="h-12 w-full rounded-xl border border-white/12 bg-white/4 px-4 text-[14px] text-[#fffdf7] outline-none transition-colors placeholder:text-[#756c56] hover:border-white/20 focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/20"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold text-[#b3a98f]">
            Email address
          </span>
          <input
            type="email"
            required
            maxLength={160}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="h-12 w-full rounded-xl border border-white/12 bg-white/4 px-4 text-[14px] text-[#fffdf7] outline-none transition-colors placeholder:text-[#756c56] hover:border-white/20 focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/20"
          />
        </label>
      </div>
      
      <label className="block">
        <span className="mb-2 block text-[11px] font-semibold text-[#b3a98f]">
          Phone <span className="font-normal text-[#756c56]">(optional)</span>
        </span>
        <input
          type="tel"
          maxLength={30}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+251"
          autoComplete="tel"
          className="h-12 w-full rounded-xl border border-white/12 bg-white/4 px-4 text-[14px] text-[#fffdf7] outline-none transition-colors placeholder:text-[#756c56] hover:border-white/20 focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/20"
        />
      </label>

      {/* Honeypot field - hidden from users but visible to bots */}
      <label className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        Website
        <input
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          name="website"
        />
      </label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-[11px] leading-5 text-[#756c56]">
          By requesting access, you agree to receive invitation and opening updates from
          Go&rsquo;Buzz.
        </p>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="group flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#c9a84c] px-6 text-[13px] font-semibold text-[#0a0908] transition-colors hover:bg-[#e0c47a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a84c] disabled:cursor-wait disabled:opacity-65"
        >
          {status === 'loading' ? 'Sending...' : 'Request an invitation'}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {message && status === 'error' && (
        <p role="alert" className="text-[13px] leading-6 text-red-300">
          {message}
        </p>
      )}
    </form>
  );
}