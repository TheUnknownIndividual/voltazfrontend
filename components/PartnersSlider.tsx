
import React from 'react';

// İstifadəçinin göndərdiyi şəkillərə tam uyğun vizualların (Feather, Wreath, B, Globe, Rainbow, Lion) stabil URL-ləri
const partners = [
  { 
    name: "Growatt", 
    logo: "https://i.ibb.co/SXkswsMF/image-removebg-preview.png"
  },
  { 
    name: "LONGi Solar", 
    logo: "https://i.ibb.co/8pDYTN9/image-removebg-preview-1.png"
  },
  { 
    name: "vision.tv", 
    logo: "https://i.ibb.co/gF4W3m5j/image-removebg-preview-3-2.png"
  },
  { 
    name: "Northwest", 
    logo: "https://i.ibb.co/KxScXBwz/NW-Construction.png"
  },
  { 
    name: "Suntree", 
    logo: "https://i.ibb.co/WWjTwptK/image-removebg-preview-4.png"
  },
  { 
    name: "Timesoft", 
    logo: "https://i.ibb.co/7dGzTzjj/timesoft.png"
  },
  { 
    name: "Pashabank", 
    logo: "https://i.ibb.co/svvwfxq4/image-removebg-preview-5.png"
  },
  { 
    name: "Bank Respublika", 
    logo: "https://i.ibb.co/KcmQ346N/image-removebg-preview-6.png"
  }
];

const PartnersSlider: React.FC<{ lang?: 'az' | 'en' }> = ({ lang = 'az' }) => {
  // Seamless loop üçün massivi 3 dəfə təkrar edirik ki, boşluq qalmasın
  const displayPartners = [...partners, ...partners, ...partners];

  const t = {
    badge: lang === 'az' ? 'Rəsmi Tərəfdaşlıq' : 'Official Partnership'
  };

  return (
    <section className="py-12 md:py-16 bg-slate-50 overflow-hidden relative border-y border-slate-200/60">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 mb-6 md:mb-10 text-left">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-100/50 text-emerald-700 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] mb-4 border border-emerald-200/40 shadow-sm transition-all duration-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {t.badge}
        </div>
      </div>
      
      <div className="relative py-2">
        {/* Kənarlarda smooth fade effekti üçün gradient maskalar */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-64 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-24 md:w-64 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none"></div>

        {/* Fasiləsiz hərəkət edən loqo zolağı */}
        <div className="animate-scroll flex items-center hover:pause-scroll gap-4 md:gap-6">
          {displayPartners.map((partner, index) => (
            <div 
              key={`${partner.name}-${index}`} 
              className="flex-shrink-0 group/logo transition-all duration-500"
            >
              {/* Mobil üçün daha kiçik (w-32) kart ölçüsü */}
              <div className="w-32 md:w-48 h-24 md:h-28 bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-3 md:p-4 group-hover/logo:border-emerald-500 group-hover/logo:shadow-xl group-hover/logo:shadow-emerald-500/10 group-hover/logo:-translate-y-1 transition-all duration-500 transform">
                <div className="relative h-8 md:h-10 w-full flex items-center justify-center">
                  <img 
                    src={partner.logo} 
                    alt={partner.name} 
                    className="max-w-full max-h-full object-contain transition-all duration-500 transform group-hover/logo:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://www.svgrepo.com/show/491515/solar-panel.svg";
                    }}
                  />
                </div>
                {/* <span className="mt-2 text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover/logo:text-emerald-600 transition-colors">
                  {partner.name}
                </span> */}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .hover\\:pause-scroll:hover {
          animation-play-state: paused;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 0.5rem)); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default PartnersSlider;
