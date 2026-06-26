
import React, { useState, useMemo, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { ProductVariant } from '../types';
import { DEFAULT_CATEGORY_CONFIG } from '../lib/categoryConfig';
import { useCategory } from '../contexts/CategoryContext';
import { usePromotion } from '@/contexts/PromotionContext';
import { useUpload } from "../contexts/UploadContext";
import { useProduct } from "../contexts/ProductContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WarehouseProduct {
  id: number;
  name: string;
  type: string;
  subCategory?: string;
  brand?: string;
  power?: string;
  efficiency?: number;
  technology?: string;
  model?: string;
  mppt?: string;
  phaseCount?: string;
  count: number;
  price: number;
  status: 'on_site' | 'in_warehouse';
  showOnHome?: boolean;
  image?: string;
  images?: string[];
  description?: string;
  isOnOrder?: boolean;
  features?: string;
  promotion?: string;
  specs?: string;
  customSpecs?: Record<string, string>;
  datasheets?: string[];
  certificate?: string;
  variants?: ProductVariant[];
}


const LANGUAGES = [
  { code: 'az', name: 'Azərbaycan' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'tr', name: 'Türkçe' }
] as const;

const languageMap = {
  az: 1,
  en: 2,
  ru: 3,
  tr: 4,
};

type LangCode = typeof LANGUAGES[number]['code'];

const AdminWarehouse: React.FC = () => {
  const { showNotification, confirm } = useNotification();
  const {
    loading,
    categories,
    getCategories,
    subcategories,
    getSubCategories,
    brands,
    getBrands,
    technologies,
    getTechnology,
  } = useCategory();
  const { productData,
    getProducts,
    getHomeProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    showProductOnHome, getProductCount, productCount } = useProduct();
  const { promotions, getPromotions } = usePromotion();
  const [activeLang, setActiveLang] = useState<LangCode>('az');
  const { uploadImage, deleteImage, uploadPDF, deletePDF } = useUpload();
  const [activeCategory, setActiveCategory] = useState<'on_site' | 'in_warehouse'>('on_site');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<WarehouseProduct | null>(null);
  const [categoryConfig, setCategoryConfig] = useState(DEFAULT_CATEGORY_CONFIG);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    getCategories();
    getProductCount();
  }, []);

useEffect(() => {
  getProducts(undefined, undefined, page, pageSize);
}, [page, pageSize]);

const totalPages = productData?.totalPages || 0;

const getPagination = (current, total, windowSize = 5) => {
  const pages = [];

  const blockIndex = Math.ceil(current / windowSize);

  const start = (blockIndex - 1) * windowSize + 1;
  const end = Math.min(start + windowSize - 1, total);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
};



  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;

    setNewProduct({
      ...newProduct,
      type: categoryId,
      subCategory: "",
      brand: "",
      technology: "",
    });

    try {
      await getSubCategories(categoryId);
      await getBrands(categoryId);
      await getTechnology(categoryId);

    } catch (err) {
      console.log(err);
    }
  };

  const getItemName = (item: any) => {


    const lang = item?.languages?.find(
      (l: any) => l.languageCode === 1
    );

    return (
      lang?.categoryName ||
      lang?.subCategoryName ||
      lang?.brandName ||
      lang?.seriesName ||
      lang?.technologyName ||
      lang?.promotionName ||
      ""
    );
  };

  const initialNewProduct = {
    name: '',
    type: '',
    subCategory: '',
    brand: '',
    power: '',
    efficiency: 0,
    technology: '',
    model: '',
    mppt: '',
    phaseCount: '',
    customSpecs: {} as Record<string, string>,
    count: 0,
    amount: 0,
    images: [] as string[],
    description: {
      az: "",
      en: "",
      ru: "",
      tr: "",
    },

    features: {
      az: "",
      en: "",
      ru: "",
      tr: "",
    },
    promotion: [] as number[],
    specs: '',
    datasheet: '',
    datasheets: [] as string[],
    certificate: '',
    certificates: '',
    showOnHome: false,
    isOnOrder: false,
    status: 'in_warehouse' as 'on_site' | 'in_warehouse',
    variants: [] as ProductVariant[]
  };

  const [newProduct, setNewProduct] = useState(initialNewProduct);

  // Load from localStorage
  const [products, setProducts] = useState<WarehouseProduct[]>([]);


  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        productName: newProduct.name,
        productCategoryId: Number(newProduct.type),
        productSubCategoryId: Number(newProduct.subCategory),
        productBrandId: Number(newProduct.brand),
        productTechnologyId: Number(newProduct.technology),

        inStock: newProduct.isOnOrder,
        inHomePage: newProduct.showOnHome,

        certificate: newProduct.certificate,

        productImage: newProduct.images,
        productDatasheet: newProduct.datasheets,

        productParametrs: [
          {
            technicalPower: newProduct.power || '',
            effectiveness: Number(newProduct.efficiency) || 0,
            count: Number(newProduct.count) || 0,
            amount: Number(newProduct.amount) || 0,
          },
           ...newProduct.variants.map((variant) => ({
    technicalPower: variant.power || "",
    effectiveness: Number(variant.efficiency) || 0,
    count: Number(variant.count) || 0,
    amount: Number(variant.price) || 0,
  })),
        ],

        productDescriptions: [
          {
            languages: LANGUAGES.map((lang) => ({
              languageCode: languageMap[lang.code],

              description:
                newProduct.description[lang.code] || "",

              features:
                newProduct.features[lang.code] || "",
            })),
          },
        ],

        promotionIds: newProduct.promotion.length > 0
          ? newProduct.promotion.map(Number)
          : [],
      };

      // EDIT
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);

        showNotification(
          "Məhsul uğurla yeniləndi",
          "success"
        );
      }

      // CREATE
      else {
        await createProduct(payload);

        showNotification(
          "Məhsul uğurla yaradıldı",
          "success"
        );
      }

      await getProducts(undefined, undefined, page, pageSize);
      await getProductCount();

      setShowAddModal(false);
      setNewProduct(initialNewProduct);
      setEditingProduct(null);


    } catch (error) {
      console.error("CREATE PRODUCT ERROR:", error);
      showNotification("Məhsul yaradılmadı", "error");
    }
  };

  const handleEditClick = async (product) => {
    try {
      const res = await getProductById(product.id);

      const data = res?.data;

      if (!data) return;

      setEditingProduct(data);
   

      setNewProduct({
        name: data.productName || "",

        type: String(data.productCategoryId || ""),
        subCategory: String(data.productSubCategoryId || ""),
        brand: String(data.productBrandId || ""),
        technology: String(data.productTechnologyId || ""),

        power: data.productParametrs?.[0]?.technicalPower || '',
        efficiency: Number(data.productParametrs?.[0]?.effectiveness || 0),

        count: data.productParametrs?.[0]?.count || 0,
        amount: data.productParametrs?.[0]?.amount || 0,
  
   
          variants: (data.productParametrs || [])
    .slice(1)
    .map((p) => ({
      power: p.technicalPower || "",
      efficiency: p.effectiveness || 0,
      count: p.count || 0,
      price: p.amount || 0,
    })),

        images: data.productImage || [],

        description: {
          az:
            data.productDescriptions?.[0]?.languages?.find(
              l => l.languageCode === 1
            )?.description || "",

          en:
            data.productDescriptions?.[0]?.languages?.find(
              l => l.languageCode === 2
            )?.description || "",

          ru:
            data.productDescriptions?.[0]?.languages?.find(
              l => l.languageCode === 3
            )?.description || "",

          tr:
            data.productDescriptions?.[0]?.languages?.find(
              l => l.languageCode === 4
            )?.description || "",
        },

        features: {
          az:
            data.productDescriptions?.[0]?.languages?.find(
              l => l.languageCode === 1
            )?.features || "",

          en:
            data.productDescriptions?.[0]?.languages?.find(
              l => l.languageCode === 2
            )?.features || "",

          ru:
            data.productDescriptions?.[0]?.languages?.find(
              l => l.languageCode === 3
            )?.features || "",

          tr:
            data.productDescriptions?.[0]?.languages?.find(
              l => l.languageCode === 4
            )?.features || "",
        },

        promotion: data.promotionIds?.map(Number) || [],

        datasheets: data.productDatasheet || [],

        certificate: data.certificate || "",

        showOnSite: data.showOnSite || false,
        showOnHome: data.inHomePage || false,
        isOnOrder: data.inStock || false,

        status: data.showOnSite
          ? "on_site"
          : "in_warehouse",


        customSpecs: {},
      });

      await getSubCategories(data.productCategoryId);
      await getBrands(data.productCategoryId);
      await getTechnology(data.productCategoryId);

      setShowAddModal(true);

    } catch (err) {
      console.error(err);
      showNotification("Məhsul məlumatı alınmadı", "error");
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    setNewProduct(initialNewProduct);
  };


const handleDelete = async (id: number) => {
  if (!(await confirm("Bu məhsulu silmək istədiyinizə əminsiniz?"))) return;

  try {
    await deleteProduct(id); // 👈 backend delete

    showNotification("Məhsul silindi", "success");

    // list refresh
   await getProducts(undefined, undefined, page, pageSize);
   await getProductCount();

  } catch (error) {
    console.error("DELETE ERROR:", error);
    showNotification("Məhsul silinmədi", "error");
  }
};




const handleToggleHome = async (product: any) => {
  try {
    await showProductOnHome(product.id, !product.inHomePage);
    await getProducts(undefined, undefined, page, pageSize);
    await getProductCount();
  } catch (err) {
    console.error(err);
  }
};


  const types = useMemo(() => {
    const configTypes = Object.keys(categoryConfig.subCategories);
    return ['all', ...configTypes];
  }, [categoryConfig]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const categoryMatch = p.status === activeCategory;
      const typeMatch = typeFilter === 'all' || p.type === typeFilter;
      const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && typeMatch && searchMatch;
    });
  }, [products, activeCategory, typeFilter, searchQuery]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const url = await uploadImage(file); // 👈 backend upload
        uploadedUrls.push(url.data.path);
      }

      setNewProduct(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

      showNotification("Şəkillər yükləndi", "success");

    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      showNotification("Şəkil yüklənmədi", "error");
    }
  };

  const handleDatasheetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const url = await uploadImage(file); // 👈 backend upload
        uploadedUrls.push(url.data.path);
      }

      setNewProduct(prev => ({
        ...prev,
        datasheets: [...prev.datasheets, ...uploadedUrls],
      }));

      showNotification("Şəkillər yükləndi", "success");

    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      showNotification("Şəkil yüklənmədi", "error");
    }
  };

  const handleCertificateUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadPDF(file);

      setNewProduct(prev => ({
        ...prev,
        certificate: url.data.path // 👈 tək string
      }));

      showNotification("Sertifikat yükləndi", "success");
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      showNotification("Sertifikat yüklənmədi", "error");
    }
  };


  const removeImage = async (index) => {
    if (!newProduct.images) return;

    try {
      const imageUrl = newProduct.images[index];

      await deleteImage(imageUrl);

      setNewProduct(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } catch (err) {
      console.error(err);
      showNotification("Şəkil silinmədi", "error");
    }
  };

  const removeDatasheet = async (index) => {
    if (!newProduct.datasheets) return;

    try {
      const datasheetUrl = newProduct.datasheets[index];

      await deleteImage(datasheetUrl);

      setNewProduct(prev => ({
        ...prev,
        datasheets: prev.datasheets.filter((_, i) => i !== index)
      }));
    } catch (err) {
      console.error(err);
      showNotification("Şəkil silinmədi", "error");
    }
  };

  const removeCertificate = async () => {
    if (!newProduct.certificate) return;

    try {
      await deletePDF(newProduct.certificate);

      setNewProduct(prev => ({
        ...prev,
        certificate: '',
      }));

      showNotification("Sertifikat silindi", "info");

    } catch (err) {
      console.error(err);
      showNotification("Sertifikat silinmədi", "error");
    }
  };

  const addVariant = () => {
  setNewProduct((prev) => ({
    ...prev,
    variants: [
      ...prev.variants,
      {
        power: "",
        efficiency: "",
        count: 0,
        price: 0,
      },
    ],
  }));
};

const removeVariant = (index: number) => {
  setNewProduct((prev) => ({
    ...prev,
    variants: prev.variants.filter((_, i) => i !== index),
  }));
};

const updateVariant = (
  index: number,
  field: string,
  value: any
) => {
  setNewProduct((prev) => ({
    ...prev,
    variants: prev.variants.map((variant, i) =>
      i === index
        ? { ...variant, [field]: value }
        : variant
    ),
  }));
};

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900">Məhsul İdarəetməsi</h3>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Məhsul ehtiyatları və qiymətlər</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={async () => {
              setShowAddModal(true);
              await getPromotions();
            }}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            Məhsul Daxil Et
          </button>

        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ümumi Məhsul Sayı</div>
          <div className="text-3xl font-black text-slate-900">{filteredProducts.reduce((sum, p) => sum + p.count, 0)}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Məhsul Çeşidi</div>
          <div className="text-3xl font-black text-emerald-600">{filteredProducts.length}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ümumi Dəyər</div>
          <div className="text-3xl font-black text-blue-600">
            {filteredProducts.reduce((sum, p) => sum + (p.count * p.price), 0).toLocaleString()} AZN
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <input
            type="text"
            placeholder="Məhsul adı ilə axtar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div className="md:w-64">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
          >
            <option value="all">Bütün Tiplər</option>
            {types.filter(t => t !== 'all').map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5">Məhsul Adı</th>
                <th className="px-8 py-5">Tip</th>
                <th className="px-8 py-5">Stok Sayı</th>
                <th className="px-8 py-5">Vahid Qiymət</th>
                <th className="px-8 py-5 text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {productData?.items?.map((product) => (
                <tr key={product.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      {product.image && (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 p-1 shrink-0">
                          <img src={product.image} alt="" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-black text-slate-900">{product.productName}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: #W-{product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-widest w-fit">
                        {
                          getItemName(
                            categories.find(c => c.id === product.productCategoryId)
                          )
                        }
                      </span>

                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black ${product.productParametrs?.[0]?.count < 10 ? 'text-red-500' : 'text-slate-700'}`}>
                        {product.productParametrs?.[0]?.count || 0}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">ədəd</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-slate-900">{product.productParametrs?.[0]?.amount || 0} AZN</div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">

                     <button
  onClick={() => handleToggleHome(product)}
  disabled={productCount >= 12 && !product.inHomePage}
  className={`p-2 rounded-lg transition-colors ${
    product.inHomePage
      ? "bg-emerald-600 text-white"
      : "bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
  } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-100 disabled:hover:text-slate-400`}
  title={product.inHomePage ? "Ana səhifədən çıxar" : "Ana səhifədə göstər"}
>
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
</button>

                      <button
                        onClick={() => {
                          getPromotions();
                          handleEditClick(product);
                        }}
                        className="p-2 bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-colors"
                        title="Redaktə et"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>

                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {productData?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 text-xs italic">Axtarışa uyğun məhsul tapılmadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        <div className="flex justify-center items-center gap-2 mt-6 pb-8">
  <button
    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
    disabled={page === 1}
    className="
      w-10 h-10 flex items-center justify-center
      rounded-xl bg-white border border-slate-200
      text-slate-500 shadow-sm
      hover:bg-slate-50 hover:text-emerald-600
      disabled:opacity-40 disabled:cursor-not-allowed
      transition-all
    "
  >
    <ChevronLeft size={18} />
  </button>

  {getPagination(page, totalPages || 0).map(
    (item, index) => {
      if (item === "prevDots" || item === "nextDots") {
        return (
          <span
            key={index}
            className="px-2 text-slate-400 font-bold"
          >
            ...
          </span>
        );
      }

      return (
        <button
          key={item}
          onClick={() => setPage(item)}
          className={`
            w-10 h-10 rounded-xl font-bold text-sm
            transition-all duration-300
            ${
              page === item
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105"
                : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50"
            }
          `}
        >
          {item}
        </button>
      );
    }
  )}

  <button
 onClick={() =>
  setPage(prev =>
    Math.min(prev + 1, totalPages || 1)
  )
}
    disabled={page === totalPages}
    className="
      w-10 h-10 flex items-center justify-center
      rounded-xl bg-white border border-slate-200
      text-slate-500 shadow-sm
      hover:bg-slate-50 hover:text-emerald-600
      disabled:opacity-40 disabled:cursor-not-allowed
      transition-all
    "
  >
    <ChevronRight size={18} />
  </button>
</div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">
                {editingProduct ? 'Məhsulu Redaktə Et' : 'Yeni Məhsul Daxil Et'}
              </h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Məhsulun Şəkilləri</label>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center group-hover:border-emerald-500 transition-all">
                        <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Şəkilləri yüklə (Bir neçə şəkil seçə bilərsiniz)</span>
                      </div>
                    </div>
                  </div>
                  {newProduct.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {newProduct.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group">
                          <img src={img} alt={`Preview ${idx}`} className="w-full h-full" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Məhsulun Adı</label>
                  <input
                    required
                    type="text"
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                    placeholder="Məs: Huawei Inverter"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kateqoriya</label>
                    <select
                      value={newProduct.type}
                      onChange={handleCategoryChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                    >
                      <option value="" disabled>Seçin...</option>
                      {categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {getItemName(category)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alt Kateqoriya</label>
                    <select
                      value={newProduct.subCategory}
                      onChange={e => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                    >
                      <option value="" disabled>Seçin...</option>
                      {subcategories?.map((subCategory) => (
                        <option key={subCategory.id} value={subCategory.id}>
                          {getItemName(subCategory)}
                        </option>
                      ))}</select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marka</label>
                    <select
                      value={String(newProduct.brand || "")}
                      onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                    >
                      <option value="" disabled>Seçin...</option>
                      {brands?.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}</select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Texnologiyalar</label>
                    <select
                      value={newProduct.technology}
                      onChange={e => setNewProduct({ ...newProduct, technology: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                    >
                      <option value="" disabled>Seçin...</option>
                      {technologies?.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name}
                        </option>
                      ))}</select>
                  </div>


                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Texniki güc</label>
                    <input
                      type="text"
                      value={newProduct.power}
                      onChange={e =>
                        setNewProduct({
                          ...newProduct,
                          power: e.target.value === ""
                            ? ""
                            : String(e.target.value)
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all no-spinner"
                      placeholder="Məs: 5kW"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Effektivlik</label>
                    <input
                      type="number"
                      value={newProduct.efficiency}
                      onChange={e =>
                        setNewProduct({
                          ...newProduct,
                          efficiency: e.target.value === ""
                            ? ""
                            : Number(e.target.value)
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all no-spinner"
                      placeholder="Məs: 98%"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sayı</label>
                    <input
                      required
                      type="number"
                      value={newProduct.count}
                      onChange={e =>
                        setNewProduct({
                          ...newProduct,
                          count: e.target.value === ""
                            ? ""
                            : Number(e.target.value)
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all no-spinner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qiyməti (AZN)</label>
                    <input
                      required
                      type="number"
                      value={newProduct.amount}
                      onChange={e =>
                        setNewProduct({
                          ...newProduct,
                          amount: e.target.value === ""
                            ? ""
                            : Number(e.target.value)
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all no-spinner"
                    />
                  </div>
                </div>
                 
                  <div className="space-y-1.5 pt-4 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Oxşar məhsul</label>
                    <div className="space-y-4">
                      {(newProduct.variants || []).map((variant, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Variant #{idx + 1}</span>
                            <button 
                              type="button"
                              onClick={() => removeVariant(idx)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Texniki güc</label>
                              <input 
                                type="text" 
                                value={variant.power}
                                onChange={e => updateVariant(idx, 'power', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                                placeholder="Məs: 5kW"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Effektivlik</label>
                              <input 
                                type="text" 
                                value={variant.efficiency}
                                onChange={e => updateVariant(idx, 'efficiency', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                                placeholder="Məs: 98%"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Sayı</label>
                              <input 
                                type="number" 
                                value={variant.count}
                                onChange={e => updateVariant(idx, 'count', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Qiymət</label>
                              <input 
                                type="number" 
                                value={variant.price}
                                onChange={e => updateVariant(idx, 'price', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={addVariant}
                        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                        Oxşar məhsul əlavə et (+)
                      </button>
                    </div>
                  </div>
              

                <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setActiveLang(lang.code)}
                      className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeLang === lang.code ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Haqqında (mətn)</label>
                  <textarea
                    value={newProduct.description[activeLang]}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        description: {
                          ...prev.description,
                          [activeLang]: e.target.value,
                        },
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all min-h-[80px]"
                    placeholder="Məhsulun qısa təsviri"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Xüsusiyyətlər</label>
                  <textarea
                    value={newProduct.features[activeLang]}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        features: {
                          ...prev.features,
                          [activeLang]: e.target.value,
                        },
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all min-h-[120px]"
                    placeholder="Hər xüsusiyyəti yeni sətirdən daxil edin..."
                  />
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Kampaniyalar
                  </label>

                  {/* Select görünüşü */}
                  <div
                    onClick={() => setIsPromoOpen(!isPromoOpen)}
                    className="w-full min-h-[48px] bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 cursor-pointer flex items-center flex-wrap gap-2"
                  >
                    {newProduct.promotion?.length > 0 ? (
                      promotions
                        ?.filter(p => newProduct.promotion.includes(p.promotionId))
                        .map(p => (
                          <span
                            key={p.id}
                            className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs"
                          >
                            {getItemName(p)}
                          </span>
                        ))
                    ) : (
                      <span className="text-slate-400">Seçin...</span>
                    )}
                  </div>

                  {/* Dropdown */}
                  {isPromoOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {promotions?.map((promotion) => {
                        const id = Number(promotion.promotionId);
                        const selected = newProduct.promotion.includes(id);

                        return (
                          <div
                            key={promotion.promotionId}
                            onClick={() => {
                              const id = Number(promotion.promotionId);

                              setNewProduct(prev => {
                                const exists = prev.promotion.includes(id);

                                return {
                                  ...prev,
                                  promotion: exists
                                    ? prev.promotion.filter(i => i !== id)
                                    : [...prev.promotion, id],
                                };
                              });
                            }}
                            className={`px-4 py-3 cursor-pointer text-sm font-semibold transition-all hover:bg-emerald-50 ${selected
                              ? "bg-emerald-100 text-emerald-700"
                              : "text-slate-700"
                              }`}
                          >
                            {getItemName(promotion)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kampaniyalar</label>
                  <select
                   multiple
                    value={newProduct.promotion}
                    onChange={e => setNewProduct({ ...newProduct, promotion: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="" disabled>Seçin...</option>
                    {promotions?.map((promotion) => (
                      <option key={promotion.id} value={promotion.id}>
                        {getItemName(promotion)}
                      </option>
                    ))}</select>

                </div> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Datasheet</label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleDatasheetUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className={`bg-slate-50 border-2 border-dashed rounded-xl p-3 text-center transition-all ${newProduct.datasheets.length > 0 ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 group-hover:border-emerald-500'}`}>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                          {newProduct.datasheets.length > 0 ? `${newProduct.datasheets.length} Datasheet Yükləndi` : 'Datasheet Seç (Şəkil)'}
                        </span>
                      </div>
                    </div>
                    {newProduct.datasheets.length > 0 && (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {newProduct.datasheets.map((ds, idx) => (
                          <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 group">
                            <img src={ds} alt={`DS ${idx}`} className="w-full h-full object-contain bg-white" />
                            <button
                              type="button"
                              onClick={() => removeDatasheet(idx)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Sertifikat (PDF)
                    </label>

                    <div className="relative group">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleCertificateUpload(e)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />

                      <div
                        className={`bg-slate-50 border-2 border-dashed rounded-xl p-3 text-center transition-all ${newProduct.certificate
                          ? "border-emerald-500 bg-emerald-50/30"
                          : "border-slate-200 group-hover:border-emerald-500"
                          }`}
                      >
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                          {newProduct.certificate
                            ? "Sertifikat Yükləndi"
                            : "Sertifikat Seç (PDF)"}
                        </span>
                      </div>
                    </div>

                    {newProduct.certificate && (
                      <div className="mt-2">
                        <div className="relative flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2 group">
                          <div className="flex items-center gap-2 overflow-hidden">


                            <span className="text-[10px] font-bold text-slate-600 truncate max-w-[180px]">
                              {typeof newProduct.certificate === "string"
                                ? newProduct.certificate.split("/").pop()
                                : newProduct.certificate?.name}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={removeCertificate}
                            className="bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-20 p-4 bg-slate-50 rounded-2xl border border-slate-100">

                  <div className="flex items-center gap-2">
                    <input
  type="checkbox"
  id="showOnHome"
  disabled={productCount >= 12 && !newProduct.showOnHome}
  checked={newProduct.showOnHome}
  onChange={e =>
    setNewProduct({
      ...newProduct,
      showOnHome: e.target.checked,
    })
  }
  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
/><label htmlFor="showOnHome" className="text-[10px] font-black text-slate-700 uppercase tracking-widest cursor-pointer">Ana Səhifədə</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isOnOrder"
                      checked={newProduct.isOnOrder}
                      onChange={e => setNewProduct({ ...newProduct, isOnOrder: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="isOnOrder" className="text-[10px] font-black text-slate-700 uppercase tracking-widest cursor-pointer">Sifarişlə (Stokda yoxdur)</label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-grow bg-slate-100 text-slate-600 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="flex-grow bg-emerald-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-lg"
                >
                  {editingProduct ? 'Yadda Saxla' : 'Əlavə et'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWarehouse;
