import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, FileSearch, PauseCircle, Search, XCircle } from 'lucide-react';
import {
  completeSolarInverterQa,
  getSolarInverterQaDetail,
  getSolarInverterQaList,
  updateSolarInverterQa,
  type SolarInverterQaDataset,
  type SolarInverterQaDetail,
  type SolarInverterQaList,
  type SolarInverterQaStatus
} from '../api/solarInverterQa';
import { useNotification } from '../contexts/NotificationContext';

const statusOptions: Array<{
  value: SolarInverterQaStatus;
  label: string;
  activeClass: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: 'not-confirmed',
    label: 'Təsdiqlənməyib',
    activeClass: 'border-rose-300 bg-rose-100 text-rose-800',
    icon: XCircle
  },
  {
    value: 'hold',
    label: 'Hold',
    activeClass: 'border-amber-300 bg-amber-100 text-amber-800',
    icon: PauseCircle
  },
  {
    value: 'confirmed',
    label: 'Təsdiqlənib',
    activeClass: 'border-emerald-300 bg-emerald-100 text-emerald-800',
    icon: CheckCircle2
  }
];

const statusClass = (status: SolarInverterQaStatus) =>
  status === 'confirmed'
    ? 'bg-emerald-100 text-emerald-800'
    : status === 'hold'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-rose-100 text-rose-800';

const AdminSolarInverterQa: React.FC = () => {
  const { showNotification, confirm } = useNotification();
  const [list, setList] = useState<SolarInverterQaList | null>(null);
  const [status, setStatus] = useState<SolarInverterQaStatus | ''>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [detail, setDetail] = useState<SolarInverterQaDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [qaStatus, setQaStatus] = useState<SolarInverterQaStatus>('not-confirmed');
  const [qaNotes, setQaNotes] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [datasetText, setDatasetText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const pageSize = 25;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadList = async () => {
    setIsLoading(true);
    try {
      setList(await getSolarInverterQaList({
        status: status || undefined,
        search: debouncedSearch || undefined,
        page,
        pageSize
      }));
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'Datasheet QA siyahısı yüklənmədi.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [status, debouncedSearch, page]);

  const totalPages = Math.max(1, Math.ceil((list?.totalCount ?? 0) / pageSize));
  const totalDatasets = useMemo(
    () => Object.values(list?.statusCounts ?? {}).reduce((sum, count) => sum + count, 0),
    [list]
  );
  const totalReviewed = useMemo(
    () => (list?.statusCounts?.confirmed ?? 0) + (list?.statusCounts?.hold ?? 0),
    [list]
  );

  const openDetail = async (specificationId: number) => {
    setIsDetailLoading(true);
    try {
      const loaded = await getSolarInverterQaDetail(specificationId);
      setDetail(loaded);
      setQaStatus(loaded.qaStatus);
      setQaNotes(loaded.qaNotes || '');
      setCorrectedText(loaded.correctedExtractedText || '');
      setDatasetText(JSON.stringify(loaded.dataset, null, 2));
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'QA dataseti yüklənmədi.',
        'error'
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeDetail = () => {
    if (isSaving) return;
    setDetail(null);
    setDatasetText('');
  };

  const parseDataset = (): SolarInverterQaDataset | null => {
    try {
      const parsed = JSON.parse(datasetText);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error();
      }
      return parsed as SolarInverterQaDataset;
    } catch {
      showNotification('Dataset JSON düzgün formatda deyil.', 'error');
      return null;
    }
  };

  const save = async (completeAfterSave = false) => {
    if (!detail) return;
    if (completeAfterSave && qaStatus !== 'confirmed') {
      showNotification('Done üçün dataset əvvəlcə “Təsdiqlənib” kimi işarələnməlidir.', 'warning');
      return;
    }

    const dataset = parseDataset();
    if (!dataset) return;
    if (completeAfterSave && !(await confirm(
      'Bu dataset yadda saxlanılsın və Done edilsin? Avtomatik production promotion yalnız serverdə ayrıca aktivləşdirildikdə işləyəcək.'
    ))) {
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateSolarInverterQa(detail.specificationId, {
        qaStatus,
        qaNotes: qaNotes.trim() || null,
        correctedExtractedText: correctedText.trim() || null,
        dataset
      });
      setDetail(updated);
      if (completeAfterSave) {
        const result = await completeSolarInverterQa(detail.specificationId);
        showNotification(
          result.message,
          result.promotedToProduction ? 'success' : 'warning'
        );
        const refreshed = await getSolarInverterQaDetail(detail.specificationId);
        setDetail(refreshed);
      } else {
        showNotification('QA dataseti yadda saxlanıldı.');
      }
      await loadList();
    } catch (error) {
      showNotification(
        error instanceof Error ? error.message : 'QA dataseti yadda saxlanılmadı.',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Engineering data quality</p>
        <h2 className="mt-1 text-2xl font-black text-slate-900">İnverter Datasheet QA</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">
          OCR nəticəsini production məhsulunda göstərilən Datasheet şəkilləri ilə müqayisə edin, datasetə düzəliş verin və yalnız bütün limitlər yoxlandıqdan sonra təsdiqləyin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Ümumi dataset', value: totalDatasets, tone: 'text-slate-900' },
          { label: 'Təsdiqlənməyib', value: list?.statusCounts?.['not-confirmed'] ?? 0, tone: 'text-rose-600' },
          { label: 'Hold', value: list?.statusCounts?.hold ?? 0, tone: 'text-amber-600' },
          { label: 'Baxılıb', value: totalReviewed, tone: 'text-emerald-600' }
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.label}</div>
            <div className={`mt-2 text-3xl font-black ${item.tone}`}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[2rem] border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setStatus(''); setPage(1); }}
              className={`rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest ${
                status === '' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Hamısı
            </button>
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => { setStatus(option.value); setPage(1); }}
                className={`rounded-xl border px-4 py-2 text-[9px] font-black uppercase tracking-widest ${
                  status === option.value
                    ? option.activeClass
                    : 'border-slate-100 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="relative block w-full lg:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Model, məhsul və ya wattage…"
              className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-5 py-4">Məhsul / variant</th>
                <th className="px-5 py-4">Tip</th>
                <th className="px-5 py-4">Sənəd</th>
                <th className="px-5 py-4">QA status</th>
                <th className="px-5 py-4">Promotion</th>
                <th className="px-5 py-4 text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!isLoading && list?.items.map((item) => (
                <tr key={item.specificationId} className="text-sm hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="font-black text-slate-900">{item.modelLabel}</div>
                    <div className="mt-1 text-xs text-slate-400">{item.productName} · {item.technicalPower}</div>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-slate-600">{item.systemType} · {item.phase}</td>
                  <td className="px-5 py-4">
                    <div className="text-xs font-bold text-slate-600">{item.documentKind || 'unknown'}</div>
                    <div className={`mt-1 text-[9px] font-black uppercase ${item.requiresOcr ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {item.requiresOcr ? 'OCR tələb olunur' : 'Text hazırdır'}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${statusClass(item.qaStatus)}`}>
                      {statusOptions.find((option) => option.value === item.qaStatus)?.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold">
                    {item.productionPromotedAt
                      ? <span className="text-emerald-600">Production-a göndərilib</span>
                      : item.qaDoneAt
                        ? <span className="text-amber-600">Manual promotion gözləyir</span>
                        : <span className="text-slate-400">Hazır deyil</span>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {(item.sourceUrls?.[0] || item.sourceUrl) && (
                        <a
                          href={item.sourceUrls?.[0] || item.sourceUrl || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:border-emerald-300 hover:text-emerald-700"
                          title="Production Datasheet şəklini aç"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => openDetail(item.specificationId)}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white hover:bg-emerald-700"
                      >
                        Yoxla
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && (
            <div className="px-6 py-16 text-center text-xs font-black uppercase tracking-widest text-slate-400">Yüklənir…</div>
          )}
          {!isLoading && (list?.items.length ?? 0) === 0 && (
            <div className="px-6 py-16 text-center">
              <FileSearch className="mx-auto h-9 w-9 text-slate-300" aria-hidden="true" />
              <div className="mt-3 text-sm font-black text-slate-600">QA dataseti tapılmadı</div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 p-5">
          <span className="text-xs font-bold text-slate-400">{list?.totalCount ?? 0} dataset · səhifə {page}/{totalPages}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {(detail || isDetailLoading) && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetail();
          }}
        >
          <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            {isDetailLoading || !detail ? (
              <div className="p-16 text-center text-xs font-black uppercase tracking-widest text-slate-400">Dataset açılır…</div>
            ) : (
              <>
                <div className="sticky top-0 z-10 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-white/95 p-6 backdrop-blur">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Dataset #{detail.specificationId}</div>
                    <h3 className="mt-1 text-xl font-black text-slate-900">{detail.productName} · {detail.dataset.technicalPower}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                      <span>{detail.documentKind || 'unknown document'}</span>
                      <span>· {detail.sourceUrls?.length || detail.pageCount || 0} şəkil</span>
                      <span>· {detail.requiresOcr ? 'OCR yenidən tələb olunur' : 'Extraction hazırdır'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={closeDetail} className="rounded-xl border border-slate-200 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                      Bağla
                    </button>
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  {(detail.sourceUrls?.length > 0 || detail.sourceUrl) && (
                    <div>
                      <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Production-da göstərilən Datasheet şəkilləri
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {(detail.sourceUrls?.length ? detail.sourceUrls : [detail.sourceUrl!]).map((sourceUrl, index) => (
                          <a
                            key={sourceUrl}
                            href={sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                          >
                            <img
                              src={sourceUrl}
                              alt={`Production Datasheet ${index + 1}`}
                              className="h-80 w-full bg-white object-contain"
                            />
                            <span className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:text-emerald-700">
                              Datasheet şəkli {index + 1}
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">QA tagging</div>
                    <div className="flex flex-wrap gap-3">
                      {statusOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setQaStatus(option.value)}
                            className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-[10px] font-black uppercase tracking-widest ${
                              qaStatus === option.value
                                ? option.activeClass
                                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Editable structured dataset (JSON)</span>
                      <textarea
                        value={datasetText}
                        onChange={(event) => setDatasetText(event.target.value)}
                        spellCheck={false}
                        className="h-[520px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-200 outline-none focus:border-emerald-500"
                      />
                    </label>
                    <div className="space-y-5">
                      <div>
                        <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Original OCR / extracted text</div>
                        <pre className="h-64 overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">{detail.originalExtractedText || 'Extracted text yoxdur.'}</pre>
                      </div>
                      <label className="block">
                        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Corrected extracted text</span>
                        <textarea
                          value={correctedText}
                          onChange={(event) => setCorrectedText(event.target.value)}
                          placeholder="OCR səhvləri varsa düzəldilmiş mətni burada saxlayın…"
                          className="h-40 w-full resize-y rounded-2xl border border-slate-200 p-4 text-xs leading-relaxed text-slate-700 outline-none focus:border-emerald-500"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">QA qeydləri</span>
                        <textarea
                          value={qaNotes}
                          onChange={(event) => setQaNotes(event.target.value)}
                          className="h-28 w-full resize-y rounded-2xl border border-slate-200 p-4 text-xs leading-relaxed text-slate-700 outline-none focus:border-emerald-500"
                        />
                      </label>
                    </div>
                  </div>

                  {detail.productionPromotionMessage && (
                    <div className={`rounded-2xl border p-4 text-xs font-bold ${
                      detail.productionPromotedAt
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-amber-200 bg-amber-50 text-amber-800'
                    }`}>
                      {detail.productionPromotionMessage}
                    </div>
                  )}

                  <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => save(false)}
                      className="rounded-2xl border border-slate-200 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 disabled:opacity-50"
                    >
                      Yadda saxla
                    </button>
                    <button
                      type="button"
                      disabled={isSaving || qaStatus !== 'confirmed'}
                      onClick={() => save(true)}
                      className="rounded-2xl bg-emerald-600 px-7 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isSaving ? 'İcra olunur…' : 'Done'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminSolarInverterQa;
