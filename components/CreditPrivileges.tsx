
import React from 'react';

const CreditPrivileges: React.FC<{ lang: string; onBack: () => void }> = ({ lang, onBack }) => {
  const t = {
  back: {
    az: "Geri qayıt",
    en: "Back",
    ru: "Назад",
    tr: "Geri dön",
  },

  title: {
    az: "Kredit İmtiyazları",
    en: "Credit Benefits",
    ru: "Кредитные льготы",
    tr: "Kredi Avantajları",
  },
};
  return (
    <div className="bg-white min-h-screen relative">
      <section className="bg-[var(--color-dark)] py-4 border-b border-white/5 sticky z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 text-emerald-100/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              {t.back[lang]}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{t.title[lang]}</h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        <div className="mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Kredit İmtiyazları</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Maliyyə yükünüzü azaldın. SOLARIX MMC-nin bank tərəfdaşları ilə olan əməkdaşlığı sayəsində indi günəş panellərini daha asan və sərfəli şərtlərlə əldə edə bilərsiniz.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { title: "Taksit Kartları", desc: "Birkart, Tamkart və Bolkart ilə 12 ayadək 0% faizlə ödəniş.", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", bgColor: "bg-[var(--color-primary)]" },
            { title: "Güzəştli Dövr", desc: "İlkin ödənişsiz ve ilk 3 ay ödəniş tələb olunmayan kredit planları.", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", bgColor: "bg-[var(--color-accent)]" },
            { title: "Yaşıl Kredit", desc: "Bərpa olunan enerji üçün özəl olaraq illik 12%-dən başlayan şərtlər.", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0116 0z", bgColor: "bg-[var(--color-primary)]" }
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 hover:shadow-2xl transition-all group">
              <div className={`w-14 h-14 ${item.bgColor} text-[var(--color-dark)] rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-black/5`}>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/></svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[var(--color-dark)] rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-white/5">Hər kəs üçün əlçatan enerji</div>
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">İndi quraşdırın, <span className="text-emerald-400">qənaətlə ödəyin.</span></h2>
              <p className="text-emerald-100/60 text-sm leading-loose mb-10 max-w-lg">
                Hesablamalarımıza görə, sistemin yaratdığı qənaət aylıq kredit ödənişinin bir hissəsini birbaşa kompensasiya edir. Bu o deməkdir ki, enerji stansiyası özü özünü ödəyir.
              </p>
              <button className="bg-[var(--color-primary)] text-[var(--color-dark)] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-95 transition-all shadow-xl active:scale-95">Məsləhət alın</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "ABB Bank", img: "https://abb-bank.az/img/logo.png" },
                { label: "Kapital Bank", img: "https://kapitalbank.az/assets/images/logo.png" },
                { label: "Unibank", img: "https://unibank.az/img/logo.png" },
                { label: "Paşa Bank", img: "https://www.pashabank.az/img/logo.png" }
              ].map((bank, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-all">
                  <div className="w-12 h-12 bg-white/20 rounded-full mb-3 flex items-center justify-center font-black text-[10px] text-white">{bank.label[0]}</div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">{bank.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditPrivileges;
