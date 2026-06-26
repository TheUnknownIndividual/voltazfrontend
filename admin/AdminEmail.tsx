
import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useEmail } from '../contexts/EmailContext';
import { useNotification } from '../contexts/NotificationContext';


const AdminEmail: React.FC = () => {
    const { loading, applicationTypes, getApplicationTypes, getApplicationTypeById, createApplicationType, updateApplicationType, deleteApplicationType } = useEmail();
    const { showNotification } = useNotification();

    const [editingId, setEditingId] = useState<string | null>(null);

    const [form, setForm] = useState({
        az: "",
        en: "",
        ru: "",
        tr: "",
    });

    useEffect(() => {
        getApplicationTypes();
    }, []);

const getItemName = (item: any) => {
  return (
    item?.languages?.find((l: any) => l.languageCode === 1)?.name ||
    item?.languages?.find((l: any) => l.languageCode === 2)?.name ||
    item?.languages?.find((l: any) => l.languageCode === 3)?.name ||
    item?.languages?.find((l: any) => l.languageCode === 4)?.name ||
    "No name"
  );
};

    // INPUT CHANGE
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // RESET
    const resetForm = () => {
        setForm({ az: "", en: "", ru: "", tr: "" });
        setEditingId(null);
    };

    // CREATE / UPDATE
    const handleSubmit = async () => {
        try {
            const payload = {
                languages: [
                    { languageCode: 1, name: form.az },
                    { languageCode: 2, name: form.en },
                    { languageCode: 3, name: form.ru },
                    { languageCode: 4, name: form.tr },
                ],
            };

            if (editingId) {
                await updateApplicationType(editingId, payload);
                showNotification("Application type updated", "success");
            } else {
                await createApplicationType(payload);
                showNotification("Application type created", "success");
            }

            resetForm();
        } catch (err) {
            showNotification("Error occurred", "error");
        }
    };

const handleEdit = async (id: any) => {
    try {
        setEditingId(id);

        const res = await getApplicationTypeById(id);
        const item = res?.data || res;

        const mapped: any = {
            az: "",
            en: "",
            ru: "",
            tr: "",
        };

        item?.languages?.forEach((lang: any) => {
            if (lang.languageCode === 1) mapped.az = lang.name;
            if (lang.languageCode === 2) mapped.en = lang.name;
            if (lang.languageCode === 3) mapped.ru = lang.name;
            if (lang.languageCode === 4) mapped.tr = lang.name;
        });

        setForm(mapped);
    } catch (err) {
        showNotification("Failed to load application type", "error");
    }
};

    // DELETE
    const handleDelete = async (id: string) => {
        try {
            await deleteApplicationType(id);
            showNotification("Application type deleted", "success");
        } catch (err) {
            showNotification("Delete failed", "error");
        }
    };



    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Email tənzimləmləmləri</h2>
                    <p className="text-slate-500 text-sm">Bildirişlərin və avtomatik e-maillərin idarə edilməsi.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">

                <div className="p-8 space-y-8">

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Yeni Müraciət tipi Əlavə Et </label>
                        <div className="flex gap-4">
                            <div className="flex-grow grid grid-cols-2 lg:grid-cols-4 gap-2">

                                <input
                                name='az'
                                    value={form.az}
                                    onChange={handleChange}
                                    placeholder="AZ"
                                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                                />

                                <input
                                name='en'
                                    value={form.en}
                                    onChange={handleChange}
                                    placeholder="EN"
                                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                                />

                                <input
                                    name='ru'
                                    value={form.ru}
                                    onChange={handleChange}
                                    placeholder="RU"
                                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                                />

                                <input
                                    name='tr'
                                    value={form.tr}
                                    onChange={handleChange}
                                    placeholder="TR"
                                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                                />

                            </div>

                            <button
                                onClick={handleSubmit}
                                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg"
                            >
                                {editingId ? "Yenilə" : "Əlavə Et"}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                        {applicationTypes.map((item: any) => (
                            <div key={item.promotionId} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group gap-3">

                                <>
                                    <span className="text-sm font-bold text-slate-700 truncate">{getItemName(item)}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleEdit(item.id)}
                                            className="p-2 text-slate-400 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </>

                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEmail;
