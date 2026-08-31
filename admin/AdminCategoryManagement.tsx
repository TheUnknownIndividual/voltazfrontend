
import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { useNotification } from '../contexts/NotificationContext';
import { useCategory } from '../contexts/CategoryContext';
import { DEFAULT_CATEGORY_CONFIG } from '../lib/categoryConfig';

type TranslationLocale = 'az' | 'en' | 'ru' | 'tr';

const translationFields: Array<{ locale: TranslationLocale; code: number; label: string }> = [
  { locale: 'az', code: 1, label: 'AZ' },
  { locale: 'en', code: 2, label: 'EN' },
  { locale: 'ru', code: 3, label: 'RU' },
  { locale: 'tr', code: 4, label: 'TR' },
];

const getTranslationValue = (language: any) => String(
  language?.categoryName || language?.subCategoryName || ''
).trim();

const getMissingTranslationLabels = (item: any) => {
  const languages = Array.isArray(item?.languages) ? item.languages : [];

  return translationFields
    .filter(field => {
      const language = languages.find(
        (candidate: any) => Number(candidate?.languageCode) === field.code
      );
      return !getTranslationValue(language);
    })
    .map(field => field.label);
};

const AdminCategoryManagement: React.FC = () => {
  const config = DEFAULT_CATEGORY_CONFIG;
  const { showNotification } = useNotification();
  const {
    loading,
    categories,
    getCategories,
    getCategoryById,
    getCategoryProductOptions,
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
  const [homePageSettings, setHomePageSettings] = useState({
    showOnHomePage: false,
    homePageDisplayOrder: 1,
    homePageProductId: null as number | null,
  });
  const [categoryProductOptions, setCategoryProductOptions] = useState<any[]>([]);
  const [productOptionsLoading, setProductOptionsLoading] = useState(false);
  const [translationSubmitAttempted, setTranslationSubmitAttempted] = useState(false);
  const lastTranslationWarning = useRef('');

  const [brandName, setBrandName] = useState("");
  const [technologyName, setTechnologyName] = useState("");

  useEffect(() => {
    void getCategories({ includeAllLanguages: true });
  }, []);

  useEffect(() => {
    if (selectedCategory && activeTab === "subCategories") {
      void getSubCategories(selectedCategory, { includeAllLanguages: true });
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
    setHomePageSettings({
      showOnHomePage: false,
      homePageDisplayOrder: 1,
      homePageProductId: null,
    });
    setCategoryProductOptions([]);
    setTranslationSubmitAttempted(false);

  }, [activeTab]);

  const getItemName = (item: any) => {
    const languages = Array.isArray(item?.languages) ? item.languages : [];
    const lang = languages.find((language: any) => Number(language?.languageCode) === 1)
      || languages.find((language: any) => getTranslationValue(language));

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
  const managesTranslations = activeTab === 'mainCategories' || activeTab === 'subCategories';
  const missingFormLanguages = translationFields.filter(
    field => !formData[field.locale].trim()
  );
  const itemsMissingTranslations = managesTranslations
    ? items
      .map(item => ({ item, missing: getMissingTranslationLabels(item) }))
      .filter(entry => entry.missing.length > 0)
    : [];
  const missingTranslationSignature = itemsMissingTranslations
    .map(entry => `${entry.item.id}:${entry.missing.join(',')}`)
    .join('|');

  useEffect(() => {
    if (!missingTranslationSignature) {
      lastTranslationWarning.current = '';
      return;
    }

    if (lastTranslationWarning.current === missingTranslationSignature) return;

    lastTranslationWarning.current = missingTranslationSignature;
    const preview = itemsMissingTranslations
      .slice(0, 2)
      .map(entry => `${getItemName(entry.item)} (${entry.missing.join('/')})`)
      .join('; ');
    const remainingCount = itemsMissingTranslations.length - 2;
    showNotification(
      `Tərcümə çatışmır: ${preview}${remainingCount > 0 ? `; +${remainingCount} element` : ''}`,
      'warning'
    );
  }, [missingTranslationSignature, itemsMissingTranslations.length, showNotification]);

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

        await getSubCategories(categoryId, { includeAllLanguages: true });

        showNotification("Alt kateqoriya silindi", "warning");

      } else {

        await deleteCategory(id);

        await getCategories({ includeAllLanguages: true });

        showNotification("Kateqoriya silindi", "warning");
      }

    } catch (err) {
      showNotification("Xəta baş verdi", "error");
    }
  };


  const handleEdit = async (id: string) => {
    try {
      setTranslationSubmitAttempted(false);
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

      if (activeTab === "mainCategories") {
        setProductOptionsLoading(true);
        const productOptions = await getCategoryProductOptions(id);
        setCategoryProductOptions(productOptions);

        const usedOrders = new Set(
          (categories || [])
            .filter(category => category.showOnHomePage && String(category.id) !== String(id))
            .map(category => Number(category.homePageDisplayOrder))
        );
        const firstAvailableOrder = [1, 2, 3, 4, 5].find(order => !usedOrders.has(order)) || 1;
        const savedProductExists = productOptions.some(
          option => Number(option.id) === Number(data.homePageProductId)
        );
        const selectedProductId = savedProductExists
          ? Number(data.homePageProductId)
          : Number(productOptions[0]?.id) || null;

        setHomePageSettings({
          showOnHomePage: Boolean(data.showOnHomePage),
          homePageDisplayOrder: Number(data.homePageDisplayOrder) || firstAvailableOrder,
          homePageProductId: selectedProductId,
        });
        setProductOptionsLoading(false);
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
    } finally {
      setProductOptionsLoading(false);
    }
  };


  const handleSubmit = async () => {
    try {
      if (managesTranslations && missingFormLanguages.length > 0) {
        setTranslationSubmitAttempted(true);
        showNotification(
          `Tərcümələri tamamlayın: ${missingFormLanguages.map(field => field.label).join(', ')}`,
          'warning'
        );
        return;
      }

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

        await getSubCategories(categoryId, { includeAllLanguages: true });

      } else {

        const payload = {
          languages: [
            { languageCode: 1, categoryName: formData.az },
            { languageCode: 2, categoryName: formData.en },
            { languageCode: 3, categoryName: formData.ru },
            { languageCode: 4, categoryName: formData.tr }
          ],
          showOnHomePage: editingItem ? homePageSettings.showOnHomePage : false,
          homePageDisplayOrder: editingItem ? homePageSettings.homePageDisplayOrder : 0,
          homePageProductId: editingItem ? homePageSettings.homePageProductId : null,
        };

        if (editingItem) {
          await updateCategory(editingItem, payload);
          showNotification("Kateqoriya yeniləndi", "success");
        } else {
          await createCategory(payload);
          showNotification("Kateqoriya əlavə edildi", "success");
        }

        await getCategories({ includeAllLanguages: true });
      }

      setFormData({
        az: "",
        en: "",
        ru: "",
        tr: ""
      });

      setEditingItem(null);
      setHomePageSettings({
        showOnHomePage: false,
        homePageDisplayOrder: 1,
        homePageProductId: null,
      });
      setCategoryProductOptions([]);
      setTranslationSubmitAttempted(false);

    } catch (err: any) {
      const details = err?.response?.data?.error?.details;
      showNotification(typeof details === 'string' ? details : "Xəta baş verdi", "error");
    } finally {
      setProductOptionsLoading(false);
    }
  };

  const selectedHomeProduct = categoryProductOptions.find(
    option => Number(option.id) === Number(homePageSettings.homePageProductId)
  );
  const homepageCategoryLimitReached = (categories || []).filter(
    category => category.showOnHomePage && String(category.id) !== String(editingItem)
  ).length >= 5;

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

          {managesTranslations && itemsMissingTranslations.length > 0 && (
            <div
              role="alert"
              className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-widest">
                    {itemsMissingTranslations.length} elementdə tərcümə çatışmır
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800">
                    Sarı nişanlı elementləri redaktə edin. Hər kateqoriya üçün AZ, EN, RU və TR adları doldurulmalıdır.
                  </p>
                </div>
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
                  translationFields.map(field => {
                    const missing = !formData[field.locale].trim();
                    const showMissingState = missing && (Boolean(editingItem) || translationSubmitAttempted);

                    return (
                      <label key={field.locale} className="space-y-1">
                        <span className="sr-only">{field.label} tərcüməsi</span>
                        <input
                          value={formData[field.locale]}
                          onChange={event => setFormData(prev => ({
                            ...prev,
                            [field.locale]: event.target.value,
                          }))}
                          placeholder={field.label}
                          aria-invalid={showMissingState}
                          className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all ${
                            showMissingState
                              ? 'border-amber-400 ring-2 ring-amber-100 focus:border-amber-500'
                              : 'border-slate-100 focus:border-emerald-500'
                          }`}
                        />
                        {showMissingState && (
                          <span className="block pl-1 text-[9px] font-black uppercase tracking-widest text-amber-600">
                            {field.label} çatışmır
                          </span>
                        )}
                      </label>
                    );
                  })
                )}

              </div>

              <button onClick={handleSubmit}
                className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg"
              >
                {editingItem ? "Yenilə" : "Əlavə Et"}
              </button>
            </div>

            {managesTranslations && !editingItem && !translationSubmitAttempted && (
              <p className="text-xs font-medium text-slate-500">
                Yeni element yaradarkən dörd dilin hamısını doldurun: AZ, EN, RU və TR.
              </p>
            )}

            {activeTab === 'mainCategories' && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Mobil ana səhifə</h3>
                    <p className="mt-1 text-xs text-slate-500">Maksimum 5 kateqoriya göstərilir.</p>
                  </div>
                  {editingItem && (
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={homePageSettings.showOnHomePage}
                        disabled={
                          productOptionsLoading ||
                          categoryProductOptions.length === 0 ||
                          (!homePageSettings.showOnHomePage && homepageCategoryLimitReached)
                        }
                        onChange={event => setHomePageSettings(prev => ({
                          ...prev,
                          showOnHomePage: event.target.checked,
                        }))}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      Ana səhifədə göstər
                    </label>
                  )}
                </div>

                {!editingItem ? (
                  <p className="text-xs leading-relaxed text-slate-500">
                    Əvvəlcə kateqoriyanı yaradın. Məhsul əlavə edildikdən sonra kateqoriyanı redaktə edib şəkil mənbəyini seçə bilərsiniz.
                  </p>
                ) : productOptionsLoading ? (
                  <p className="text-xs font-bold text-slate-400">Məhsullar yüklənir...</p>
                ) : categoryProductOptions.length === 0 ? (
                  <p className="text-xs leading-relaxed text-amber-600">
                    Bu kateqoriyada şəkli olan aktiv məhsul yoxdur.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-[8rem_minmax(0,1fr)_8rem] md:items-end">
                    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white p-2">
                      <img
                        src={selectedHomeProduct?.imageUrl || '/volt-logo.png'}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <label className="space-y-2">
                      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Şəkli göstəriləcək məhsul</span>
                      <select
                        value={homePageSettings.homePageProductId || ''}
                        onChange={event => setHomePageSettings(prev => ({
                          ...prev,
                          homePageProductId: Number(event.target.value) || null,
                        }))}
                        className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500"
                      >
                        {categoryProductOptions.map(option => (
                          <option key={option.id} value={option.id}>{option.productName}</option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Sıra</span>
                      <select
                        value={homePageSettings.homePageDisplayOrder}
                        disabled={!homePageSettings.showOnHomePage}
                        onChange={event => setHomePageSettings(prev => ({
                          ...prev,
                          homePageDisplayOrder: Number(event.target.value),
                        }))}
                        className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-emerald-500"
                      >
                        {[1, 2, 3, 4, 5].map(order => <option key={order} value={order}>{order}</option>)}
                      </select>
                    </label>
                  </div>
                )}

                {editingItem && !homePageSettings.showOnHomePage && homepageCategoryLimitReached && (
                  <p className="mt-3 text-xs font-bold text-amber-600">Limit doludur. Başqa kateqoriyanı gizlətdikdən sonra bunu aktivləşdirə bilərsiniz.</p>
                )}
              </div>
            )}
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
              {items.map((item) => {
                const missingTranslations = getMissingTranslationLabels(item);

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-2xl border p-4 group gap-3 ${
                      missingTranslations.length > 0
                        ? 'border-amber-200 bg-amber-50/70'
                        : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-bold text-slate-700">
                        {getItemName(item)}
                      </span>
                      {missingTranslations.length > 0 && (
                        <span className="mt-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-700">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          Çatışmır: {missingTranslations.join(', ')}
                        </span>
                      )}
                      {activeTab === 'mainCategories' && item.showOnHomePage && (
                        <span className="mt-1 block text-[9px] font-black uppercase tracking-widest text-emerald-600">
                          Mobil ana səhifə · sıra {item.homePageDisplayOrder}
                        </span>
                      )}
                    </div>

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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryManagement;
