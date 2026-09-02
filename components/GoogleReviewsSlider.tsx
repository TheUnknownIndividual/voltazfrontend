import React, { useEffect, useState, useCallback } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { useGoogleReviews } from '../contexts/GoogleReviewsContext';

interface GoogleReviewsSliderProps {
  lang?: 'az' | 'en' | 'ru' | 'tr';
}

const copy = {
  az: {
    eyebrow: 'Google Rəyləri',
    title: 'Müştərilərimiz nə deyir',
    ratingSuffix: (count: number) => `${count} rəy əsasında`,
    seeAll: 'Bütün rəylərə bax',
  },
  en: {
    eyebrow: 'Google Reviews',
    title: 'What our customers say',
    ratingSuffix: (count: number) => `based on ${count} reviews`,
    seeAll: 'See all reviews on Google',
  },
  ru: {
    eyebrow: 'Отзывы Google',
    title: 'Что говорят наши клиенты',
    ratingSuffix: (count: number) => `на основе ${count} отзывов`,
    seeAll: 'Смотреть все отзывы',
  },
  tr: {
    eyebrow: 'Google Yorumları',
    title: 'Müşterilerimiz ne diyor',
    ratingSuffix: (count: number) => `${count} yoruma göre`,
    seeAll: 'Tüm yorumları görün',
  },
} as const;

const GoogleReviewsSlider: React.FC<GoogleReviewsSliderProps> = ({ lang = 'az' }) => {
  const { result, getReviews } = useGoogleReviews();
  const [current, setCurrent] = useState(0);
  const t = copy[lang] || copy.az;

  useEffect(() => {
    void getReviews();
  }, []);

  const reviews = result?.reviews || [];

  const nextSlide = useCallback(() => {
    if (reviews.length === 0) return;
    setCurrent((prev) => (prev + 1) % reviews.length);
  }, [reviews.length]);

  useEffect(() => {
    if (reviews.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(nextSlide, 6000);
    return () => window.clearInterval(timer);
  }, [nextSlide, reviews.length]);

  if (reviews.length === 0) return null;

  const review = reviews[current];

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="mx-auto max-w-[1440px] px-4 md:px-12">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:mb-10 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-6 bg-[var(--color-primary)] md:w-8" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">{t.eyebrow}</span>
            </div>
            <h2 className="text-2xl font-black leading-tight tracking-tight text-[#081510] md:text-4xl">{t.title}</h2>
            {result?.overallRating != null && result.userRatingCount != null && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4"
                      strokeWidth={0}
                      fill={i < Math.round(result.overallRating || 0) ? 'var(--color-primary)' : '#e2e8f0'}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {result.overallRating.toFixed(1)} · {t.ratingSuffix(result.userRatingCount)}
                </span>
              </div>
            )}
          </div>
          {result?.googleMapsUrl && (
            <a
              href={result.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-[var(--color-primary)] transition-colors hover:text-[#081510]"
            >
              {t.seeAll}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>
          )}
        </div>

        <div className="rounded-[1.25rem] border border-[var(--border-light)] bg-[color-mix(in_srgb,var(--color-primary)_6%,white)] p-6 shadow-sm md:rounded-[2rem] md:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-8">
            <div className="flex flex-none items-center gap-3 md:w-64 md:flex-col md:items-start">
              {review.reviewerPhotoUrl ? (
                <img
                  src={review.reviewerPhotoUrl}
                  alt=""
                  width="56"
                  height="56"
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 flex-none rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-black text-white">
                  {review.reviewerName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-black text-[#081510]">{review.reviewerName}</p>
                <div className="mt-1 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3 w-3"
                      strokeWidth={0}
                      fill={i < review.rating ? 'var(--color-primary)' : '#e2e8f0'}
                    />
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{review.relativeTime}</p>
              </div>
            </div>
            <p className="flex-1 text-sm leading-relaxed text-slate-600 md:text-base md:leading-8">
              {review.text}
            </p>
          </div>
        </div>

        {reviews.length > 1 && (
          <div className="mt-6 flex justify-center gap-3">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                aria-label={`${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === current ? 'w-8 bg-[var(--color-primary)]' : 'w-3 bg-slate-200'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GoogleReviewsSlider;
