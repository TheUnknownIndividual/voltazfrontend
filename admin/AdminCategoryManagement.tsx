
import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useNotification } from '../contexts/NotificationContext';
import { useCategory } from '../contexts/CategoryContext';
import { DEFAULT_CATEGORY_CONFIG } from '../lib/categoryConfig';

const AdminCategoryManagement: React.FC = () => {
  const config = DEFAULT_CATEGORY_CONFIG;
  const { showNotification } = useNotification();
  const {
    loading,
    categories,
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    subcategories,
    getSubCategories,
    getSubCategoryById,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    brands,
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
    technologies,
    getTechnology,
    getTechnologyById,
    createTechnology,
    updateTechnology,
    deleteTechnology,
  } = useCategory();

  const [activeTab, setActiveTab] = useState<'subCategories' | 'brands' | 'series' | 'technologies' | 'mainCategories' | string>('mainCategories');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    az: "",
    en: "",
    ru: "",
    tr: ""
  });

  const [brandName, setBrandName] = useState("");
  const [technologyName, setTechnologyName] = useState("");

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory && activeTab === "subCategories") {
      getSubCategories(selectedCategory);
    }
  }, [selectedCategory, activeTab]);
  useEffect(() => {
    if (selectedCategory && activeTab === "brands") {
      getBrands(selectedCategory);
    }
  }, [selectedCategory, activeTab]);

  useEffect(() => {
    if (selectedCategory && activeTab === "technologies") {
      getTechnology(selectedCategory);
    }
  }, [selectedCategory, activeTab]);

  useEffect(() => {
    if (!categories) return;
    if (categories.length === 0) return;


    setSelectedCategory(prev => {
      const exists = categories.some(c => Number(c.id) === Number(prev));
      return exists ? Number(prev) : Number(categories[0].id);
    });
  }, [categories]);


  useEffect(() => {
    setFormData({
      az: "",
      en: "",
      ru: "",
      tr: ""
    });
    setTechnologyName("");
    setBrandName("");
    setEditingItem(null);

  }, [activeTab]);

  const getItemName = (item: any) => {

const lang = item?.languages?.[0];

    return (
      lang?.categoryName ||
      lang?.subCategoryName ||
      lang?.brandName ||
      lang?.technologyName ||
      ""
    );
  };

  useEffect(() => {
  console.log("categories", categories);
}, [categories]);

useEffect(() => {
  console.log("subcategories", subcategories);
}, [subcategories]);

useEffect(() => {
  console.log("brands", brands);
}, [brands]);

useEffect(() => {
  console.log("technologies", technologies);
}, [technologies]);

  const getItems = () => {
    switch (activeTab) {
      case 'mainCategories':
        return categories || [];

      case 'subCategories':
        return subcategories || [];

      case 'brands':
        return brands || [];


      case 'technologies':
        return technologies || [];

      default:
        return [];
    }
  };

  const items = getItems();
  const categoryId = selectedCategory;

  const handleDelete = async (id: string) => {
    try {


      if (categoryId == null) {
        showNotification("Kateqoriya seçilməyib", "error");
        return;
      }

      if (activeTab === "technologies") {
        await deleteTechnology(id);
        await getTechnology(categoryId);
        showNotification("Texnologiya silindi", "warning");
        return;
      }

      if (activeTab === "brands") {

        await deleteBrand(id);

        await getBrands(categoryId);

        showNotification("Marka silindi", "warning");

        return;
      }

      if (activeTab === "subCategories") {

        await deleteSubCategory(id);

        await getSubCategories(categoryId);

        showNotification("Alt kateqoriya silindi", "warning");

      } else {

        await deleteCategory(id);

        await getCategories();

        showNotification("Kateqoriya silindi", "warning");
      }

    } catch (err) {
      showNotification("Xəta baş verdi", "error");
    }
  };


  const handleEdit = async (id: string) => {
    try {
      let data;

      if (activeTab === "technologies") {
        const data = await getTechnologyById(id);
        setTechnologyName(data.name);
        setEditingItem(id);
        return;
      }

      if (activeTab === "brands") {

        data = await getBrandById(id);

        setBrandName(data.name);

        setEditingItem(id);

        return;
      }

      if (activeTab === "subCategories") {
        data = await getSubCategoryById(id);
      } else {
        data = await getCategoryById(id);
      }

      setFormData({
        az:
          data.languages?.find((l: any) => l.languageCode === 1)
            ?.categoryName ||
          data.languages?.find((l: any) => l.languageCode === 1)
            ?.subCategoryName ||
          "",

        en:
          data.languages?.find((l: any) => l.languageCode === 2)
            ?.categoryName ||
          data.languages?.find((l: any) => l.languageCode === 2)
            ?.subCategoryName ||
          "",

        ru:
          data.languages?.find((l: any) => l.languageCode === 3)
            ?.categoryName ||
          data.languages?.find((l: any) => l.languageCode === 3)
            ?.subCategoryName ||
          "",

        tr:
          data.languages?.find((l: any) => l.languageCode === 4)
            ?.categoryName ||
          data.languages?.find((l: any) => l.languageCode === 4)
            ?.subCategoryName ||
          ""
      });

      setEditingItem(id);

    } catch (err) {
      showNotification("Xəta baş verdi", "error");
    }
  };


  const handleSubmit = async () => {
    try {



      if (activeTab === "technologies") {
           if (categoryId == null) {
        showNotification("Kateqoriya seçilməyib", "error");
        return;
      }
        const payload = {
          productCategoryId: Number(categoryId),
          name: technologyName
        };

        if (editingItem) {
          await updateTechnology(editingItem, payload);
          showNotification("Texnologiya yeniləndi", "success");
        } else {
          await createTechnology(payload);
          showNotification("Texnologiya əlavə edildi", "success");
        }

        await getTechnology(categoryId); // və ya getTechnologies varsa
        setTechnologyName("");
        setEditingItem(null);
        return;
      }

      if (activeTab === "brands") {
           if (categoryId == null) {
        showNotification("Kateqoriya seçilməyib", "error");
        return;
      }

        const payload = {
          productCategoryId: Number(categoryId),
          name: brandName
        };

        if (editingItem) {
          await updateBrand(editingItem, payload);
          showNotification("Marka yeniləndi", "success");
        } else {
          await createBrand(payload);
          showNotification("Marka əlavə edildi", "success");
        }

        await getBrands(categoryId);

        setBrandName("");

        return;
      };

      if (activeTab === "subCategories") {

           if (categoryId == null) {
        showNotification("Kateqoriya seçilməyib", "error");
        return;
      }

        const payload = {
          productCategoryId: Number(categoryId),
          languages: [
            { languageCode: 1, subCategoryName: formData.az },
            { languageCode: 2, subCategoryName: formData.en },
            { languageCode: 3, subCategoryName: formData.ru },
            { languageCode: 4, subCategoryName: formData.tr }
          ]
        };

        if (editingItem) {
          await updateSubCategory(editingItem, payload);
          showNotification("Alt kateqoriya yeniləndi", "success");
        } else {
          await createSubCategory(payload);
          showNotification("Alt kateqoriya əlavə edildi", "success");
        }

        await getSubCategories(categoryId);

      } else {

        const payload = {
          languages: [
            { languageCode: 1, categoryName: formData.az },
            { languageCode: 2, categoryName: formData.en },
            { languageCode: 3, categoryName: formData.ru },
            { languageCode: 4, categoryName: formData.tr }
          ]
        };

        if (editingItem) {
          await updateCategory(editingItem, payload);
          showNotification("Kateqoriya yeniləndi", "success");
        } else {
          await createCategory(payload);
          showNotification("Kateqoriya əlavə edildi", "success");
        }

        await getCategories();
      }

      setFormData({
        az: "",
        en: "",
        ru: "",
        tr: ""
      });

      setEditingItem(null);

    } catch (err) {
      showNotification("Xəta baş verdi", "error");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Kateqoriya İdarəetməsi</h2>
          <p className="text-slate-500 text-sm">Məhsul atributlarını və alt kateqoriyaları tənzimləyin</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="flex border-b border-slate-50">
          {[
            { id: 'mainCategories', label: 'Ana Kateqoriyalar' },
            { id: 'subCategories', label: 'Alt Kateqoriyalar' },
            { id: 'brands', label: 'Markalar' },
            { id: 'technologies', label: 'Texnologiyalar' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8 space-y-8">
          {activeTab !== 'mainCategories' && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kateqoriya Seçin</label>
              <div className="flex flex-wrap gap-2">

                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat.id
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600"
                      }`}
                  >
                    {getItemName(cat)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              {activeTab === 'subCategories' ? 'Yeni Alt Kateqoriya' :
                activeTab === 'brands' ? 'Yeni Marka' :
                  activeTab === 'series' ? 'Yeni Seriya' :
                    activeTab === 'mainCategories' ? 'Yeni Ana Kateqoriya' :
                      activeTab === 'technologies' ? 'Yeni Texnologiya' :
                        `Yeni ${config.customAttributes?.find(a => a.id === activeTab)?.name || 'Element'}`} Əlavə Et
            </label>
            <div className="flex gap-4">
              {/* <div className="flex-grow grid grid-cols-2 lg:grid-cols-4 gap-2"> */}
              <div className={`flex-grow ${activeTab === "brands" || activeTab === "technologies"
                ? ""
                : "grid grid-cols-2 lg:grid-cols-4 gap-2"
                }`}>

                {activeTab === "brands" || activeTab === "technologies" ? (
                  <input
                    value={
                      activeTab === "brands"
                        ? brandName
                        : technologyName
                    }
                    onChange={(e) => {
                      if (activeTab === "brands") setBrandName(e.target.value);
                      if (activeTab === "technologies") setTechnologyName(e.target.value);
                    }}
                    placeholder={
                      activeTab === "brands"
                        ? "Marka adı"
                        : "Texnologiya adı"
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                  />
                ) : (
                  <>
                    <input
                      value={formData.az}
                      onChange={e => setFormData(prev => ({ ...prev, az: e.target.value }))}
                      placeholder="AZ"
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                    />

                    <input
                      value={formData.en}
                      onChange={e => setFormData(prev => ({ ...prev, en: e.target.value }))}
                      placeholder="EN"
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                    />

                    <input
                      value={formData.ru}
                      onChange={e => setFormData(prev => ({ ...prev, ru: e.target.value }))}
                      placeholder="RU"
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                    />

                    <input
                      value={formData.tr}
                      onChange={e => setFormData(prev => ({ ...prev, tr: e.target.value }))}
                      placeholder="TR"
                      className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                    />
                  </>
                )}

              </div>

              <button onClick={handleSubmit}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg"
              >
                {editingItem ? "Yenilə" : "Əlavə Et"}
              </button>
            </div>
          </div>

          {activeTab === "brands" || activeTab === "technologies" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">

              {(activeTab === "brands" ? brands : technologies).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group gap-3"
                >
                  <span className="text-sm font-bold text-slate-700 truncate">
                    {item.name}
                  </span>

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
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group gap-3"
                >
                  <>
                    <span className="text-sm font-bold text-slate-700 truncate">
                      {getItemName(item)}
                    </span>

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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryManagement;
