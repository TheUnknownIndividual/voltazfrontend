
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

interface DocumentRequirement {
  az: string[];
  en: string[];
  ru: string[];
  tr: string[];
}

interface DocumentSection {
  id: string;
  institution: { az: string; en: string; ru: string; tr: string };
  title: { az: string; en: string; ru: string; tr: string };
  desc: { az: string; en: string; ru: string; tr: string };
  requirements: DocumentRequirement;
  position: number;
}

const AdminDocuments: React.FC = () => {
  const { showNotification, confirm } = useNotification();
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSection, setCurrentSection] = useState<DocumentSection | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('volt_necessary_documents');
    if (saved) {
      setSections(JSON.parse(saved).sort((a: any, b: any) => a.position - b.position));
    }
  }, []);

  const saveToStorage = (data: DocumentSection[]) => {
    localStorage.setItem('volt_necessary_documents', JSON.stringify(data));
    window.dispatchEvent(new Event('volt_data_updated'));
  };

  const handleCreate = () => {
    setCurrentSection({
      id: Date.now().toString(),
      institution: { az: '', en: '', ru: '', tr: '' },
      title: { az: '', en: '', ru: '', tr: '' },
      desc: { az: '', en: '', ru: '', tr: '' },
      requirements: {
        az: ['', '', '', ''],
        en: ['', '', '', ''],
        ru: ['', '', '', ''],
        tr: ['', '', '', '']
      },
      position: sections.length + 1
    });
    setIsEditing(true);
  };

  const handleEdit = (section: DocumentSection) => {
    setCurrentSection(JSON.parse(JSON.stringify(section)));
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (await confirm('Sənəd bölməsini silmək istədiyinizə əminsiniz?', 'Bu əməliyyat geri qaytarılmır.')) {
      const updated = sections.filter(s => s.id !== id);
      setSections(updated);
      saveToStorage(updated);
      showNotification('Sənəd bölməsi silindi', 'success');
    }
  };

  const handleSave = () => {
    if (!currentSection) return;
    
    let updated;
    if (sections.find(s => s.id === currentSection.id)) {
      updated = sections.map(s => s.id === currentSection.id ? currentSection : s);
    } else {
      updated = [...sections, currentSection];
    }
    
    const sorted = updated.sort((a, b) => a.position - b.position);
    setSections(sorted);
    saveToStorage(sorted);
    setIsEditing(false);
    setCurrentSection(null);
    showNotification('Məlumatlar yadda saxlanıldı', 'success');
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Zəruri Sənədlərin İdarəedilməsi</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Sənəd bölmələri və tələbləri 4 dildə idarə edin.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={handleCreate}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            Yeni Bölmə Əlavə Et
          </button>
        )}
      </div>

      {isEditing && currentSection ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Bölmə Redaktəsi</h3>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest">Ləğv et</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {['az', 'en', 'ru', 'tr'].map((l) => (
              <div key={l} className="space-y-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-[11px] uppercase">{l}</div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DİLİ</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qurumun Adı</label>
                    <input 
                      type="text" 
                      value={(currentSection.institution as any)[l]}
                      onChange={(e) => setCurrentSection({ ...currentSection, institution: { ...currentSection.institution, [l]: e.target.value }})}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-emerald-500 font-bold text-sm" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Başlıq</label>
                    <input 
                      type="text" 
                      value={(currentSection.title as any)[l]}
                      onChange={(e) => setCurrentSection({ ...currentSection, title: { ...currentSection.title, [l]: e.target.value }})}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-emerald-500 font-bold text-sm" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alt Mətn</label>
                    <textarea 
                      value={(currentSection.desc as any)[l]}
                      onChange={(e) => setCurrentSection({ ...currentSection, desc: { ...currentSection.desc, [l]: e.target.value }})}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-emerald-500 font-bold text-sm h-24 resize-none" 
                    />
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Tələblər (4 Punkt)</label>
                    {([0, 1, 2, 3]).map((idx) => (
                      <input 
                        key={idx}
                        type="text" 
                        placeholder={`Punkt ${idx + 1}`}
                        value={(currentSection.requirements as any)[l][idx]}
                        onChange={(e) => {
                          const newReqs = { ...currentSection.requirements };
                          (newReqs as any)[l][idx] = e.target.value;
                          setCurrentSection({ ...currentSection, requirements: newReqs });
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-emerald-500 font-bold text-xs" 
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ardıcıllıq:</label>
              <input 
                type="number" 
                value={currentSection.position}
                onChange={(e) => setCurrentSection({ ...currentSection, position: parseInt(e.target.value) || 0 })}
                className="w-20 px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-emerald-500 font-bold text-sm text-center" 
              />
            </div>
            <button 
              onClick={handleSave}
              className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
            >
              Yadda Saxla
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {sections.length === 0 ? (
            <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-100">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Hər hansı sənəd bölməsi əlavə edilməyib</p>
            </div>
          ) : (
            sections.map((section) => (
              <div key={section.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-emerald-500 transition-all duration-300">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 font-black flex items-center justify-center rounded-xl border border-slate-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    {section.position}
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">{section.institution.az}</div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{section.title.az}</h3>
                    <p className="text-slate-500 text-xs line-clamp-1 max-w-[400px]">{section.desc.az}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleEdit(section)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00-2 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(section.id)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDocuments;
