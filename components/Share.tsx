import React, { useEffect, useRef, useState } from "react";
import {
  FaWhatsapp,
  FaFacebookF,
  FaXTwitter,
  FaLinkedinIn,
} from "react-icons/fa6";
import { FaShare, FaRegCopy } from "react-icons/fa";
import { Share2 } from "lucide-react";

type ShareProps = {
  title?: string;
  lang?: 'az' | 'en' | 'ru' | 'tr';
  variant?: 'default' | 'image-mobile';
};

const Share: React.FC<ShareProps> = ({ lang, variant = 'default' }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const copiedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const closeOnScroll = () => setOpen(false);

    document.addEventListener('click', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('scroll', closeOnScroll, { passive: true });
    return () => {
      document.removeEventListener('click', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('scroll', closeOnScroll);
    };
  }, [open]);

  useEffect(() => () => {
    if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
  }, []);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(url);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const openShare = (platform: "whatsapp" | "facebook" | "twitter" | "linkedin") => {
    const links = {
      whatsapp: `https://wa.me/?text=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    window.open(links[platform], "_blank");
  };

 const t = {
  shareProduct: (lang) =>
    lang === 'az' ? 'Bu məhsulu paylaş' :
    lang === 'ru' ? 'Поделиться этим товаром' :
    lang === 'tr' ? 'Bu ürünü paylaş' :
    'Share this product',

  copyLink: (lang) =>
    lang === 'az' ? 'Linki kopyala' :
    lang === 'ru' ? 'Скопировать ссылку' :
    lang === 'tr' ? 'Bağlantıyı kopyala' :
    'Copy Link',

  copied: (lang) =>
    lang === 'az' ? 'Kopyalandı!' :
    lang === 'ru' ? 'Скопировано!' :
    lang === 'tr' ? 'Kopyalandı!' :
    'Copied!',
};

  return (
    <div
      ref={shareRef}
      className="relative inline-block"
      onMouseEnter={() => variant === 'default' && setOpen(true)}
      onMouseLeave={() => variant === 'default' && setOpen(false)}
    >
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        aria-label={t.shareProduct(lang)}
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          variant === 'image-mobile' ? setOpen(true) : setOpen(current => !current);
        }}
        className={variant === 'image-mobile'
          ? `w-11 h-11 flex items-center justify-center bg-transparent transition-colors ${open ? 'text-[var(--color-primary)]' : 'text-slate-700'}`
          : 'p-2 rounded-full bg-slate-900 text-white hover:bg-slate-700 transition'}
      >
       {variant === 'image-mobile' ? (
         <Share2 className="w-[25.5px] h-[25.5px]" strokeWidth={2.2} aria-hidden="true" />
       ) : <FaShare />}
      </button>

      {/* POPOVER */}
      {open && (
        <div className={`absolute top-full mt-2 right-0 w-56 bg-white shadow-xl rounded-xl p-3 z-50 ${variant === 'image-mobile' ? 'border border-slate-100' : ''}`}>
          <h2 className="text-sm font-semibold mb-2">{t.shareProduct(lang)}</h2>

          <button
  onClick={copyLink}
  className={`w-full mb-2 p-2 rounded text-sm flex items-center justify-center gap-2 transition-colors ${copied ? 'bg-[var(--color-dark)] text-white' : 'bg-gray-100 hover:bg-gray-200 text-[var(--color-text)]'}`}
>
  <FaRegCopy />
  <span>{copied ? t.copied(lang) : t.copyLink(lang)}</span>
</button>

          <div className="flex justify-between">
            <button onClick={() => openShare("whatsapp")} className="w-11 h-11 flex items-center justify-center rounded-full bg-green-500 text-white hover:scale-110 transition">
              <FaWhatsapp />
            </button>

            <button onClick={() => openShare("facebook")} className="w-11 h-11 flex items-center justify-center rounded-full bg-blue-600 text-white hover:scale-110 transition">
              <FaFacebookF />
            </button>

            <button onClick={() => openShare("twitter")} className="w-11 h-11 flex items-center justify-center rounded-full bg-black text-white hover:scale-110 transition">
              <FaXTwitter />
            </button>

            <button onClick={() => openShare("linkedin")} className="w-11 h-11 flex items-center justify-center rounded-full bg-blue-700 text-white hover:scale-110 transition">
              <FaLinkedinIn />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Share;
