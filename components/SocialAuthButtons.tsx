import React, { useState } from 'react';
import { AppUser, useAuth } from '../contexts/AuthContext';

type Language = 'az' | 'en' | 'ru' | 'tr';
type SocialMode = 'login' | 'register';
type AuthProvider = 'google' | 'apple' | 'passkey';

interface SocialAuthButtonsProps {
  mode: SocialMode;
  lang?: Language;
  getProfile?: () => { name?: string; email?: string; phone?: string; address?: string };
  onSuccess: (user: AppUser) => void;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '315961150370-d8j6iq8gbqt72sp1l7o9tt2q8o21fj0r.apps.googleusercontent.com';
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID || 'az.volt.log';
const AUTH_ICONS = {
  google: '/auth-icons/google.png',
  apple: '/auth-icons/apple.png',
  passkey: '/auth-icons/passkey.png',
};

const getAppleRedirectUri = () =>
  import.meta.env.VITE_APPLE_REDIRECT_URI || 'https://test.volt.az/api/auth/callback/apple';

const copy = {
  az: {
    google: 'Google ilə davam et',
    apple: 'Apple ilə davam et',
    passkey: 'Passkey ilə daxil ol',
    working: 'Hazırlanır...',
    unavailable: 'Bu giriş üsulu hazırda əlçatan deyil.',
    passkeyProfile: 'Passkey üçün ad, soyad və email tələb olunur.',
  },
  en: {
    google: 'Continue with Google',
    apple: 'Continue with Apple',
    passkey: 'Continue with passkey',
    working: 'Preparing...',
    unavailable: 'This sign-in method is not available right now.',
    passkeyProfile: 'First name, last name, and email are required for passkey.',
  },
  ru: {
    google: 'Продолжить с Google',
    apple: 'Продолжить с Apple',
    passkey: 'Войти с passkey',
    working: 'Подготовка...',
    unavailable: 'Этот способ входа сейчас недоступен.',
    passkeyProfile: 'Для passkey требуются имя, фамилия и email.',
  },
  tr: {
    google: 'Google ile devam et',
    apple: 'Apple ile devam et',
    passkey: 'Passkey ile giriş yap',
    working: 'Hazırlanıyor...',
    unavailable: 'Bu giriş yöntemi şu anda kullanılamıyor.',
    passkeyProfile: 'Passkey için ad, soyad ve email gereklidir.',
  },
};

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if ((existing as any).dataset.loaded === 'true') resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

const decodeJwtPayload = (token: string) => {
  const payload = token.split('.')[1];
  if (!payload) return {};
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
};

const splitName = (name?: string) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  };
};

const base64UrlToArrayBuffer = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
};

const arrayBufferToBase64Url = (buffer: ArrayBuffer | null | undefined) => {
  if (!buffer) return null;
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const parseCreationOptions = (publicKeyOptionsJson: string): PublicKeyCredentialCreationOptions => {
  const options = JSON.parse(publicKeyOptionsJson);
  options.challenge = base64UrlToArrayBuffer(options.challenge);
  options.user.id = base64UrlToArrayBuffer(options.user.id);
  options.excludeCredentials = (options.excludeCredentials || []).map((credential: any) => ({
    ...credential,
    id: base64UrlToArrayBuffer(credential.id),
  }));
  return options;
};

const parseRequestOptions = (publicKeyOptionsJson: string): PublicKeyCredentialRequestOptions => {
  const options = JSON.parse(publicKeyOptionsJson);
  options.challenge = base64UrlToArrayBuffer(options.challenge);
  options.allowCredentials = (options.allowCredentials || []).map((credential: any) => ({
    ...credential,
    id: base64UrlToArrayBuffer(credential.id),
  }));
  return options;
};

const serializeCredential = (credential: PublicKeyCredential) => {
  const response = credential.response as AuthenticatorAttestationResponse & AuthenticatorAssertionResponse;
  return {
    id: arrayBufferToBase64Url(credential.rawId),
    rawId: arrayBufferToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      attestationObject: arrayBufferToBase64Url((response as AuthenticatorAttestationResponse).attestationObject),
      authenticatorData: arrayBufferToBase64Url((response as AuthenticatorAssertionResponse).authenticatorData),
      clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
      signature: arrayBufferToBase64Url((response as AuthenticatorAssertionResponse).signature),
      userHandle: arrayBufferToBase64Url((response as AuthenticatorAssertionResponse).userHandle),
    },
  };
};

const buttonClass = 'flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 transition-all hover:-translate-y-0.5 hover:border-emerald-500 hover:text-emerald-600 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60';
const iconClass = 'h-5 w-5 object-contain';

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ mode, lang = 'az', getProfile, onSuccess }) => {
  const t = copy[lang] || copy.az;
  const {
    loginWithGoogle,
    loginWithApple,
    beginPasskeyRegistration,
    completePasskeyRegistration,
    beginPasskeyLogin,
    completePasskeyLogin,
  } = useAuth();
  const [busy, setBusy] = useState<AuthProvider | null>(null);
  const [error, setError] = useState('');

  const finish = (user: AppUser | null) => {
    if (!user) {
      setError(t.unavailable);
      return;
    }
    onSuccess(user);
  };

  const handleGoogle = async () => {
    setBusy('google');
    setError('');
    try {
      await loadScript('https://accounts.google.com/gsi/client');
      const google = (window as any).google;
      if (!google?.accounts?.id) throw new Error('Google Identity Services unavailable');

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            const idToken = response?.credential || '';
            const profile = decodeJwtPayload(idToken) as any;
            finish(await loginWithGoogle(idToken, {
              name: profile.name,
              firstName: profile.given_name,
              lastName: profile.family_name,
            }));
          } catch {
            setError(t.unavailable);
          } finally {
            setBusy(null);
          }
        },
      });

      google.accounts.id.prompt((notification: any) => {
        if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
          setBusy(null);
        }
      });
    } catch {
      setError(t.unavailable);
      setBusy(null);
    }
  };

  const handleApple = async () => {
    setBusy('apple');
    setError('');
    try {
      await loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js');
      const apple = (window as any).AppleID;
      if (!apple?.auth) throw new Error('Apple ID unavailable');

      apple.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: 'name email',
        redirectURI: getAppleRedirectUri(),
        usePopup: true,
      });

      const response = await apple.auth.signIn();
      const idToken = response?.authorization?.id_token || '';
      const tokenProfile = decodeJwtPayload(idToken) as any;
      const firstName = response?.user?.name?.firstName || '';
      const lastName = response?.user?.name?.lastName || '';
      const name = [firstName, lastName].filter(Boolean).join(' ') || tokenProfile.name;

      finish(await loginWithApple(idToken, {
        name,
        firstName,
        lastName,
      }));
    } catch {
      setError(t.unavailable);
    } finally {
      setBusy(null);
    }
  };

  const handlePasskey = async () => {
    setBusy('passkey');
    setError('');
    try {
      if (!window.PublicKeyCredential || !navigator.credentials) throw new Error('Passkeys unavailable');

      if (mode === 'register') {
        const profile = getProfile?.() || {};
        const nameParts = splitName(profile.name);
        if (!nameParts.firstName || !nameParts.lastName || !profile.email) {
          setError(t.passkeyProfile);
          return;
        }

        const optionsResponse = await beginPasskeyRegistration({
          firstName: nameParts.firstName,
          lastName: nameParts.lastName,
          email: profile.email.trim(),
          phone: profile.phone,
          address: profile.address,
        });
        if (!optionsResponse) throw new Error('Passkey registration options failed');

        const credential = await navigator.credentials.create({
          publicKey: parseCreationOptions(optionsResponse.publicKeyOptionsJson),
        } as CredentialCreationOptions);
        if (!credential || credential.type !== 'public-key') throw new Error('Passkey creation failed');

        finish(await completePasskeyRegistration(
          optionsResponse.challengeId,
          serializeCredential(credential as PublicKeyCredential)
        ));
        return;
      }

      const profile = getProfile?.() || {};
      const optionsResponse = await beginPasskeyLogin(profile.email?.trim());
      if (!optionsResponse) throw new Error('Passkey login options failed');

      const credential = await navigator.credentials.get({
        publicKey: parseRequestOptions(optionsResponse.publicKeyOptionsJson),
        mediation: 'optional',
      } as CredentialRequestOptions);
      if (!credential || credential.type !== 'public-key') throw new Error('Passkey login failed');

      finish(await completePasskeyLogin(
        optionsResponse.challengeId,
        serializeCredential(credential as PublicKeyCredential)
      ));
    } catch {
      setError(t.unavailable);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3" data-social-auth="true">
      <button type="button" onClick={handleGoogle} disabled={Boolean(busy)} className={buttonClass}>
        <img src={AUTH_ICONS.google} alt="" className={iconClass} aria-hidden="true" />
        {busy === 'google' ? t.working : t.google}
      </button>
      <button type="button" onClick={handleApple} disabled={Boolean(busy)} className={buttonClass}>
        <img src={AUTH_ICONS.apple} alt="" className={iconClass} aria-hidden="true" />
        {busy === 'apple' ? t.working : t.apple}
      </button>
      <button type="button" onClick={handlePasskey} disabled={Boolean(busy)} className={buttonClass}>
        <img src={AUTH_ICONS.passkey} alt="" className={iconClass} aria-hidden="true" />
        {busy === 'passkey' ? t.working : t.passkey}
      </button>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-[10px] font-bold text-red-500">{error}</p>}
    </div>
  );
};

export default SocialAuthButtons;
