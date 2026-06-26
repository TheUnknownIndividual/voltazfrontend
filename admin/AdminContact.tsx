
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useContact } from "../contexts/ContactContext";

interface AdminContactProps {
    onBack: () => void;
}
const languageMap = {
    az: 1,
    en: 2,
    ru: 3,
    tr: 4,
} as const;
const languageReverseMap = {
    1: "az",
    2: "en",
    3: "ru",
    4: "tr",
} as const;

const LANGUAGES = [
    { code: 'az', name: 'Azərbaycan' },
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'tr', name: 'Türkçe' }
] as const;

type LangCode = typeof LANGUAGES[number]['code'];

const AdminContact: React.FC<AdminContactProps> = ({ onBack}) => {
    const { showNotification, confirm } = useNotification();

    const [activeLang, setActiveLang] = useState<LangCode>('az');
    const { contactData, getContactInfo, updateContact, loading } = useContact();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({
        languages: {
            az: { address: "", workingHoursDescription: "" },
            en: { address: "", workingHoursDescription: "" },
            ru: { address: "", workingHoursDescription: "" },
            tr: { address: "", workingHoursDescription: "" },
        },
        phone: "",
        email: "",
    });
    useEffect(() => {
        getContactInfo();
    }, []);

    useEffect(() => {
        if (contactData) {
            const formatted: any = {
                languages: {
                    az: { address: "", workingHoursDescription: "" },
                    en: { address: "", workingHoursDescription: "" },
                    ru: { address: "", workingHoursDescription: "" },
                    tr: { address: "", workingHoursDescription: "" },
                },
                phone: "",
                email: "",
            };

            contactData.languages?.forEach((langItem: any) => {
                const langCode = languageReverseMap[langItem.languageCode as 1 | 2 | 3 | 4];
                if (langCode) {
                    formatted.languages[langCode] = {
                        address: langItem.address,
                        workingHoursDescription: langItem.workingHoursDescription,
                    };
                }
            });

            formatted.phone = contactData.phoneNumbers?.[0]?.number || "";
            formatted.email = contactData.emailAddresses?.[0]?.email || "";

            setFormData(formatted);
            setEditingId(contactData.id); // vacibdir update üçün
        }
    }, [contactData]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

  const payload = {
  languages: [
    {
      languageCode: 1,
      address: formData.languages.az.address,
      workingHoursDescription: formData.languages.az.workingHoursDescription,
    },
    {
      languageCode: 2,
      address: formData.languages.en.address,
      workingHoursDescription: formData.languages.en.workingHoursDescription,
    },
    {
      languageCode: 3,
      address: formData.languages.ru.address,
      workingHoursDescription: formData.languages.ru.workingHoursDescription,
    },
    {
      languageCode: 4,
      address: formData.languages.tr.address,
      workingHoursDescription: formData.languages.tr.workingHoursDescription,
    },
  ],
  phoneNumbers: [{ number: formData.phone }],
  emailAddresses: [{ email: formData.email }],
};

        try {
            if (editingId) {
                await updateContact(editingId, payload);
                showNotification("Uğurla yeniləndi", "success");
            }
        } catch (error) {
            showNotification("Xəta baş verdi", "error");
        }
    };

    const resetForm = () => {
        setFormData({
            languages: {
                az: { address: "", workingHoursDescription: "" },
                en: { address: "", workingHoursDescription: "" },
                ru: { address: "", workingHoursDescription: "" },
                tr: { address: "", workingHoursDescription: "" },
            },
            phone: "",
            email: "",
        });
    };


    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Əlaqənin İdarəedilməsi</h2>
                    <p className="text-slate-500 text-xs mt-1">Əlaqələrin 4 dildə idarə edilməsi</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
                    >
                        Geri Qayıt
                    </button>
                </div>
            </div>


            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12 mb-12 animate-in slide-in-from-top-4 duration-300">
                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex p-1 bg-slate-100 rounded-2xl">
                            {LANGUAGES.map(lang => (
                                <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => setActiveLang(lang.code)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeLang === lang.code ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Ünvan ({activeLang.toUpperCase()})</label>
                                <input
                                    value={formData.languages[activeLang].address}
                                    onChange={(e) =>
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            languages: {
                                                ...prev.languages,
                                                [activeLang]: {
                                                    ...prev.languages[activeLang],
                                                    address: e.target.value,
                                                },
                                            },
                                        }))

                                    }
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">İş saatı({activeLang.toUpperCase()})</label>
                                <textarea
                                    value={formData.languages[activeLang].workingHoursDescription}
                                    onChange={(e) =>
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            languages: {
                                                ...prev.languages,
                                                [activeLang]: {
                                                    ...prev.languages[activeLang],
                                                    workingHoursDescription: e.target.value,
                                                },
                                            },
                                        }))
                                    }
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>

                        </div>


                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Telefon</label>
                                <input
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            phone: e.target.value,
                                        }))
                                    }
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Email</label>
                                <input
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            email: e.target.value,
                                        }))
                                    }
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>

                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-10 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                        >
                            Ləğv Et
                        </button>
                        <button
                            type="submit"
                            className="px-10 py-4 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-emerald-600/20"
                        >
                            {editingId ? 'Yadda Saxla' : 'Blogu Əlavə Et'}
                        </button>
                    </div>
                </form>
            </div>



        </div>
    );
};

export default AdminContact;
