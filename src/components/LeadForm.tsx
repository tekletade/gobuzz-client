import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { leadsApi } from '../lib/api';
import { useContent } from '../hooks/useContent';

// ==================================================
// FORM VALIDATION SCHEMA
// ==================================================

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone'),
  interest: z.array(z.string()).optional(),
  wantsFounding: z.boolean(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

// ==================================================
// COMPONENT
// ==================================================

export default function LeadForm() {
  const { i18n } = useTranslation();
  const content = useContent();

  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [maxSpots, setMaxSpots] = useState(200);

  // ----------------------------------------------
  // Load dynamic max spots from settings
  // ----------------------------------------------
  useEffect(() => {
    leadsApi
      .count()
      .then((res) => {
        if (res.data?.data?.maxSpots) {
          setMaxSpots(res.data.data.maxSpots);
        }
      })
      .catch(() => {
        // Silent fail — will use default 200
      });
  }, []);

  // ----------------------------------------------
  // Replace "200" with dynamic maxSpots in any text
  // ----------------------------------------------
  const dynamicText = (text: any): string => {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/\b200\b/g, String(maxSpots));
  };

  // ----------------------------------------------
  // Form setup
  // ----------------------------------------------
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { interest: [], wantsFounding: false },
  });

  const interests = watch('interest') || [];
  const isAmharic = i18n.language === 'am';

  // ----------------------------------------------
  // Submit handler
  // ----------------------------------------------
  const onSubmit = async (data: FormOutput) => {
    try {
      setError(null);
      const response = await leadsApi.create({
        ...data,
        language: i18n.language,
      });
      setResult(response.data.data);
      setSubmitted(true);
    } catch (err: any) {
      const response = err.response?.data;

      if (err.response?.status === 409) {
        const field = response?.data?.duplicateField;
        setError(
          field === 'email'
            ? isAmharic
              ? 'ይህ ኢሜይል ቀድሞ ተመዝግቧል።'
              : 'This email is already registered.'
            : isAmharic
              ? 'ይህ ስልክ ቁጥር ቀድሞ ተመዝግቧል።'
              : 'This phone number is already registered.'
        );
      } else {
        setError(response?.message || 'Something went wrong.');
      }
    }
  };

  // ==============================================
  // SUCCESS STATE
  // ==============================================
  if (submitted && result) {
    return (
      <section id="reserve-form" className="bg-parchment dark:bg-ink py-16 md:py-24 px-4 md:px-6 scroll-mt-8 transition-colors duration-300">
  <div className="bg-white dark:bg-white/5 border border-transparent dark:border-white/10 p-8 md:p-12 max-w-2xl mx-auto shadow-xl transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 md:p-12 text-center max-w-2xl mx-auto shadow-xl"
        >
          <div className="text-gold text-5xl md:text-6xl mb-6">✓</div>

          <h2 className="text-2xl md:text-3xl font-serif text-ink mb-4">
            {content('form.success', 'form.success')}
          </h2>

          <p className="text-warmgray mb-8 text-sm md:text-base">
            {content('form.successMessage', 'form.successMessage')}
          </p>

          {result.isFounding && (
            <div className="bg-gold text-white p-6 mb-6 rounded">
              <p className="text-xs tracking-widest mb-2">
                {content('form.foundingNumber', 'form.foundingNumber')}
              </p>
              <p className="text-4xl md:text-5xl font-serif">
                #{result.foundingMemberNumber}
              </p>
              <p className="text-xs mt-2">
                of {maxSpots}
              </p>
            </div>
          )}

          <p className="text-sm text-warmgray">
            {content('form.waitlistPosition', 'form.waitlistPosition')}:{' '}
            <strong>#{result.waitlistPosition}</strong>
          </p>
        </motion.div>
        </div>
      </section>
    );
  }

  // ==============================================
  // FORM STATE
  // ==============================================
  return (
    <section id="reserve-form" className="bg-parchment dark:bg-ink py-16 md:py-24 px-4 md:px-6 scroll-mt-8 transition-colors duration-300">
  <div className="bg-white dark:bg-white/5 border border-transparent dark:border-white/10 p-8 md:p-12 max-w-2xl mx-auto shadow-xl transition-colors duration-300">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 md:p-12 max-w-2xl mx-auto shadow-xl"
      >
        {/* HEADER */}
        <h2 className="text-2xl md:text-3xl font-serif text-ink mb-2">
          {content('form.title', 'form.title')}
        </h2>
        <p className="text-warmgray mb-6 md:mb-8 text-sm md:text-base">
          {dynamicText(content('form.subtitle', 'form.subtitle'))}
        </p>

        {/* NAME FIELDS */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <input
              {...register('firstName')}
              placeholder={content('form.firstName', 'form.firstName')}
              className="w-full p-4 bg-parchment border border-warmgray/30 text-ink focus:border-gold focus:ring-1 focus:ring-gold outline-none transition text-sm"
            />
            {errors.firstName && (
              <p className="text-red-600 text-xs mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <input
              {...register('lastName')}
              placeholder={content('form.lastName', 'form.lastName')}
              className="w-full p-4 bg-parchment border border-warmgray/30 text-ink focus:border-gold focus:ring-1 focus:ring-gold outline-none transition text-sm"
            />
            {errors.lastName && (
              <p className="text-red-600 text-xs mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* EMAIL */}
        <div className="mb-4">
          <input
            {...register('email')}
            type="email"
            placeholder={content('form.email', 'form.email')}
            className="w-full p-4 bg-parchment border border-warmgray/30 text-ink focus:border-gold focus:ring-1 focus:ring-gold outline-none transition text-sm"
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* PHONE */}
        <div className="mb-4">
          <input
            {...register('phone')}
            type="tel"
            placeholder={content('form.phone', 'form.phone')}
            className="w-full p-4 bg-parchment border border-warmgray/30 text-ink focus:border-gold focus:ring-1 focus:ring-gold outline-none transition text-sm"
          />
          {errors.phone && (
            <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* INTERESTS */}
        <div className="mb-6">
          <p className="text-xs md:text-sm text-warmgray mb-3">
            {content('form.interest', 'form.interest')}
          </p>
          <div className="flex flex-wrap gap-2">
            {['move', 'think', 'recover'].map((item) => (
              <label
                key={item}
                className={`px-4 py-2 border cursor-pointer transition text-xs md:text-sm ${
                  interests.includes(item)
                    ? 'bg-gold text-white border-gold'
                    : 'border-warmgray/30 text-ink hover:border-gold'
                }`}
              >
                <input
                  type="checkbox"
                  value={item}
                  {...register('interest')}
                  className="hidden"
                />
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* FOUNDING CHECKBOX */}
        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            {...register('wantsFounding')}
            className="w-4 h-4 mt-0.5 accent-gold"
          />
          <span className="text-xs md:text-sm text-ink">
            {dynamicText(content('form.founding', 'form.founding'))}
          </span>
        </label>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gold text-white py-4 tracking-widest hover:bg-deepgold transition disabled:opacity-50 text-sm font-medium"
        >
          {isSubmitting
            ? content('form.submitting', 'form.submitting')
            : content('form.submit', 'form.submit')}
        </button>
      </motion.form>
      </div>
    </section>
  );
}