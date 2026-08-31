import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, AlertTriangle, Archive, Camera, CheckCircle2, MessageCircle, Phone, RefreshCw, Search, Send, StickyNote, UserRound } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import {
  addMetaInboxNote,
  assignMetaInboxConversation,
  getMetaInboxAssignees,
  getMetaInboxConfiguration,
  getMetaInboxConversations,
  getMetaInboxMessages,
  getMetaInboxNotes,
  markMetaInboxConversationRead,
  sendMetaInboxMessage,
  updateMetaInboxConversationStatus,
  type MetaInboxAssignee,
  type MetaInboxConfiguration,
  type MetaInboxConversation,
  type MetaInboxMessage,
  type MetaInboxNote,
  type MetaInboxWebhookDiagnostics
} from '../api/metaInbox';

type AdminLanguage = 'az' | 'en' | 'ru' | 'tr';
const time = (value: string, lang: AdminLanguage) => new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'az-AZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
const mergeById = <T extends { id: number }>(current: T[], incoming: T[]) => {
  const map = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => map.set(item.id, item));
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
};

const AdminMessageInbox: React.FC<{ lang?: AdminLanguage }> = ({ lang = 'az' }) => {
  const { showNotification } = useNotification();
  const en = lang === 'en';
  const copy = en ? {
    listLoadFailed: 'The message list could not be loaded.', settingsLoadFailed: 'Inbox settings could not be loaded.', conversationLoadFailed: 'The conversation could not be loaded.',
    sendFailed: 'The message could not be sent.', noteFailed: 'The internal note could not be added.', assignmentFailed: 'The assignment could not be changed.', statusFailed: 'The conversation status could not be changed.',
    eyebrow: 'Team inbox', title: 'Meta Messages', subtitle: 'Messenger, Instagram and WhatsApp conversations, assignees, and internal team notes.', refresh: 'Refresh',
    channelsPending: 'Some Meta channels are not active yet.', ready: 'ready', notConfigured: 'not configured', search: 'Search by name or message...', open: 'Open', closed: 'Closed', all: 'All', allAssignments: 'All assignments', mine: 'Mine', unassigned: 'Unassigned',
    loading: 'Loading...', noConversation: 'No conversation matches this filter.', newConversation: 'New conversation', selectConversation: 'Select a conversation', close: 'Close', reopen: 'Reopen',
    reply: 'Write a reply to the customer...', connectionPending: 'connection is not complete', sendHelp: 'Enter to send · Shift+Enter for a new line', whatsappWindow: ' · Free-form WhatsApp replies can be sent within 24 hours of the customer’s latest message',
    notes: 'Internal notes', notesHelp: 'Visible only to authorized team members. Not sent to the customer.', selectForNotes: 'Select a conversation to view notes.', noNotes: 'There are no internal notes yet.', notePlaceholder: 'Write a note for the team...', addNote: 'Add internal note'
  } : {
    listLoadFailed: 'Mesaj siyahısı yüklənmədi.', settingsLoadFailed: 'Inbox parametrləri yüklənmədi.', conversationLoadFailed: 'Söhbət yüklənmədi.',
    sendFailed: 'Mesaj göndərilmədi.', noteFailed: 'Daxili qeyd əlavə edilmədi.', assignmentFailed: 'Təyinat dəyişdirilmədi.', statusFailed: 'Söhbətin statusu dəyişdirilmədi.',
    eyebrow: 'Komanda inbox-u', title: 'Meta Mesajları', subtitle: 'Messenger, Instagram və WhatsApp söhbətləri, məsul şəxs və daxili komanda qeydləri.', refresh: 'Yenilə',
    channelsPending: 'Bəzi Meta kanalları hələ aktiv deyil.', ready: 'hazırdır', notConfigured: 'konfiqurasiya edilməyib', search: 'Ad və ya mesaj axtar...', open: 'Açıq', closed: 'Bağlı', all: 'Hamısı', allAssignments: 'Bütün təyinatlar', mine: 'Mənimkilər', unassigned: 'Təyin edilməyib',
    loading: 'Yüklənir...', noConversation: 'Bu filtrə uyğun söhbət yoxdur.', newConversation: 'Yeni söhbət', selectConversation: 'Söhbət seçin', close: 'Bağla', reopen: 'Yenidən aç',
    reply: 'Müştəriyə cavab yazın...', connectionPending: 'bağlantısı tamamlanmayıb', sendHelp: 'Enter göndərir · Shift+Enter yeni sətir', whatsappWindow: ' · WhatsApp sərbəst cavabları son müştəri mesajından sonra 24 saat ərzində göndərilir',
    notes: 'Daxili qeydlər', notesHelp: 'Yalnız komanda üzvləri görür. Müştəriyə göndərilmir.', selectForNotes: 'Qeydləri görmək üçün söhbət seçin.', noNotes: 'Hələ daxili qeyd yoxdur.', notePlaceholder: 'Komanda üçün qeyd yazın...', addNote: 'Daxili qeyd əlavə et'
  };
  const [conversations, setConversations] = useState<MetaInboxConversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MetaInboxMessage[]>([]);
  const [notes, setNotes] = useState<MetaInboxNote[]>([]);
  const [assignees, setAssignees] = useState<MetaInboxAssignee[]>([]);
  const [configuration, setConfiguration] = useState<MetaInboxConfiguration | null>(null);
  const [search, setSearch] = useState('');
  const [delayedSearch, setDelayedSearch] = useState('');
  const [status, setStatus] = useState<'open' | 'closed' | 'all'>('open');
  const [assignment, setAssignment] = useState<'all' | 'mine' | 'unassigned'>('all');
  const [messageDraft, setMessageDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [sending, setSending] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const messageLastId = useRef<number | undefined>(undefined);
  const noteLastId = useRef<number | undefined>(undefined);
  const messageEnd = useRef<HTMLDivElement | null>(null);
  const noteEnd = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(() => conversations.find((item) => item.id === selectedId) || null, [conversations, selectedId]);
  const selectedChannelReady = selected
    ? selected.channel === 'whatsapp' ? configuration?.whatsAppReady === true : configuration?.messengerReady === true
    : false;
  const replaceConversation = (updated: MetaInboxConversation) => setConversations((current) => current.map((item) => item.id === updated.id ? updated : item));

  useEffect(() => {
    const timer = window.setTimeout(() => setDelayedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadList = async (quiet = false) => {
    if (document.visibilityState === 'hidden') return;
    if (!quiet) setLoadingList(true);
    try {
      const page = await getMetaInboxConversations({ search: delayedSearch || undefined, status, assignment, pageSize: 75 });
      setConversations(page.items);
      setSelectedId((current) => current && page.items.some((item) => item.id === current) ? current : null);
    } catch {
      if (!quiet) showNotification(copy.listLoadFailed, 'error');
    } finally {
      if (!quiet) setLoadingList(false);
    }
  };

  useEffect(() => {
    Promise.all([getMetaInboxAssignees(), getMetaInboxConfiguration()])
      .then(([users, config]) => { setAssignees(users); setConfiguration(config); })
      .catch(() => showNotification(copy.settingsLoadFailed, 'error'));
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      getMetaInboxConfiguration().then(setConfiguration).catch(() => undefined);
    }, 10000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    loadList();
    const interval = window.setInterval(() => loadList(true), 15000);
    return () => window.clearInterval(interval);
  }, [delayedSearch, status, assignment]);

  useEffect(() => {
    if (!selectedId) { setMessages([]); setNotes([]); return; }
    let cancelled = false;
    messageLastId.current = undefined;
    noteLastId.current = undefined;
    Promise.all([getMetaInboxMessages(selectedId), getMetaInboxNotes(selectedId), markMetaInboxConversationRead(selectedId)])
      .then(([loadedMessages, loadedNotes, updated]) => {
        if (cancelled) return;
        setMessages(loadedMessages);
        setNotes(loadedNotes);
        messageLastId.current = loadedMessages.at(-1)?.id;
        noteLastId.current = loadedNotes.at(-1)?.id;
        replaceConversation(updated);
      })
      .catch(() => { if (!cancelled) showNotification(copy.conversationLoadFailed, 'error'); });

    const interval = window.setInterval(async () => {
      if (document.visibilityState === 'hidden') return;
      try {
        const [newMessages, newNotes] = await Promise.all([
          getMetaInboxMessages(selectedId, messageLastId.current),
          getMetaInboxNotes(selectedId, noteLastId.current)
        ]);
        if (cancelled) return;
        if (newMessages.length) {
          setMessages((current) => mergeById(current, newMessages));
          messageLastId.current = newMessages.at(-1)?.id;
          markMetaInboxConversationRead(selectedId).then(replaceConversation).catch(() => undefined);
        }
        if (newNotes.length) {
          setNotes((current) => mergeById(current, newNotes));
          noteLastId.current = newNotes.at(-1)?.id;
        }
      } catch { }
    }, 6000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [selectedId]);

  useEffect(() => { messageEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);
  useEffect(() => { noteEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [notes.length]);

  const sendMessage = async () => {
    const text = messageDraft.trim();
    if (!selected || !text || sending) return;
    setSending(true);
    try {
      const created = await sendMetaInboxMessage(selected.id, text);
      setMessages((current) => mergeById(current, [created]));
      messageLastId.current = created.id;
      setMessageDraft('');
      await loadList(true);
    } catch (error: any) {
      showNotification(error?.response?.data?.error?.details || copy.sendFailed, 'error');
    } finally { setSending(false); }
  };

  const addNote = async () => {
    const body = noteDraft.trim();
    if (!selected || !body || savingNote) return;
    setSavingNote(true);
    try {
      const created = await addMetaInboxNote(selected.id, body);
      setNotes((current) => mergeById(current, [created]));
      noteLastId.current = created.id;
      setNoteDraft('');
    } catch (error: any) {
      showNotification(error?.response?.data?.error?.details || copy.noteFailed, 'error');
    } finally { setSavingNote(false); }
  };

  const assign = async (value: string) => {
    if (!selected) return;
    try { replaceConversation(await assignMetaInboxConversation(selected.id, value ? Number(value) : null)); await loadList(true); }
    catch (error: any) { showNotification(error?.response?.data?.error?.details || copy.assignmentFailed, 'error'); }
  };

  const toggleStatus = async () => {
    if (!selected) return;
    try {
      const updated = await updateMetaInboxConversationStatus(selected.id, selected.status === 'open' ? 'closed' : 'open');
      if (status !== 'all' && updated.status !== status) {
        setSelectedId(null);
        await loadList(true);
      } else replaceConversation(updated);
    } catch { showNotification(copy.statusFailed, 'error'); }
  };

  return <section className="space-y-4 animate-in fade-in duration-300">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">{copy.eyebrow}</p><h2 className="mt-1 text-2xl font-black text-slate-900">{copy.title}</h2><p className="mt-1 text-sm text-slate-500">{copy.subtitle}</p></div>
      <button onClick={() => { loadList(); getMetaInboxConfiguration().then(setConfiguration).catch(() => undefined); }} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600"><RefreshCw size={14}/> {copy.refresh}</button>
    </div>

    {configuration && (!configuration.messengerReady || !configuration.whatsAppReady) && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800"><strong>{copy.channelsPending}</strong> Messenger/Instagram: {configuration.messengerReady ? copy.ready : copy.notConfigured} · WhatsApp: {configuration.whatsAppReady ? copy.ready : copy.notConfigured}.</div>}

    {configuration?.webhook && <WebhookMonitor diagnostics={configuration.webhook} lang={lang}/>}

    <div className="grid min-h-[70vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm xl:grid-cols-[320px_minmax(420px,1fr)_320px]">
      <aside className="border-b border-slate-200 xl:border-b-0 xl:border-r">
        <div className="space-y-3 border-b border-slate-100 p-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={copy.search} className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"/></div>
          <div className="grid grid-cols-2 gap-2"><select value={status} onChange={(event) => setStatus(event.target.value as any)} className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold"><option value="open">{copy.open}</option><option value="closed">{copy.closed}</option><option value="all">{copy.all}</option></select><select value={assignment} onChange={(event) => setAssignment(event.target.value as any)} className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold"><option value="all">{copy.allAssignments}</option><option value="mine">{copy.mine}</option><option value="unassigned">{copy.unassigned}</option></select></div>
        </div>
        <div className="max-h-[360px] overflow-y-auto xl:max-h-[calc(70vh-92px)]">
          {loadingList && <div className="p-8 text-center text-sm text-slate-400">{copy.loading}</div>}
          {!loadingList && conversations.length === 0 && <div className="p-8 text-center text-sm text-slate-400">{copy.noConversation}</div>}
          {conversations.map((conversation) => <button key={conversation.id} onClick={() => setSelectedId(conversation.id)} className={`w-full border-b border-slate-100 p-4 text-left transition ${selectedId === conversation.id ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
            <div className="flex items-start gap-3"><Avatar conversation={conversation}/><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-black text-slate-900">{conversation.participantDisplayName}</span><span className="shrink-0 text-[9px] text-slate-400">{time(conversation.lastMessageAt, lang)}</span></div><p className="mt-1 truncate text-xs text-slate-500">{conversation.lastMessagePreview || copy.newConversation}</p><div className="mt-2 flex items-center justify-between gap-2"><span className="truncate text-[10px] font-bold text-slate-400">{conversation.assignedAdminDisplayName || copy.unassigned}</span>{conversation.unreadCount > 0 && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-black text-white">{conversation.unreadCount}</span>}</div></div></div>
          </button>)}
        </div>
      </aside>

      <main className="flex min-h-[560px] flex-col border-b border-slate-200 xl:border-b-0 xl:border-r">
        {!selected ? <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-400"><MessageCircle size={42} strokeWidth={1.5}/><p className="mt-3 text-sm font-bold">{copy.selectConversation}</p></div> : <>
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"><div className="flex items-center gap-3"><Avatar conversation={selected}/><div><h3 className="font-black text-slate-900">{selected.participantDisplayName}</h3><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{selected.channel} · {selected.participantExternalId}</p></div></div><div className="flex items-center gap-2"><select value={selected.assignedAdminUserId || ''} onChange={(event) => assign(event.target.value)} className="max-w-[180px] rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold"><option value="">{copy.unassigned}</option>{assignees.map((user) => <option key={user.id} value={user.id}>{user.displayName}</option>)}</select><button onClick={toggleStatus} className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black ${selected.status === 'open' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'}`}>{selected.status === 'open' ? <Archive size={14}/> : <CheckCircle2 size={14}/>} {selected.status === 'open' ? copy.close : copy.reopen}</button></div></header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4 xl:max-h-[calc(70vh-142px)]">{messages.map((message) => <MessageBubble key={message.id} message={message} lang={lang}/>)}<div ref={messageEnd}/></div>
          <div className="border-t border-slate-100 p-4"><div className="flex items-end gap-2"><textarea value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} disabled={!selectedChannelReady} rows={2} maxLength={2000} placeholder={selectedChannelReady ? copy.reply : `${selected.channel} ${copy.connectionPending}`} className="min-h-[50px] flex-1 resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 disabled:bg-slate-100"/><button onClick={sendMessage} disabled={!messageDraft.trim() || sending || !selectedChannelReady} className="rounded-xl bg-emerald-600 p-4 text-white disabled:opacity-40"><Send size={18}/></button></div><p className="mt-1 text-[10px] text-slate-400">{copy.sendHelp}{selected.channel === 'whatsapp' ? copy.whatsappWindow : ''}</p></div>
        </>}
      </main>

      <aside className="flex min-h-[420px] flex-col bg-amber-50/50">
        <header className="border-b border-amber-100 p-4"><div className="flex items-center gap-2 font-black text-amber-900"><StickyNote size={17}/> {copy.notes}</div><p className="mt-1 text-[10px] text-amber-700">{copy.notesHelp}</p></header>
        <div className="flex-1 space-y-3 overflow-y-auto p-4 xl:max-h-[calc(70vh-152px)]">{!selected && <p className="py-10 text-center text-xs text-amber-700/60">{copy.selectForNotes}</p>}{selected && notes.length === 0 && <p className="py-10 text-center text-xs text-amber-700/60">{copy.noNotes}</p>}{notes.map((note) => <div key={note.id} className="rounded-2xl border border-amber-100 bg-white p-3 shadow-sm"><div className="flex items-center justify-between gap-2"><span className="text-xs font-black text-slate-800">{note.authorDisplayName}</span><span className="text-[9px] text-slate-400">{time(note.createdAt, lang)}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{note.body}</p></div>)}<div ref={noteEnd}/></div>
        <div className="border-t border-amber-100 bg-white/70 p-4"><textarea value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} disabled={!selected} rows={3} maxLength={2000} placeholder={copy.notePlaceholder} className="w-full resize-none rounded-xl border border-amber-200 bg-white p-3 text-sm outline-none focus:border-amber-400 disabled:bg-slate-100"/><button onClick={addNote} disabled={!selected || !noteDraft.trim() || savingNote} className="mt-2 w-full rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-white disabled:opacity-40">{copy.addNote}</button></div>
      </aside>
    </div>
  </section>;
};

const Avatar = ({ conversation }: { conversation: MetaInboxConversation }) => <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-500">{conversation.participantAvatarUrl ? <img src={conversation.participantAvatarUrl} alt="" className="h-full w-full object-cover"/> : <UserRound size={19}/>}<span className={`absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full text-white ${conversation.channel === 'instagram' ? 'bg-fuchsia-500' : conversation.channel === 'whatsapp' ? 'bg-[#25D366]' : 'bg-blue-600'}`}>{conversation.channel === 'instagram' ? <Camera size={9}/> : conversation.channel === 'whatsapp' ? <Phone size={9}/> : <MessageCircle size={9}/>}</span></div>;

const MessageBubble = ({ message, lang }: { message: MetaInboxMessage; lang: AdminLanguage }) => {
  const en = lang === 'en';
  const delivery = message.deliveryStatus === 'read' ? (en ? 'Read' : 'Oxunub')
    : message.deliveryStatus === 'delivered' ? (en ? 'Delivered' : 'Çatdırılıb')
    : message.deliveryStatus === 'failed' ? (en ? 'Failed' : 'Göndərilmədi')
    : message.deliveryStatus === 'deleted' ? (en ? 'Deleted' : 'Silinib')
    : (en ? 'Sent' : 'Göndərilib');
  return <div className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${message.direction === 'outgoing' ? 'rounded-br-md bg-emerald-600 text-white' : 'rounded-bl-md border border-slate-100 bg-white text-slate-700'}`}>{message.text && <p className="whitespace-pre-wrap text-sm">{message.text}</p>}{message.attachments.map((attachment, index) => attachment.url ? attachment.type === 'image' ? <a key={index} href={attachment.url} target="_blank" rel="noreferrer"><img src={attachment.url} alt={attachment.title || 'Attachment'} className="mt-2 max-h-64 rounded-xl object-cover"/></a> : <a key={index} href={attachment.url} target="_blank" rel="noreferrer" className={`mt-2 block text-xs underline ${message.direction === 'outgoing' ? 'text-emerald-50' : 'text-blue-600'}`}>{attachment.title || `${attachment.type} ${en ? 'file' : 'faylı'}`}</a> : <span key={index} className="mt-2 block text-xs">[{attachment.title || attachment.type}]</span>)}<div className={`mt-1.5 flex items-center justify-end gap-2 text-[9px] ${message.direction === 'outgoing' ? 'text-emerald-100' : 'text-slate-400'}`}>{message.sentByAdminDisplayName && <span>{message.sentByAdminDisplayName}</span>}{message.direction === 'outgoing' && <span>{delivery}</span>}<span>{time(message.createdAt, lang)}</span></div></div></div>;
};

const WebhookMonitor = ({ diagnostics, lang }: { diagnostics: MetaInboxWebhookDiagnostics; lang: AdminLanguage }) => {
  const en = lang === 'en';
  const status = diagnostics.lastResponseStatus;
  const accepted = status === 200;
  const failed = status === 401 || status === 500;
  const statusLabel = status
    ? `HTTP ${status}`
    : (en ? 'Waiting for POST' : 'POST gözlənilir');
  const resultLabel: Record<string, string> = {
    waiting: en ? 'No webhook POST has arrived since the API started.' : 'API başladıqdan sonra webhook POST-u daxil olmayıb.',
    accepted: en ? 'The webhook was accepted and processed by the server.' : 'Webhook server tərəfindən qəbul və emal edildi.',
    invalid_signature: en ? 'The Meta signature did not match the App Secret configured on the server.' : 'Meta imzası serverdəki App Secret ilə uyğun gəlmədi.',
    not_configured: en ? 'The webhook is disabled on the server or the App Secret is missing.' : 'Webhook serverdə aktiv deyil və ya App Secret yoxdur.',
    processing_failed: en ? 'The webhook arrived, but message processing or database storage failed.' : 'Webhook çatdı, lakin mesajın emalı və ya bazaya yazılması uğursuz oldu.',
    request_cancelled: en ? 'The connection ended before the webhook request completed.' : 'Webhook sorğusu tamamlanmadan bağlantı dayandırıldı.'
  };
  const timestamp = diagnostics.lastAttemptAtUtc
    ? new Intl.DateTimeFormat(en ? 'en-GB' : 'az-AZ', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(diagnostics.lastAttemptAtUtc))
    : '—';

  return <div className={`rounded-2xl border px-5 py-4 ${accepted ? 'border-emerald-200 bg-emerald-50/70' : failed ? 'border-red-200 bg-red-50/70' : 'border-slate-200 bg-white'}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 rounded-xl p-2 ${accepted ? 'bg-emerald-100 text-emerald-700' : failed ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
          {failed ? (
            <AlertTriangle size={18}/>
          ) : (
            <Activity size={18}/>
          )}
        </span>
        <div>
          <p className="text-sm font-black text-slate-900">{en ? 'Webhook monitor' : 'Webhook monitoru'}</p>
          <p className="mt-1 text-xs text-slate-600">{resultLabel[diagnostics.lastResult] || diagnostics.lastResult}</p>
        </div>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-black ${accepted ? 'bg-emerald-600 text-white' : failed ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{statusLabel}</span>
    </div>
    <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2 xl:grid-cols-4">
      <div><p className="font-bold text-slate-400">{en ? 'Last request' : 'Son sorğu'}</p><p className="mt-1 font-black text-slate-700">{timestamp}</p></div>
      <div><p className="font-bold text-slate-400">{en ? 'Requests' : 'Sorğular'}</p><p className="mt-1 font-black text-slate-700">{diagnostics.attemptCount} {en ? 'total' : 'cəmi'} · {diagnostics.acceptedCount} {en ? 'accepted' : 'qəbul'}</p></div>
      <div><p className="font-bold text-slate-400">{en ? 'Errors' : 'Xətalar'}</p><p className="mt-1 font-black text-slate-700">{diagnostics.rejectedCount} {en ? 'rejected' : 'rədd'} · {diagnostics.failedCount} {en ? 'processing errors' : 'emal xətası'}</p></div>
      <div><p className="font-bold text-slate-400">{en ? 'Latest payload' : 'Son paket'}</p><p className="mt-1 font-black text-slate-700">{diagnostics.objectType || '—'}{diagnostics.field ? ` · ${diagnostics.field}` : ''}</p></div>
    </div>
    {accepted && <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-emerald-200/70 pt-3 text-[11px] font-bold text-emerald-800">
      <span>Phone Number ID: {diagnostics.phoneNumberId || '—'}</span>
      <span>{en ? 'Messages' : 'Mesaj'}: {diagnostics.messageCount}</span>
      <span>{en ? 'Status updates' : 'Status yeniləməsi'}: {diagnostics.statusCount}</span>
    </div>}
    <p className="mt-3 text-[10px] text-slate-400">{en ? 'Metrics cover webhook events since the current API process started; sensitive data and message text are not stored in this monitor.' : 'Göstəricilər cari API prosesi başladıqdan sonrakı webhook hadisələridir; məxfi məlumat və mesaj mətni saxlanılmır.'}</p>
  </div>;
};

export default AdminMessageInbox;
