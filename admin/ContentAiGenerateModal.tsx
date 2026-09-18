import React, { useState } from 'react';
import type { ContentAiContentType, ContentAiDraft } from '../api/contentAi';
import { useContentAiGeneration } from './hooks/useContentAiGeneration';

const LANGUAGES = [
  { code: 1, label: 'AZ' },
  { code: 2, label: 'EN' },
  { code: 3, label: 'RU' },
  { code: 4, label: 'TR' },
] as const;

const EXAMPLE_TOPICS: Record<ContentAiContentType, string[]> = {
  blog: [
    'Solar panellərin illik qənaəti necə hesablanır',
    'Şəbəkəyə qoşulma prosesi addım-addım',
    'Ev üçün düzgün günəş sistemi ölçüsünü necə seçmək olar',
  ],
  news: [
    'Yeni tarif dəyişikliyi',
    'Yeni məhsul buraxılışı',
    'Sənayedə son inkişaflar',
  ],
};

interface ContentAiGenerateModalProps {
  contentType: ContentAiContentType;
  title: string;
  onApply: (draft: ContentAiDraft) => void;
  onClose: () => void;
}

const ContentAiGenerateModal: React.FC<ContentAiGenerateModalProps> = ({ contentType, title, onApply, onClose }) => {
  const { job, draft, isStarting, error, start, cancel } = useContentAiGeneration(contentType);
  const [topic, setTopic] = useState('');
  const [angleNotes, setAngleNotes] = useState('');
  const [includeShillMention, setIncludeShillMention] = useState(true);
  const [activeLangCode, setActiveLangCode] = useState<number>(1);

  const handleClose = async () => {
    await cancel();
    onClose();
  };

  const handleGenerate = async () => {
    try {
      await start(topic, angleNotes, includeShillMention);
    } catch {
      // error already surfaced via hook state
    }
  };

  const activeLanguage = draft?.languages.find((l) => l.languageCode === activeLangCode);

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <h3 className="text-xl font-black text-slate-900">{title}</h3>
          <button type="button" onClick={handleClose} className="text-slate-400 hover:text-slate-700">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {!job && (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Mövzu</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  maxLength={400}
                  placeholder="Nə haqqında yazılsın?"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--focus-ring)]"
                />
                <div className="mt-1 flex flex-wrap gap-2">
                  {EXAMPLE_TOPICS[contentType].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setTopic(example)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold text-slate-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Əlavə qeydlər (istəyə bağlı)</label>
                <textarea
                  value={angleNotes}
                  onChange={(e) => setAngleNotes(e.target.value)}
                  rows={2}
                  maxLength={800}
                  placeholder="Xüsusi bir bucaq və ya vurğu istəyirsinizsə buraya yazın"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--focus-ring)]"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={includeShillMention}
                  onChange={(e) => setIncludeShillMention(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--focus-ring)]"
                />
                Uyğun olduqda Volt.az xidmətlərinə qısa istinad daxil edilsin
              </label>

              {error && <p className="text-xs font-bold text-red-600">{error}</p>}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isStarting || topic.trim().length < 10}
                className="flex w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isStarting ? 'Başladılır...' : 'Yaz'}
              </button>
            </div>
          )}

          {job && (job.status === 'queued' || job.status === 'processing') && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--color-primary)]" />
              <p className="text-sm font-bold text-slate-600">AI yazır...</p>
              <button type="button" onClick={handleClose} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600">
                Ləğv et
              </button>
            </div>
          )}

          {job && job.status === 'failed' && (
            <div className="space-y-4 py-8 text-center">
              <p className="text-sm font-bold text-red-600">{job.errorMessage || 'AI generasiyası uğursuz oldu.'}</p>
              <button
                type="button"
                onClick={() => cancel()}
                className="rounded-lg bg-slate-100 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200"
              >
                Yenidən yoxla
              </button>
            </div>
          )}

          {draft && (
            <div className="space-y-5">
              <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveLangCode(lang.code)}
                    className={`flex-1 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeLangCode === lang.code ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {activeLanguage && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Başlıq</span>
                    <p className="mt-1 text-sm font-black text-slate-900">{activeLanguage.title}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Açar Söz / Kateqoriya</span>
                    <p className="mt-1 text-sm font-bold text-slate-700">{activeLanguage.description}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Məzmun</span>
                    <div
                      className="mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700"
                      dangerouslySetInnerHTML={{ __html: activeLanguage.content }}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">SEO başlığı</span>
                      <p className="mt-1 text-xs font-semibold text-slate-600">{activeLanguage.seoTitle}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">SEO açar sözləri</span>
                      <p className="mt-1 text-xs font-semibold text-slate-600">{activeLanguage.seoKeywords}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">SEO təsviri</span>
                    <p className="mt-1 text-xs font-semibold text-slate-600">{activeLanguage.seoDescription}</p>
                  </div>
                </div>
              )}

              {draft.shillMentionIncluded && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-700">
                  Volt.az istinadı daxil edilib
                </span>
              )}

              {draft.warnings.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-amber-700">Xəbərdarlıqlar</p>
                  <ul className="space-y-1 text-xs font-medium text-amber-800">
                    {draft.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100"
                >
                  Ləğv et
                </button>
                <button
                  type="button"
                  onClick={() => onApply(draft)}
                  className="rounded-lg bg-[var(--color-primary)] px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-[var(--primary-hover)]"
                >
                  Tətbiq et
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentAiGenerateModal;
