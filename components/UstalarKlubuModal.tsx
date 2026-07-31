
import React, { useState } from 'react';
import PhoneNumberInput, { DEFAULT_COUNTRY_ISO2 } from './PhoneNumberInput';

interface UstalarKlubuModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'az' | 'en';
}

const UstalarKlubuModal: React.FC<UstalarKlubuModalProps> = ({ isOpen, onClose, lang  }) => {
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_COUNTRY_ISO2);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-20"
        >
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Info Side - Lightened to Emerald 600 */}
          <div className="bg-emerald-600 p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-[10px] font-black uppercase tracking-widest mb-6 backdrop-blur-sm">
                Peşəkarların Birliyi
              </div>
              <h2 className="text-3xl font-black mb-6 leading-tight">Ustalar Klubu</h2>
              <div className="space-y-6 text-emerald-50 text-sm leading-relaxed opacity-90">
                <p>
                  <strong>Üzv ol</strong> – Region üzrə bütün peşəkar və maraqlı olan ustaların layihəyə cəlb edilməsi, onlara mühəndislik təlimlərinin keçirilməsi, müxtəlif tipli aksiya və “promo”ların təşkili, mexanizmin daim işlək vəziyyətdə olmasını təmin edir.
                </p>
                <p>
                  Klub, şirkət üçün paraleldə gedən müxtəlif ərazilərdə və ya irihəcmli layihələrdə əlavə dəstəyin daha sürətli cəlb edilməsi, həmçinin müxtəlif regionlarda eyni anda yarana biləcək problemlərin qarşısının sürətli alınması üçün nəzərdə tutulur.
                </p>
              </div>

              <ul className="mt-10 space-y-4">
                {[
                  { title: "Tədris və sertifikat", desc: "Üst geyim formaları, təbliğat, loyallıq" },
                  { title: "Bonus sistemi", desc: "Bizdən alınan məhsullar üzrə" },
                  { title: "Texniki dəstək", desc: "Mühəndislik yardımı" }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-white border border-white/30">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{item.title}</h4>
                      <p className="text-xs text-emerald-100/60">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form Side */}
          <div className="p-8 md:p-12 bg-white">
            <h3 className="text-xl font-black text-slate-900 mb-8">Qeydiyyat Formu</h3>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ad Soyad</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="Ad və Soyadınız" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Əlaqə nömrəsi</label>
                  <PhoneNumberInput
                    countryIso2={phoneCountry}
                    onCountryChange={setPhoneCountry}
                    localNumber={phone}
                    onLocalNumberChange={setPhone}
                    placeholder="XX XXX XX XX"
                    inputClassName="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Yaşayış ünvanı</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" placeholder="Şəhər və ya Rayon" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ustalığı təsdiq edən sənədin surəti</label>
                <div className="relative group/file">
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="w-full border-2 border-dashed border-slate-200 rounded-xl px-4 py-6 text-center group-hover/file:border-emerald-500 transition-colors bg-slate-50">
                    <svg className="w-6 h-6 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    <span className="text-xs text-slate-500">Sənədi bura yükləyin</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Şifrə</label>
                <input type="password" title="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              </div>
              
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/10 mt-4">
                Klubun Üzvü Ol
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UstalarKlubuModal;
