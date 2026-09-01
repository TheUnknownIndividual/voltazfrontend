
import React from 'react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";
import { localizePath } from '../utils/seoRoutes';

interface FooterProps {
  onNavigate?: (page: any, id?: string, extra?: any) => void;
  lang?: 'az' | 'en' | 'ru' | 'tr';
  logoSrc?: string;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, lang, logoSrc = '/volt-logo-test.png'}) => {
  const handleNav = (e: React.MouseEvent, page: any, extra?: any) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page, undefined, extra);
    }
  };

  const serviceNav = (service: string) => ({
    service,
    focus: Date.now()
  });

  const socials = [
  {
    name: "facebook",
    icon: FaFacebookF,
    url: "https://www.facebook.com/solarix.az/",
  },
  {
    name: "instagram",
    icon: FaInstagram,
    url: "https://www.instagram.com/solarix_az/",
  },
  {
    name: "linkedin",
    icon: FaLinkedinIn,
    url: "https://www.linkedin.com/company/voltaz",
  },
  {
    name: "tiktok",
    icon: FaTiktok,
    url: "https://www.tiktok.com/@voltpanel",
  },
  {
    name: "youtube",
    icon: FaYoutube,
    url: "https://www.youtube.com/@voltpanel",
  },
];

const t = {
  desc:
    lang === "az"
      ? `VOLT.AZ SOLARIX MMC-nin satış brendi olaraq, Azərbaycanda bərpa olunan enerji sahəsində qabaqcıl həllər təklif edən satışı və quraşdırma platformasıdır.`
      : lang === "ru"
      ? `VOLT.AZ, являясь торговым брендом SOLARIX MMC, представляет собой платформу по продаже и установке, предлагающую передовые решения в сфере возобновляемой энергетики в Азербайджане.`
      : lang === "tr"
      ? `VOLT.AZ, SOLARIX MMC’nin satış markası olarak, Azerbaycan’da yenilenebilir enerji alanında ileri çözümler sunan bir satış ve kurulum platformudur.`
      : `VOLT.AZ, as the sales brand of SOLARIX LLC, is a sales and installation platform offering advanced solutions in the field of renewable energy in Azerbaijan.`,
      quickLinks:
    lang === "az"
      ? "Sürətli Keçidlər"
      : lang === "ru"
      ? "Быстрые ссылки"
      : lang === "tr"
      ? "Hızlı Bağlantılar"
      : "Quick Links",

  home:
    lang === "az"
      ? "Ana Səhifə"
      : lang === "ru"
      ? "Главная"
      : lang === "tr"
      ? "Ana Sayfa"
      : "Home",

  about:
    lang === "az"
      ? "Haqqımızda"
      : lang === "ru"
      ? "О нас"
      : lang === "tr"
      ? "Hakkımızda"
      : "About",

  services:
    lang === "az"
      ? "Xidmətlər"
      : lang === "ru"
      ? "Услуги"
      : lang === "tr"
      ? "Hizmetler"
      : "Services",

  projects:
    lang === "az"
      ? "Layihələr"
      : lang === "ru"
      ? "Проекты"
      : lang === "tr"
      ? "Projeler"
      : "Projects",

  products:
    lang === "az"
      ? "Məhsullar"
      : lang === "ru"
      ? "Продукты"
      : lang === "tr"
      ? "Ürünler"
      : "Products",

  ourServices:
    lang === "az"
      ? "Xidmətlərimiz"
      : lang === "ru"
      ? "Наши услуги"
      : lang === "tr"
      ? "Hizmetlerimiz"
      : "Our Services",

  calculator:
    lang === "az"
      ? "Kalkulyator"
      : lang === "ru"
      ? "Калькулятор"
      : lang === "tr"
      ? "Hesaplayıcı"
      : "Calculator",

  contact:
    lang === "az"
      ? "Əlaqə"
      : lang === "ru"
      ? "Контакты"
      : lang === "tr"
      ? "İletişim"
      : "Contact",

  partnership:
    lang === "az"
      ? "Tərəfdaşlıq"
      : lang === "ru"
      ? "Партнерство"
      : lang === "tr"
      ? "İş Ortaklığı"
      : "Partnership",

  proClub:
    lang === "az"
      ? "Ustalar Klubu"
      : lang === "ru"
      ? "Клуб мастеров"
      : lang === "tr"
      ? "Ustalar Kulübü"
      : "Pro Club",

  address:
    lang === "az"
      ? "Bakı, Kövkəb Səfərəliyeva 16e, Time Business Centere 6-cı mərtəbə"
      : lang === "ru"
      ? "Баку, ул. Кевкаб Сафаралиевой 16e, Time Business Center 6-й этаж"
      : lang === "tr"
      ? "Bakü, Kövkəb Səfərəliyeva 16e, Time Business Center 6. kat"
      : "Baku, Kovkab Safaraliyeva 16e, Time Business Center 6th floor",

  rights:
    lang === "az"
      ? "Bütün hüquqlar qorunur."
      : lang === "ru"
      ? "Все права защищены."
      : lang === "tr"
      ? "Tüm hakları saklıdır."
      : "All rights reserved.",

  privacy:
    lang === "az"
      ? "Məxfilik Siyasəti"
      : lang === "ru"
      ? "Политика конфиденциальности"
      : lang === "tr"
      ? "Gizlilik Politikası"
      : "Privacy Policy",

  terms:
    lang === "az"
      ? "İstifadə Şərtləri"
      : lang === "ru"
      ? "Условия использования"
      : lang === "tr"
      ? "Kullanım Şartları"
      : "Terms of Use",

  dataDeletion:
    lang === "az"
      ? "Məlumatların Silinməsi"
      : lang === "ru"
      ? "Удаление данных"
      : lang === "tr"
      ? "Veri Silme"
      : "Data Deletion",

    smartMeterMonitoring:
  lang === "az"
    ? "Smart Sayğac və Monitorinq"
    : lang === "ru"
    ? "Смарт-счётчик и мониторинг"
    : lang === "tr"
    ? "Akıllı Sayaç ve İzleme"
    : "Smart Meter & Monitoring",

financeCredit:
  lang === "az"
    ? "Maliyyə və Kredit"
    : lang === "ru"
    ? "Финансы и кредит"
    : lang === "tr"
    ? "Finans ve Kredi"
    : "Finance & Credit",

legalFormalization:
  lang === "az"
    ? "Hüquqi Rəsmiləşdirmə"
    : lang === "ru"
    ? "Юридическое оформление"
    : lang === "tr"
    ? "Hukuki Resmileştirme"
    : "Legal Formalization",

energyAudit:
  lang === "az"
    ? "Enerji Auditi"
    : lang === "ru"
    ? "Энергоаудит"
    : lang === "tr"
    ? "Enerji Denetimi"
    : "Energy Audit",

installation:
  lang === "az"
    ? "Quraşdırma"
    : lang === "ru"
    ? "Установка"
    : lang === "tr"
    ? "Kurulum"
    : "Installation",

designROI:
  lang === "az"
    ? "Layihələndirmə və ROI"
    : lang === "ru"
    ? "Проектирование и ROI"
    : lang === "tr"
    ? "Tasarım ve ROI"
    : "Design & ROI",
};

  return (
    <footer data-nosnippet className="site-footer-theme bg-gray-50 pt-16 pb-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <div onClick={(e) => handleNav(e, 'home')} className="mb-6 inline-block lg:-mt-5">
              <img src={logoSrc} alt="Volt.az" className="h-[87px] w-[105px] object-contain object-left" />
            </div>
            <p className="text-slate-500 leading-relaxed mb-8 text-sm">
              {t.desc}
            </p>
           <div className="flex gap-3">
  {socials.map((social) => {
    const Icon = social.icon;

    return (
      <a
        key={social.name}
        href={social.url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all text-slate-500"
      >
        <Icon className="text-lg" />
      </a>
    );
  })}
</div>
          </div>

          <div>
            <h5 className="font-black text-slate-900 mb-8 uppercase text-xs tracking-widest">{t.quickLinks}</h5>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#" onClick={(e) => handleNav(e, 'home')} className="text-slate-500 hover:text-emerald-600 transition-colors">{t.home}</a></li>
              <li><a href="#" onClick={(e) => handleNav(e, 'about')} className="text-slate-500 hover:text-emerald-600 transition-colors">{t.about}</a></li>
              <li><a href="#" onClick={(e) => handleNav(e, 'services')} className="text-slate-500 hover:text-emerald-600 transition-colors">{t.services}</a></li>
              <li><a href={localizePath('/solar-installation', lang || 'az')} onClick={(e) => handleNav(e, 'solar-installation')} className="text-slate-500 hover:text-emerald-600 transition-colors">{t.installation}</a></li>
              {/* <li><a href="#" onClick={(e) => handleNav(e, 'projects')} className="text-slate-500 hover:text-emerald-600 transition-colors">{t.projects}</a></li> */}
              <li><a href="#" onClick={(e) => handleNav(e, 'products')} className="text-slate-500 hover:text-emerald-600 transition-colors">{t.products}</a></li>
              {/* <li><a href="#" onClick={(e) => handleNav(e, 'partnership')} className="text-slate-500 hover:text-emerald-600 transition-colors">{t.partnership}</a></li> */}
              {/* <li><a href="#" onClick={(e) => handleNav(e, 'pro-club')} className="text-slate-500 hover:text-emerald-600 transition-colors">{t.proClub}</a></li> */}
          
            </ul>
          </div>

          <div>
            <h5 className="font-black text-slate-900 mb-8 uppercase text-xs tracking-widest">{t.ourServices}</h5>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#" onClick={(e) => handleNav(e, 'services', serviceNav('smart-meter-monitoring'))} className="text-slate-500 hover:text-emerald-600 transition-colors">{t.smartMeterMonitoring}</a></li>
              <li><a href="#" onClick={(e) => handleNav(e, 'services', serviceNav('finance-credit'))} className="text-slate-500 hover:text-emerald-600 transition-colors">{t.financeCredit}</a></li>
              <li><a href="#" onClick={(e) => handleNav(e, 'services', serviceNav('legal-formalization'))} className="text-slate-500 hover:text-emerald-600 transition-colors">{t.legalFormalization}</a></li>
              <li><a href="#" onClick={(e) => handleNav(e, 'services', serviceNav('energy-audit'))} className="text-slate-500 hover:text-emerald-600 transition-colors">{t.energyAudit}</a></li>
              <li><a href="#" onClick={(e) => handleNav(e, 'services', serviceNav('installation'))} className="text-slate-500 hover:text-emerald-600 transition-colors">{t.installation}</a></li>
              <li><a href="#" onClick={(e) => handleNav(e, 'services', serviceNav('design-roi'))} className="text-slate-500 hover:text-emerald-600 transition-colors">{t.designROI}</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-black text-slate-900 mb-8 uppercase text-xs tracking-widest">{t.contact}</h5>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-4 cursor-pointer" onClick={(e) => handleNav(e, 'contact')}>
                <svg className="w-5 h-5 text-emerald-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span className="text-slate-500">{t.address}</span>
              </li>
              <li className="flex items-center gap-4">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <span className="text-slate-500">+994 50 418 00 01</span>
              </li>
              <li className="flex items-center gap-4">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span className="text-slate-500">info@volt.az</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-bold">
            © {new Date().getFullYear()} Volt.az - SOLARIX MMC. {t.rights}
          </p>
          <div className="grid w-full max-w-3xl grid-cols-3 text-center text-xs font-semibold uppercase tracking-[0.04em] text-slate-400">
            <a href="#" onClick={(e) => handleNav(e, 'privacy-policy')} className="px-2 leading-tight hover:text-emerald-600 transition-colors">{t.privacy}</a>
            <a href="#" onClick={(e) => handleNav(e, 'data-deletion')} className="px-2 leading-tight hover:text-emerald-600 transition-colors">{t.dataDeletion}</a>
            <a href="#" onClick={(e) => handleNav(e, 'terms-of-service')} className="px-2 leading-tight hover:text-emerald-600 transition-colors">{t.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
