import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

type DraftReview = {
  draftId: string;
  status: string;
  expiresAt: string;
  review?: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    message: string;
    applicationTypeId: number;
  };
};

const unwrap = <T,>(payload: any): T => {
  if (!payload?.success || payload.data === undefined) throw new Error(payload?.error?.details || 'Request could not be completed.');
  return payload.data as T;
};

/**
 * The only public confirmation screen for MCP/WebMCP-created contact drafts.
 * It deliberately requires a physical visitor click before calling confirm.
 */
const PublicAgentContactConfirmation: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [draft, setDraft] = useState<DraftReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canConfirm = draft?.status === 'PendingConfirmation' && Boolean(token);
  const expiresAt = useMemo(() => {
    if (!draft?.expiresAt) return '';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(draft.expiresAt));
  }, [draft?.expiresAt]);

  useEffect(() => {
    let active = true;
    if (!id || !token) {
      setError('This confirmation link is incomplete or invalid.');
      setLoading(false);
      return () => { active = false; };
    }
    axiosInstance.get(`public-agent/contact-drafts/${encodeURIComponent(id)}/review`, { params: { token } })
      .then((response) => { if (active) setDraft(unwrap<DraftReview>(response.data)); })
      .catch((requestError) => {
        if (!active) return;
        const message = requestError?.response?.data?.error?.details;
        setError(message || 'This confirmation link is invalid or has expired.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, token]);

  const confirm = async () => {
    if (!canConfirm || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await axiosInstance.post(`public-agent/contact-drafts/${encodeURIComponent(id)}/confirm`, { token });
      setDraft((current) => current ? { ...current, ...unwrap<Pick<DraftReview, 'status'>>(response.data), status: 'Submitted' } : current);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.error?.details || 'The request could not be sent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-12 sm:px-6">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Volt.az</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Review contact request</h1>
        {loading && <p className="mt-6 text-slate-600">Loading your draft…</p>}
        {!loading && error && <p role="alert" className="mt-6 rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>}
        {!loading && draft && (
          <>
            {draft.status === 'Submitted' ? (
              <div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-emerald-900">
                <h2 className="font-semibold">Your request has been sent.</h2>
                <p className="mt-1 text-sm">The Volt.az team will contact you using the details below.</p>
              </div>
            ) : !canConfirm ? (
              <div className="mt-6 rounded-2xl bg-amber-50 p-5 text-amber-900">
                <h2 className="font-semibold">This draft can no longer be confirmed.</h2>
                <p className="mt-1 text-sm">Its current status is {draft.status}.</p>
              </div>
            ) : null}
            {draft.review && (
              <dl className="mt-7 divide-y divide-slate-100 rounded-2xl border border-slate-200">
                <div className="grid gap-1 p-4 sm:grid-cols-3"><dt className="text-sm text-slate-500">Name</dt><dd className="font-medium text-slate-900 sm:col-span-2">{draft.review.name} {draft.review.surname}</dd></div>
                <div className="grid gap-1 p-4 sm:grid-cols-3"><dt className="text-sm text-slate-500">Email</dt><dd className="font-medium text-slate-900 sm:col-span-2">{draft.review.email}</dd></div>
                <div className="grid gap-1 p-4 sm:grid-cols-3"><dt className="text-sm text-slate-500">Phone</dt><dd className="font-medium text-slate-900 sm:col-span-2">{draft.review.phone}</dd></div>
                <div className="grid gap-1 p-4 sm:grid-cols-3"><dt className="text-sm text-slate-500">Message</dt><dd className="whitespace-pre-wrap font-medium text-slate-900 sm:col-span-2">{draft.review.message}</dd></div>
              </dl>
            )}
            {canConfirm && <p className="mt-5 text-sm text-slate-500">This draft expires {expiresAt}. By continuing, you ask Volt.az to contact you about this request.</p>}
            <div className="mt-7 flex flex-wrap gap-3">
              {canConfirm && <button type="button" onClick={confirm} disabled={submitting} className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Sending…' : 'Confirm and send'}</button>}
              <button type="button" onClick={() => navigate('/contact')} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">Go to contact page</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PublicAgentContactConfirmation;
