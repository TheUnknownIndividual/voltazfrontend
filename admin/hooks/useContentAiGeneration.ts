import { useEffect, useState } from 'react';
import {
  cancelContentAiGeneration,
  getContentAiGeneration,
  startContentAiGeneration,
  type ContentAiContentType,
  type ContentAiDraft,
  type ContentAiJob,
} from '../../api/contentAi';

export function useContentAiGeneration(contentType: ContentAiContentType) {
  const [job, setJob] = useState<ContentAiJob | null>(null);
  const [draft, setDraft] = useState<ContentAiDraft | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!job || (job.status !== 'queued' && job.status !== 'processing')) return;
    let cancelled = false;
    let timer: number | undefined;
    const poll = async () => {
      try {
        const next = await getContentAiGeneration(job.id);
        if (cancelled) return;
        setJob(next);
        if (next.status === 'review_ready' && next.draft) {
          setDraft(next.draft);
          return;
        }
        if (next.status === 'failed') setError(next.errorMessage || 'AI generation failed.');
        if (next.status === 'queued' || next.status === 'processing') {
          timer = window.setTimeout(poll, 2500);
        }
      } catch {
        if (!cancelled) timer = window.setTimeout(poll, 4000);
      }
    };
    timer = window.setTimeout(poll, 1200);
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [job?.id]);

  const start = async (topic: string, angleNotes: string, includeShillMention: boolean) => {
    setIsStarting(true);
    setError(null);
    try {
      const next = await startContentAiGeneration({
        contentType,
        topic,
        angleNotes: angleNotes || undefined,
        includeShillMention,
      });
      setDraft(null);
      setJob(next);
      return next;
    } catch (err) {
      setError('AI generation could not be started.');
      throw err;
    } finally {
      setIsStarting(false);
    }
  };

  const cancel = async () => {
    if (job) await cancelContentAiGeneration(job.id).catch(() => undefined);
    setJob(null);
    setDraft(null);
    setError(null);
  };

  const reset = () => {
    setJob(null);
    setDraft(null);
    setError(null);
  };

  return { job, draft, isStarting, error, start, cancel, reset };
}
