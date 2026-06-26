
import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useNotification } from '../contexts/NotificationContext';
import { usePromotion } from "../contexts/PromotionContext";

const AdminPromotion: React.FC = () => {
    const { showNotification } = useNotification();
    const {
        promotions,
        getPromotions,
        getPromotionById,
        createPromotion,
        updatePromotion,
        deletePromotion,
    } = usePromotion();

    const [editingId, setEditingId] = useState<string | null>(null);

    const [form, setForm] = useState({
        az: "",
        en: "",
        ru: "",
        tr: "",
    });

    useEffect(() => {
        getPromotions();
    }, []);

const getItemName = (item: any) => {
  return (
    item?.languages?.find((l: any) => l.languageCode === 1)?.promotionName ||
    item?.languages?.find((l: any) => l.languageCode === 2)?.promotionName ||
    item?.languages?.find((l: any) => l.languageCode === 3)?.promotionName ||
    item?.languages?.find((l: any) => l.languageCode === 4)?.promotionName ||
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
                    { languageCode: 1, promotionName: form.az },
                    { languageCode: 2, promotionName: form.en },
                    { languageCode: 3, promotionName: form.ru },
                    { languageCode: 4, promotionName: form.tr },
                ],
            };

            if (editingId) {
                await updatePromotion(editingId, payload);
                showNotification("Promotion updated", "success");
            } else {
                await createPromotion(payload);
                showNotification("Promotion created", "success");
            }

            resetForm();
        } catch (err) {
            showNotification("Error occurred", "error");
        }
    };

const handleEdit = async (id: any) => {
    try {
        setEditingId(id);

        const res = await getPromotionById(id);
        const item = res?.data || res;

        const mapped: any = {
            az: "",
            en: "",
            ru: "",
            tr: "",
        };

        item?.languages?.forEach((lang: any) => {
            if (lang.languageCode === 1) mapped.az = lang.promotionName;
            if (lang.languageCode === 2) mapped.en = lang.promotionName;
            if (lang.languageCode === 3) mapped.ru = lang.promotionName;
            if (lang.languageCode === 4) mapped.tr = lang.promotionName;
        });

        setForm(mapped);
    } catch (err) {
        showNotification("Failed to load promotion", "error");
    }
};

    // DELETE
    const handleDelete = async (id: string) => {
        try {
            await deletePromotion(id);
            showNotification("Deleted", "success");
        } catch (err) {
            showNotification("Delete failed", "error");
        }
    };



    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Promosiya İdarəetməsi</h2>
                    <p className="text-slate-500 text-sm">Məhsul promosiyaları tənzimləyin</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">

                <div className="p-8 space-y-8">

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Yeni Promosiya Əlavə Et </label>
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
                        {promotions.map((item: any) => (
                            <div key={item.promotionId} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group gap-3">

                                <>
                                    <span className="text-sm font-bold text-slate-700 truncate">{getItemName(item)}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleEdit(item.promotionId)}
                                            className="p-2 text-slate-400 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.promotionId)}
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

export default AdminPromotion;
