
import React, { useState, useEffect } from 'react';
import { useBlog } from '../contexts/BlogContext';
import { absoluteSiteUrl, localizePath } from '../utils/seoRoutes';

interface BlogPost {
  id: string;
  image: string;
  date: string;
  updatedAt?: string;

  title: {
    az: string;
    en: string;
    ru: string;
    tr: string;
  };

  description: {
    az: string;
    en: string;
    ru: string;
    tr: string;
  };

  content: {
    az: string;
    en: string;
    ru: string;
    tr: string;
  };
}

interface BlogPageProps {
  lang?: LangCode;
  onBack?: () => void;
  initialId?: string;
  onNavigate?: (page: any, id?: string) => void;
}
const LANGUAGES = [
  { code: 'az', name: 'Azərbaycan' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'tr', name: 'Türkçe' }
] as const;

type LangCode = typeof LANGUAGES[number]['code'];

const BlogPage: React.FC<BlogPageProps> = ({ onBack, lang = 'az', initialId, onNavigate }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
   const { blogs,getBlogs, getBlogById, loading} = useBlog();

   useEffect(() => {
         getBlogs();
       }, [lang]);

   useEffect(() => {
     if (!initialId) {
       setSelectedPost(null);
       return;
     }

     let cancelled = false;
     const loadPost = async () => {
       try {
         const data = await getBlogById(initialId);
         if (!cancelled) setSelectedPost(transformBlog(data));
       } catch (error) {
         console.error(error);
       }
     };

     loadPost();
     return () => {
       cancelled = true;
     };
   }, [initialId]);

   useEffect(() => {
     if (!selectedPost) return;

     const contentLanguage: LangCode = selectedPost.title?.[lang] ? lang : 'az';
     const title = selectedPost.title?.[contentLanguage] || 'Volt.az Blog';
     const rawDescription = String(
       selectedPost.description?.[contentLanguage]
       || selectedPost.content?.[contentLanguage]
       || ''
     ).replace(/\s+/g, ' ').trim();
     const description = (
       rawDescription.toLocaleLowerCase().includes(String(title).toLocaleLowerCase())
         ? rawDescription
         : `${title}. ${rawDescription}`
     ).slice(0, 155);
     const canonicalUrl = absoluteSiteUrl(localizePath(`/blog/${selectedPost.id}`, contentLanguage));
     const robots = contentLanguage === lang
       ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
       : 'noindex, follow';
     const setMeta = (selector: string, attr: 'content' | 'href', value: string, create?: () => HTMLElement) => {
       let element = document.head.querySelector(selector) as HTMLElement | null;
       if (!element && create) {
         element = create();
         document.head.appendChild(element);
       }
       element?.setAttribute(attr, value);
     };

     document.title = `${title} | Volt.az`;
     setMeta('meta[name="description"]', 'content', description);
     setMeta('meta[name="robots"]', 'content', robots);
     setMeta('meta[name="googlebot"]', 'content', robots);
     setMeta('meta[property="og:type"]', 'content', 'article');
     setMeta('meta[property="og:title"]', 'content', `${title} | Volt.az`);
     setMeta('meta[property="og:description"]', 'content', description);
     setMeta('meta[property="og:url"]', 'content', canonicalUrl);
     if (selectedPost.image) {
       setMeta('meta[property="twitter:card"]', 'content', 'summary_large_image');
       setMeta('meta[property="og:image"]', 'content', selectedPost.image, () => {
         const tag = document.createElement('meta');
         tag.setAttribute('property', 'og:image');
         return tag;
       });
     }
     setMeta('meta[property="twitter:title"]', 'content', `${title} | Volt.az`);
     setMeta('meta[property="twitter:description"]', 'content', description);
     if (selectedPost.image) {
       setMeta('meta[property="twitter:image"]', 'content', selectedPost.image, () => {
         const tag = document.createElement('meta');
         tag.setAttribute('property', 'twitter:image');
         return tag;
       });
     }
     setMeta('link[rel="canonical"]', 'href', canonicalUrl);

     const image = selectedPost.image
       ? (/^https?:\/\//i.test(selectedPost.image) ? selectedPost.image : `https://volt.az${selectedPost.image.startsWith('/') ? '' : '/'}${selectedPost.image}`)
       : undefined;
     const articleJsonLd = {
       '@context': 'https://schema.org',
       '@graph': [
         {
           '@type': 'BlogPosting',
           '@id': `${canonicalUrl}#article`,
           headline: title,
           description,
           mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
           datePublished: selectedPost.date,
           dateModified: selectedPost.updatedAt || selectedPost.date,
           ...(image ? { image: [image] } : {}),
           author: { '@type': 'Organization', name: 'SOLARIX MMC' },
           publisher: { '@id': 'https://volt.az/#organization' },
           inLanguage: lang,
         },
         {
           '@type': 'BreadcrumbList',
           '@id': `${canonicalUrl}#breadcrumb`,
           itemListElement: [
             { '@type': 'ListItem', position: 1, name: 'Ana səhifə', item: 'https://volt.az/' },
             { '@type': 'ListItem', position: 2, name: 'Bloq', item: 'https://volt.az/blog' },
             { '@type': 'ListItem', position: 3, name: title, item: canonicalUrl },
           ],
         },
       ],
     };
     let script = document.getElementById('volt-blog-jsonld') as HTMLScriptElement | null;
     if (!script) {
       script = document.createElement('script');
       script.type = 'application/ld+json';
       script.id = 'volt-blog-jsonld';
       document.head.appendChild(script);
     }
     script.textContent = JSON.stringify(articleJsonLd);

     return () => document.getElementById('volt-blog-jsonld')?.remove();
   }, [selectedPost, lang]);

 const t = {
  title: {
    az: "Bloq",
    en: "Blog",
    ru: "Блог",
    tr: "Blog",
  },

  back: {
    az: "Geri qayıt",
    en: "Back",
    ru: "Назад",
    tr: "Geri dön",
  },

  readMore: {
    az: "Davamını oxu",
    en: "Read More",
    ru: "Читать далее",
    tr: "Devamını Oku",
  },

  subtitle: {
    az: "Günəş enerjisi dünyasından maraqlı məqalələr və məsləhətlər",
    en: "Interesting articles and tips from the world of solar energy",
    ru: "Интересные статьи и советы из мира солнечной энергетики",
    tr: "Güneş enerjisi dünyasından ilgi çekici makaleler ve ipuçları",
  },
  quote: {
    az: "Bilik paylaşıldıqca artır.",
    en: "Knowledge grows when shared.",
    ru: "Знания растут, когда ими делятся.",
    tr: "Bilgi paylaşıldıkça artar.",
  },

  description: {
    az: "Günəş enerjisi haqqında daha çox öyrənmək və ən son texnologiyalardan xəbərdar olmaq üçün bloqumuzu izləməyə davam edin.",
    en: "Continue following our blog to learn more about solar energy and stay updated on the latest technologies.",
    ru: "Продолжайте следить за нашим блогом, чтобы узнать больше о солнечной энергии и быть в курсе новейших технологий.",
    tr: "Güneş enerjisi hakkında daha fazla bilgi edinmek ve en son teknolojilerden haberdar olmak için blogumuzu takip etmeye devam edin.",
  },

  backToBlog: {
    az: "Bloqa qayıt",
    en: "Back to blog",
    ru: "Назад к блогу",
    tr: "Bloga dön",
  },
};

  const handleBackClick = () => {
    if (selectedPost) {
      setSelectedPost(null);
      onNavigate?.('blog');
    } else if (onBack) {
      onBack();
    }
  };

const handleReadMore = async (id: string) => {
  onNavigate?.('blog', id);
  const data = await getBlogById(id);

  const transformed = transformBlog(data);

  setSelectedPost(transformed);
};

 const mapLang = (code: number) => {
  switch (code) {
    case 1: return "az";
    case 2: return "en";
    case 3: return "ru";
    case 4: return "tr";
    default: return "en";
  }
};

const transformBlog = (item: any) => {
  const titles = { az: "", en: "", ru: "", tr: "" };
  const descriptions = { az: "", en: "", ru: "", tr: "" };
  const contents = { az: "", en: "", ru: "", tr: "" };

  (item.translations || []).forEach((t: any) => {
    const lang = mapLang(t.languageCode);

    titles[lang] = t.title || "";
    descriptions[lang] = t.description || "";
    contents[lang] = t.content || "";
  });

  return {
    id: item.id,
    image: item.coverImagePath,
    isActive: item.isActive,
    date: item.createdAt,
    updatedAt: item.updatedAt || undefined,

    title: titles,
    description: descriptions,
    content: contents,
  };
};

  return (
    <div className="bg-white min-h-screen relative">
      {/* Page Header */}
      <section className="bg-emerald-950 py-4 border-b border-emerald-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between relative z-10">
          <button onClick={handleBackClick} className="flex items-center gap-1.5 text-emerald-300/60 hover:text-white transition-colors font-bold text-[9px] uppercase tracking-widest">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.back[lang]}
          </button>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">
            {selectedPost ? selectedPost.title?.[selectedPost.title?.[lang] ? lang : 'az'] : t.title[lang]}
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24 bg-slate-50 min-h-[calc(100vh-120px)]">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          {!selectedPost ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {blogs.map((post) => (
                <div 
                  key={post.id} 
                  // onClick={() => setSelectedPost(post)}
                  onClick={() => handleReadMore(post.id)}
                  className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col cursor-pointer"
                >
                  {/* Image Wrap */}
                  {/* <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={post.image} alt={post.title?.[lang]} className="w-full h-full transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-4 left-4">
                      <div className="bg-emerald-600 px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-lg">
                        {post.description?.[lang]}
                      </div>
                    </div>
                  </div> */}
                  <div className="relative overflow-hidden">
  <img
    src={post.image}
    alt={post.title?.[lang]}
    className="w-full h-full object-cover"
  />

  <div className="absolute top-4 left-4">
    <div className="bg-emerald-600 px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-lg">
      {post.description?.[lang]}
    </div>
  </div>
</div>

                  {/* Content */}
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(post.date).toLocaleDateString("az-AZ")}
                    </div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-4 group-hover:text-emerald-600 transition-colors">
                      <h3>{post.title?.[lang]}</h3>
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed mb-8 flex-grow opacity-80 line-clamp-3">
                      {post.content?.[lang]}
                    </p>
                    
                    <div className="pt-6 border-t border-slate-50">
                      <button 
                        className="theme-more-link group/link"
                      >
                        {t.readMore[lang]}
                        <svg className="w-3.5 h-3.5 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-2xl">
                {/* <div className="aspect-video w-full overflow-hidden">
                  <img src={selectedPost.image} alt={selectedPost.title?.[selectedPost.title?.[lang] ? lang : 'az']} className="w-full h-full object-contain" />
                </div> */}
                <div className="relative aspect-video w-full overflow-hidden">
  {/* Background */}
  <img
    src={selectedPost.image}
    alt=""
    className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
  />

  {/* Main image */}
  <img
    src={selectedPost.image}
    alt={selectedPost.title?.[selectedPost.title?.[lang] ? lang : 'az']}
    className="relative z-10 w-full h-full object-contain"
  />
</div>
                <div className="p-8 md:p-16 space-y-8">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="bg-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                      {selectedPost.description?.[selectedPost.title?.[lang] ? lang : 'az']}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       {new Date(selectedPost.date).toLocaleDateString("az-AZ")}
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                    {selectedPost.title?.[selectedPost.title?.[lang] ? lang : 'az']}
                  </h2>
                  <div className="w-20 h-1.5 bg-emerald-500 rounded-full"></div>
                  <div className="prose prose-slate max-w-none">
                    {selectedPost.content?.[selectedPost.title?.[lang] ? lang : 'az']?.split('\n').map((paragraph, pIdx) => (
                      <p key={pIdx} className="text-slate-600 text-base md:text-lg leading-relaxed mb-6 whitespace-pre-line">
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>
                  <div className="pt-12 border-t border-slate-50">
                    <button 
                      onClick={() => setSelectedPost(null)}
                      className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/20"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                      {t.backToBlog[lang]}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 py-20 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <h3 className="text-2xl md:text-4xl font-black italic">"{t.quote[lang]}"</h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          {t.description[lang]}
          </p>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
