
import React, { useState } from 'react';

interface Reel {
  id: string;
  thumbnail: string;
  title: string;
  desc: string;
  views: string;
}

const reelsData: Reel[] = [
  { id: '1', thumbnail: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800', title: 'Modern Quraşdırma', desc: 'Bakı, fərdi yaşayış evi 15kW', views: '12K' },
  { id: '2', thumbnail: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=800', title: 'Sənaye Layihəsi', desc: 'Sumqayıt 1.2MW stansiyası', views: '25K' },
  { id: '3', thumbnail: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=800', title: 'Huawei Invertorlar', desc: 'M1 seriyası ilə batareya inteqrasiyası', views: '8K' },
  { id: '4', thumbnail: 'https://images.unsplash.com/photo-1594818379496-da1e345b0ded?w=800', title: 'Müştəri Rəyi', desc: 'Nə üçün Volt.az?', views: '19K' },
  { id: '5', thumbnail: 'https://images.unsplash.com/photo-1466611653911-954ffaa13b6f?w=800', title: 'Yaşıl Gələcək', desc: 'Təbiəti birlikdə qoruyaq', views: '4K' },
  { id: '6', thumbnail: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800', title: 'Qarabağ Layihələri', desc: 'Ağdam günəş enerjisi', views: '32K' }
];

const VideoReels: React.FC<{ lang: string; onBack: () => void }> = ({ lang, onBack }) => {
  const [activeReel, setActiveReel] = useState<Reel | null>(null);

const t = {
  title: {
    az: "Video Reels",
    en: "Video Reels",
    ru: "Видео-ролики",
    tr: "Video Reels",
  },

  back: {
    az: "Geri qayıt",
    en: "Back",
    ru: "Назад",
    tr: "Geri dön",
  },
};

  return (
    <div className="bg-slate-900 min-h-screen relative">
      <section className="bg-emerald-950 py-4 border-b border-emerald-900/50 sticky z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back[lang]}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">{t.title[lang]}</h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-black text-white mb-2">Video Reels</h2>
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Canlı proseslər və nəticələr</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {reelsData.map(reel => (
            <div 
              key={reel.id} 
              onClick={() => setActiveReel(reel)}
              className="relative aspect-[9/16] rounded-3xl overflow-hidden cursor-pointer group shadow-2xl"
            >
              <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-black text-xs mb-1 line-clamp-1">{reel.title}</h3>
                <p className="text-white/60 text-[8px] font-medium line-clamp-2">{reel.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-[8px] text-emerald-400 font-black">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                  {reel.views}
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeReel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setActiveReel(null)}></div>
          <div className="relative w-full max-w-[400px] aspect-[9/16] bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10">
             <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                <svg className="w-20 h-20 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <p className="text-[10px] font-black uppercase tracking-widest mt-4">Video yüklənir...</p>
             </div>
             <div className="absolute top-8 right-8 z-30">
               <button onClick={() => setActiveReel(null)} className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
               </button>
             </div>
             <div className="absolute bottom-12 left-8 right-8 z-30">
                <h4 className="text-xl font-black text-white mb-2">{activeReel.title}</h4>
                <p className="text-white/70 text-sm leading-relaxed">{activeReel.desc}</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoReels;
