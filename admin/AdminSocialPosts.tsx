import React, { useCallback, useEffect, useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import {
  getSocialPosts,
  getSocialPostingStatus,
  setSocialPostingPaused,
  type SocialPost,
  type SocialPostingStatus,
} from '../api/socialPosts';

interface AdminSocialPostsProps {
  onBack: () => void;
}

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Hamısı' },
  { value: 'published', label: 'Paylaşılıb' },
  { value: 'dryrun', label: 'Sınaq (dry run)' },
  { value: 'rejected', label: 'Rədd edilib' },
  { value: 'failed', label: 'Xəta' },
];

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-700',
  dryrun: 'bg-sky-100 text-sky-700',
  publishing: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  rejected: 'bg-slate-200 text-slate-600',
  candidate: 'bg-slate-100 text-slate-600',
};

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString('az-AZ') : '-');

const AdminSocialPosts: React.FC<AdminSocialPostsProps> = ({ onBack }) => {
  const { showNotification } = useNotification();
  const [status, setStatus] = useState<SocialPostingStatus | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<SocialPost | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextStatus, nextPosts] = await Promise.all([getSocialPostingStatus(), getSocialPosts(filter)]);
      setStatus(nextStatus);
      setPosts(nextPosts);
    } catch {
      showNotification('Sosial paylaşımları yükləmək mümkün olmadı.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter, showNotification]);

  useEffect(() => {
    void load();
  }, [load]);

  const togglePause = async () => {
    if (!status || saving) return;
    setSaving(true);
    try {
      await setSocialPostingPaused(!status.paused);
      showNotification(status.paused ? 'Avtomatik paylaşım davam etdirildi.' : 'Avtomatik paylaşım dayandırıldı.', 'success');
      await load();
    } catch {
      showNotification('Əməliyyat alınmadı.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">
        &larr; Geri
      </button>

      <div>
        <h3 className="text-2xl font-black text-slate-900">Sosial şəbəkə paylaşımları</h3>
        <p className="text-sm text-slate-500 mt-1">
          Facebook və Instagram-a avtomatik paylaşımlar. Gündə az sayda, yüksək keyfiyyətli paylaşım edilir.
        </p>
      </div>

      {status && (
        <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
          <div className="flex flex-wrap gap-3 text-xs font-bold">
            <span className={`px-3 py-1.5 rounded-full ${status.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
              {status.enabled ? 'Aktiv' : 'Söndürülüb'}
            </span>
            {status.dryRun && <span className="px-3 py-1.5 rounded-full bg-sky-100 text-sky-700">Sınaq rejimi (paylaşmır)</span>}
            {status.paused && <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700">Dayandırılıb</span>}
            <span className="px-3 py-1.5 rounded-full bg-white text-slate-600 border border-slate-200">
              Bu gün: {status.postedToday}/{status.maxPostsPerDay}
            </span>
            <span className={`px-3 py-1.5 rounded-full ${status.facebookConfigured ? 'bg-white text-slate-600 border border-slate-200' : 'bg-red-100 text-red-700'}`}>
              Facebook: {status.facebookConfigured ? 'qoşulub' : 'qoşulmayıb'}
            </span>
            <span className={`px-3 py-1.5 rounded-full ${status.instagramConfigured ? 'bg-white text-slate-600 border border-slate-200' : 'bg-red-100 text-red-700'}`}>
              Instagram: {status.instagramConfigured ? 'qoşulub' : 'qoşulmayıb'}
            </span>
          </div>
          {status.instagramTokenNearExpiry && (
            <p className="text-xs font-bold text-amber-700">
              Instagram tokeninin yaşı {status.instagramTokenAgeDays} gündür. 60 gün dolmamış yenisini yaradın.
            </p>
          )}
          <button
            onClick={togglePause}
            disabled={saving}
            className={`px-5 py-2.5 rounded-xl text-sm font-black text-white transition-colors disabled:opacity-50 ${status.paused ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {status.paused ? 'Davam etdir' : 'Dayandır'}
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((item) => (
          <button
            key={item.value || 'all'}
            onClick={() => setFilter(item.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${filter === item.value ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
        {loading ? (
          <p className="p-8 text-sm text-slate-500">Yüklənir...</p>
        ) : posts.length === 0 ? (
          <p className="p-8 text-sm text-slate-500">Hələ paylaşım yoxdur.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {posts.map((post) => (
              <li key={post.id}>
                <button onClick={() => setSelected(post)} className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex gap-4 items-start">
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-black ${STATUS_STYLES[post.status] ?? STATUS_STYLES.candidate}`}>
                    {post.status}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-slate-400">
                      {post.platform} · {post.sourceType} #{post.sourceId} · {formatDate(post.createdAt)}
                      {post.qualityScore != null ? ` · ${post.qualityScore}/100` : ''}
                    </span>
                    <span className="block text-sm text-slate-800 line-clamp-2">{post.caption || post.rejectReason || '-'}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div
            className="bg-white rounded-[2rem] max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-4"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h4 className="text-lg font-black text-slate-900">
                {selected.platform} · {selected.sourceType} #{selected.sourceId}
              </h4>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 text-xl leading-none" aria-label="Bağla">
                &times;
              </button>
            </div>
            {selected.imageUrl && <img src={selected.imageUrl} alt="" className="w-full rounded-2xl max-h-64 object-cover" />}
            <p className="text-sm text-slate-800 whitespace-pre-wrap">{selected.caption || '-'}</p>
            <dl className="text-xs text-slate-500 space-y-1">
              <div>Status: <b>{selected.status}</b> · cəhd: {selected.attempts}</div>
              {selected.qualityScore != null && <div>Keyfiyyət balı: {selected.qualityScore}/100</div>}
              {selected.topicKey && <div>Mövzu: {selected.topicKey}</div>}
              {selected.rejectReason && <div className="text-red-600">Səbəb: {selected.rejectReason}</div>}
              <div>Yaradılıb: {formatDate(selected.createdAt)} · Paylaşılıb: {formatDate(selected.postedAt)}</div>
            </dl>
            <div className="flex gap-3 text-sm font-bold">
              {selected.permalinkUrl && (
                <a href={selected.permalinkUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">Paylaşıma bax</a>
              )}
              {selected.linkUrl && (
                <a href={selected.linkUrl} target="_blank" rel="noreferrer" className="text-slate-600 hover:underline">Mənbə səhifə</a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSocialPosts;
