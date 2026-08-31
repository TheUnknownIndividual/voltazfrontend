import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, Loader2, LockKeyhole, MessageCircle, Phone, RefreshCw, ShieldCheck, Webhook } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import {
  completeWhatsAppOnboarding,
  getWhatsAppOnboardingStatus,
  registerWhatsAppOnboardingPhone,
  type WhatsAppOnboardingResult,
  type WhatsAppOnboardingStatus
} from '../api/metaInbox';

declare global {
  interface Window {
    FB?: {
      init: (options: Record<string, unknown>) => void;
      login: (callback: (response: MetaLoginResponse) => void, options: Record<string, unknown>) => void;
    };
    fbAsyncInit?: () => void;
  }
}

interface MetaLoginResponse {
  authResponse?: { code?: string };
  status?: string;
}

interface EmbeddedSignupSession {
  wabaId: string;
  phoneNumberId: string;
}

interface AdminWhatsAppSetupProps { onBack: () => void; lang?: 'az' | 'en' | 'ru' | 'tr'; }

let facebookSdkPromise: Promise<void> | null = null;
const loadFacebookSdk = (appId: string, version: string) => {
  if (window.FB) {
    window.FB.init({ appId, autoLogAppEvents: false, xfbml: false, version });
    return Promise.resolve();
  }
  if (facebookSdkPromise) return facebookSdkPromise;
  facebookSdkPromise = new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('Meta SDK load timeout')), 15000);
    window.fbAsyncInit = () => {
      window.clearTimeout(timeout);
      window.FB?.init({ appId, autoLogAppEvents: false, xfbml: false, version });
      resolve();
    };
    const existing = document.getElementById('facebook-jssdk');
    if (existing) return;
    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.onerror = () => {
      window.clearTimeout(timeout);
      facebookSdkPromise = null;
      reject(new Error('Meta SDK failed to load'));
    };
    document.head.appendChild(script);
  });
  return facebookSdkPromise;
};

const parseSignupMessage = (event: MessageEvent): EmbeddedSignupSession | 'cancelled' | null => {
  if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') return null;
  let payload: any = event.data;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch { return null; }
  }
  if (payload?.type !== 'WA_EMBEDDED_SIGNUP') return null;
  if (payload.event === 'CANCEL' || payload.event === 'ERROR') return 'cancelled';
  if (payload.event !== 'FINISH') return null;
  const data = payload.data || {};
  const wabaId = String(data.waba_id || data.whatsapp_business_account_id || '').trim();
  const phoneNumberId = String(data.phone_number_id || '').trim();
  return wabaId && phoneNumberId ? { wabaId, phoneNumberId } : null;
};

const AdminWhatsAppSetup: React.FC<AdminWhatsAppSetupProps> = ({ onBack, lang = 'az' }) => {
  const { showNotification } = useNotification();
  const en = lang === 'en';
  const copy = en ? {
    forbidden: 'WhatsApp connection permission is required for this page.', loadFailed: 'The WhatsApp connection status could not be loaded.', cancelled: 'The Meta signup process was cancelled.', completeFailed: 'The WhatsApp connection could not be completed.',
    pinPrompt: 'Enter the six-digit PIN to activate the phone.', connectedNotice: 'The WhatsApp Cloud API connection is active.', acceptedNotice: 'Meta accepted the signup. Refresh the status after a few seconds.', popupIncomplete: 'The Meta login window was closed or not completed.', sdkFailed: 'The Meta connection module could not be loaded. Check browser extensions and try again.', registrationFailed: 'The phone could not be activated.',
    back: 'Back to settings', title: 'WhatsApp Connection', subtitle: 'Connect the Volt number to Cloud API while keeping the WhatsApp Business mobile app.', refresh: 'Refresh', active: 'WhatsApp Cloud API is active', ready: 'Ready to connect', incomplete: 'Server configuration is incomplete',
    connectedHelp: 'Real messages should reach the Volt Meta Inbox through the webhook.', readyHelp: 'Use the button below to start Meta’s official Coexistence flow.', phone: 'Phone', verification: 'Verification', activeValue: 'Active', inactiveValue: 'Not active', wabaSubscription: 'WABA subscription',
    verifiedName: 'Verified name', runtime: 'Runtime', platform: 'Platform', accountMode: 'Account mode', quality: 'Quality', completeRegistration: 'Complete phone registration', pinHelp: 'Enter the six-digit two-step verification PIN selected for WhatsApp. The PIN is not stored.', pinPlaceholder: '6-digit PIN', activate: 'Activate',
    reconnect: 'Reconnect', connect: 'Connect WhatsApp Business', guide: 'Meta guide', reconnectTitle: 'Reconnect WhatsApp?', reconnectHelp: 'Meta onboarding will open again. Existing inbox data will not be deleted.', cancel: 'Cancel', continue: 'Continue'
  } : {
    forbidden: 'Bu səhifə üçün WhatsApp bağlantısı icazəsi tələb olunur.', loadFailed: 'WhatsApp bağlantı vəziyyəti yüklənmədi.', cancelled: 'Meta qeydiyyat prosesi dayandırıldı.', completeFailed: 'WhatsApp bağlantısı tamamlanmadı.',
    pinPrompt: 'Telefonu aktivləşdirmək üçün 6 rəqəmli PIN daxil edin.', connectedNotice: 'WhatsApp Cloud API bağlantısı aktivdir.', acceptedNotice: 'Meta qeydiyyatı qəbul etdi. Vəziyyəti bir neçə saniyə sonra yeniləyin.', popupIncomplete: 'Meta giriş pəncərəsi tamamlanmadı və ya bağlandı.', sdkFailed: 'Meta bağlantı modulu yüklənmədi. Brauzer əlavələrini yoxlayıb yenidən cəhd edin.', registrationFailed: 'Telefon aktivləşdirilmədi.',
    back: 'Ayarlara qayıt', title: 'WhatsApp Bağlantısı', subtitle: 'Volt nömrəsini WhatsApp Business mobil tətbiqini saxlayaraq Cloud API-yə qoşun.', refresh: 'Yenilə', active: 'WhatsApp Cloud API aktivdir', ready: 'Qoşulmağa hazırdır', incomplete: 'Server konfiqurasiyası tamamlanmayıb',
    connectedHelp: 'Real mesajlar webhook vasitəsilə Volt Meta Inbox-a çatmalıdır.', readyHelp: 'Aşağıdakı düymə ilə Meta-nın rəsmi Coexistence prosesini başladın.', phone: 'Telefon', verification: 'Doğrulama', activeValue: 'Aktivdir', inactiveValue: 'Aktiv deyil', wabaSubscription: 'WABA abunəliyi',
    verifiedName: 'Təsdiqlənmiş ad', runtime: 'Runtime', platform: 'Platforma', accountMode: 'Account mode', quality: 'Keyfiyyət', completeRegistration: 'Telefon qeydiyyatını tamamlayın', pinHelp: 'WhatsApp üçün seçdiyiniz 6 rəqəmli iki mərhələli doğrulama PIN-ini daxil edin. PIN saxlanılmır.', pinPlaceholder: '6 rəqəmli PIN', activate: 'Aktivləşdir',
    reconnect: 'Yenidən qoş', connect: 'WhatsApp Business-i qoş', guide: 'Meta təlimatı', reconnectTitle: 'WhatsApp-ı yenidən qoşmaq?', reconnectHelp: 'Meta onboarding yenidən açılacaq. Mövcud inbox məlumatları silinməyəcək.', cancel: 'Ləğv et', continue: 'Davam et'
  };
  const [status, setStatus] = useState<WhatsAppOnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [pendingCode, setPendingCode] = useState('');
  const [signupSession, setSignupSession] = useState<EmbeddedSignupSession | null>(null);
  const [continuationToken, setContinuationToken] = useState('');
  const [pin, setPin] = useState('');
  const [showReconnect, setShowReconnect] = useState(false);
  const submittingPair = useRef('');

  const graphVersion = useMemo(() => 'v26.0', []);
  const loadStatus = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try { setStatus(await getWhatsAppOnboardingStatus()); }
    catch (error: any) { showNotification(error?.response?.status === 403 ? copy.forbidden : copy.loadFailed, 'error'); }
    finally { if (!quiet) setLoading(false); }
  };

  useEffect(() => { loadStatus(); }, []);

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const parsed = parseSignupMessage(event);
      if (parsed === 'cancelled') {
        setConnecting(false);
        setPendingCode('');
        setSignupSession(null);
        showNotification(copy.cancelled, 'warning');
      } else if (parsed) setSignupSession(parsed);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [copy.cancelled]);

  useEffect(() => {
    if (!pendingCode || !signupSession) return;
    const pairKey = `${pendingCode}:${signupSession.wabaId}:${signupSession.phoneNumberId}`;
    if (submittingPair.current === pairKey) return;
    submittingPair.current = pairKey;
    completeWhatsAppOnboarding({
      code: pendingCode,
      whatsAppBusinessAccountId: signupSession.wabaId,
      phoneNumberId: signupSession.phoneNumberId
    }).then(handleResult).catch((error: any) => {
      showNotification(error?.response?.data?.error?.details || copy.completeFailed, 'error');
    }).finally(() => {
      setConnecting(false);
      setPendingCode('');
      setSignupSession(null);
    });
  }, [pendingCode, signupSession]);

  const handleResult = (result: WhatsAppOnboardingResult) => {
    setStatus(result.status);
    if (result.requiresPin && result.continuationToken) {
      setContinuationToken(result.continuationToken);
      showNotification(copy.pinPrompt, 'warning');
      return;
    }
    setContinuationToken('');
    setPin('');
    showNotification(result.connected ? copy.connectedNotice : copy.acceptedNotice);
  };

  const beginConnection = async () => {
    if (!status?.configured || connecting) return;
    setShowReconnect(false);
    setConnecting(true);
    setPendingCode('');
    setSignupSession(null);
    submittingPair.current = '';
    try {
      await loadFacebookSdk(status.appId, graphVersion);
      if (!window.FB) throw new Error('Meta SDK unavailable');
      window.FB.login((response) => {
        const code = response.authResponse?.code?.trim();
        if (!code) {
          setConnecting(false);
          showNotification(copy.popupIncomplete, 'warning');
          return;
        }
        setPendingCode(code);
      }, {
        config_id: status.configurationId,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          version: 'v4',
          featureType: 'whatsapp_business_app_onboarding',
          sessionInfoVersion: '3'
        }
      });
    } catch {
      setConnecting(false);
      showNotification(copy.sdkFailed, 'error');
    }
  };

  const registerPhone = async () => {
    if (!continuationToken || !/^\d{6}$/.test(pin)) return;
    setConnecting(true);
    try { handleResult(await registerWhatsAppOnboardingPhone(continuationToken, pin)); }
    catch (error: any) { showNotification(error?.response?.data?.error?.details || copy.registrationFailed, 'error'); }
    finally { setConnecting(false); }
  };

  if (loading) return <div className="flex min-h-[420px] items-center justify-center"><Loader2 className="animate-spin text-emerald-600" size={32}/></div>;

  return <section className="space-y-6 animate-in fade-in duration-300">
    <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition hover:text-emerald-600"><ArrowLeft size={15}/> {copy.back}</button>

    <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-5 border-b border-slate-100 p-7 md:p-10">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-[#25D366]/10 p-3 text-[#168c43]"><MessageCircle size={28}/></div>
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Meta Cloud API</p><h2 className="mt-1 text-2xl font-black text-slate-900">{copy.title}</h2><p className="mt-2 max-w-2xl text-sm text-slate-500">{copy.subtitle}</p></div>
        </div>
        <button onClick={() => loadStatus()} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600"><RefreshCw size={14}/> {copy.refresh}</button>
      </div>

      <div className="space-y-6 p-7 md:p-10">
        <div className={`flex items-start gap-3 rounded-2xl border p-5 ${status?.connected ? 'border-emerald-200 bg-emerald-50' : status?.configured ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
          {status?.connected ? (
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600"/>
          ) : (
            <AlertCircle className={`mt-0.5 shrink-0 ${status?.configured ? 'text-amber-600' : 'text-red-600'}`}/>
          )}
          <div><p className="font-black text-slate-900">{status?.connected ? copy.active : status?.configured ? copy.ready : copy.incomplete}</p><p className="mt-1 text-xs leading-relaxed text-slate-600">{status?.lastError || (status?.connected ? copy.connectedHelp : copy.readyHelp)}</p></div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatusCard icon={<Phone size={17}/>} label={copy.phone} value={status?.displayPhoneNumber || status?.phoneNumberId || '—'} ok={status?.runtimeStatus === 'CONNECTED'}/>
          <StatusCard icon={<ShieldCheck size={17}/>} label={copy.verification} value={status?.codeVerificationStatus || '—'} ok={status?.codeVerificationStatus === 'VERIFIED'}/>
          <StatusCard icon={<Webhook size={17}/>} label="Webhook: messages" value={status?.webhookMessagesSubscribed ? copy.activeValue : copy.inactiveValue} ok={status?.webhookMessagesSubscribed}/>
          <StatusCard icon={<MessageCircle size={17}/>} label={copy.wabaSubscription} value={status?.appSubscribed ? copy.activeValue : copy.inactiveValue} ok={status?.appSubscribed}/>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-xs sm:grid-cols-2 lg:grid-cols-3">
          <Detail label={copy.verifiedName} value={status?.verifiedName}/><Detail label={copy.runtime} value={status?.runtimeStatus}/><Detail label={copy.platform} value={status?.platformType}/><Detail label={copy.accountMode} value={status?.accountMode}/><Detail label={copy.quality} value={status?.qualityRating}/><Detail label="WABA ID" value={status?.whatsAppBusinessAccountId}/>
        </div>

        {continuationToken && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5"><div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 text-blue-600" size={20}/><div className="flex-1"><p className="font-black text-slate-900">{copy.completeRegistration}</p><p className="mt-1 text-xs text-slate-600">{copy.pinHelp}</p><div className="mt-4 flex max-w-sm gap-2"><input type="password" inputMode="numeric" autoComplete="off" maxLength={6} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder={copy.pinPlaceholder} className="min-w-0 flex-1 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-bold tracking-[0.3em] outline-none focus:border-blue-500"/><button onClick={registerPhone} disabled={!/^\d{6}$/.test(pin) || connecting} className="rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white disabled:opacity-40">{copy.activate}</button></div></div></div></div>}

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
          <button onClick={() => status?.connected ? setShowReconnect(true) : beginConnection()} disabled={!status?.configured || connecting} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-emerald-200 disabled:cursor-not-allowed disabled:opacity-40">{connecting ? <Loader2 className="animate-spin" size={16}/> : <MessageCircle size={16}/>} {status?.connected ? copy.reconnect : copy.connect}</button>
          <a href="https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-emerald-600">{copy.guide} <ExternalLink size={13}/></a>
        </div>
      </div>
    </div>

    {showReconnect && <div onMouseDown={(event) => { if (event.target === event.currentTarget) setShowReconnect(false); }} className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="whatsapp-reconnect-title" className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"><h3 id="whatsapp-reconnect-title" className="text-lg font-black text-slate-900">{copy.reconnectTitle}</h3><p className="mt-3 text-sm leading-relaxed text-slate-500">{copy.reconnectHelp}</p><div className="mt-6 flex justify-end gap-3"><button onClick={() => setShowReconnect(false)} className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-600">{copy.cancel}</button><button onClick={beginConnection} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white">{copy.continue}</button></div></div></div>}
  </section>;
};

const StatusCard = ({ icon, label, value, ok }: { icon: React.ReactNode; label: string; value: string; ok?: boolean }) => <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div className={`flex items-center gap-2 ${ok ? 'text-emerald-600' : 'text-slate-400'}`}>{icon}<span className="text-[9px] font-black uppercase tracking-widest">{label}</span></div><p className="mt-3 break-words text-sm font-black text-slate-800">{value}</p></div>;
const Detail = ({ label, value }: { label: string; value?: string | null }) => <div><p className="font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 break-words font-black text-slate-700">{value || '—'}</p></div>;

export default AdminWhatsAppSetup;
