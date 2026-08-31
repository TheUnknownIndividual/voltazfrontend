
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { ProductVariant } from '../types';
import { DEFAULT_CATEGORY_CONFIG } from '../lib/categoryConfig';
import { useCategory } from '../contexts/CategoryContext';
import { usePromotion } from '@/contexts/PromotionContext';
import { useUpload } from "../contexts/UploadContext";
import { useProduct } from "../contexts/ProductContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  cancelProductAiImport,
  getProductAiImport,
  getProductAiSettings,
  startProductAiImport,
  uploadProductDatasheets,
  type ProductAiDraft,
  type ProductAiJob,
  type ProductDatasheetSource,
} from '../api/productAiImport';

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
type AiRequiredField = 'datasheets' | 'type' | 'subCategory' | 'brand' | 'technology' | 'count' | 'amount';

const emptyLocalizedText = () => ({ az: '', en: '', ru: '', tr: '' });

const languageRowsToText = (languages: any[] | undefined, field: 'description' | 'features') => ({
  az: languages?.find((item) => Number(item.languageCode) === 1)?.[field] || '',
  en: languages?.find((item) => Number(item.languageCode) === 2)?.[field] || '',
  ru: languages?.find((item) => Number(item.languageCode) === 3)?.[field] || '',
  tr: languages?.find((item) => Number(item.languageCode) === 4)?.[field] || '',
});

const inferDatasheetSource = (url: string): ProductDatasheetSource => {
  const cleanUrl = url.split('?')[0].toLowerCase();
  const mimeType = cleanUrl.endsWith('.pdf')
    ? 'application/pdf'
    : cleanUrl.endsWith('.png')
      ? 'image/png'
      : cleanUrl.endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';
  return { url, mimeType, sizeBytes: 1, fileName: decodeURIComponent(url.split('/').pop() || 'datasheet') };
};

type DatasheetMode = 'pdf' | 'images' | 'mixed' | null;

const getDatasheetMode = (sources: ProductDatasheetSource[] = [], urls: string[] = []): DatasheetMode => {
  const resolved = sources.length > 0 ? sources : urls.map(inferDatasheetSource);
  const hasPdf = resolved.some((item) => item.mimeType === 'application/pdf' || item.url.split('?')[0].toLowerCase().endsWith('.pdf'));
  const hasImages = resolved.some((item) => !(item.mimeType === 'application/pdf' || item.url.split('?')[0].toLowerCase().endsWith('.pdf')));
  if (hasPdf && hasImages) return 'mixed';
  if (hasPdf) return 'pdf';
  if (hasImages) return 'images';
  return null;
};

const getSelectedDatasheetMode = (files: File[]): DatasheetMode => {
  const hasPdf = files.some((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
  const hasImages = files.some((file) => !(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')));
  if (hasPdf && hasImages) return 'mixed';
  if (hasPdf) return 'pdf';
  return files.length > 0 ? 'images' : null;
};

const BACKGROUND_COLOR_DISTANCE = 46;
const BACKGROUND_EDGE_DISTANCE = 58;

const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be loaded"));
    };

    image.src = objectUrl;
  });
};

const colorDistance = (data: Uint8ClampedArray, index: number, color: [number, number, number]) => {
  const r = data[index] - color[0];
  const g = data[index + 1] - color[1];
  const b = data[index + 2] - color[2];
  return Math.sqrt(r * r + g * g + b * b);
};

const isNearWhite = (data: Uint8ClampedArray, index: number) => (
  data[index] > 242 &&
  data[index + 1] > 242 &&
  data[index + 2] > 242
);

const removePlainImageBackground = async (file: File): Promise<File> => {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  try {
    const image = await loadImageFromFile(file);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;

    if (!width || !height) {
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0);

    const imageData = context.getImageData(0, 0, width, height);
    const { data } = imageData;
    const cornerIndexes = [
      0,
      (width - 1) * 4,
      (height - 1) * width * 4,
      ((height - 1) * width + (width - 1)) * 4,
    ];

    const background = cornerIndexes.reduce<[number, number, number]>((sum, index) => {
      sum[0] += data[index];
      sum[1] += data[index + 1];
      sum[2] += data[index + 2];
      return sum;
    }, [0, 0, 0]).map(value => Math.round(value / cornerIndexes.length)) as [number, number, number];

    const cornerSpread = Math.max(...cornerIndexes.map(index => colorDistance(data, index, background)));
    const lightBackground = background.every(value => value > 210);

    if (!lightBackground && cornerSpread > BACKGROUND_COLOR_DISTANCE) {
      return file;
    }

    const visited = new Uint8Array(width * height);
    const queue: number[] = [];

    const canRemovePixel = (pixelIndex: number, tolerance = BACKGROUND_EDGE_DISTANCE) => {
      const dataIndex = pixelIndex * 4;
      return data[dataIndex + 3] < 16 ||
        isNearWhite(data, dataIndex) ||
        colorDistance(data, dataIndex, background) <= tolerance;
    };

    const enqueue = (x: number, y: number) => {
      const pixelIndex = y * width + x;
      if (visited[pixelIndex] || !canRemovePixel(pixelIndex)) {
        return;
      }

      visited[pixelIndex] = 1;
      queue.push(pixelIndex);
    };

    for (let x = 0; x < width; x++) {
      enqueue(x, 0);
      enqueue(x, height - 1);
    }

    for (let y = 1; y < height - 1; y++) {
      enqueue(0, y);
      enqueue(width - 1, y);
    }

    let removedPixels = 0;

    while (queue.length > 0) {
      const pixelIndex = queue.pop()!;
      const dataIndex = pixelIndex * 4;
      data[dataIndex + 3] = 0;
      removedPixels++;

      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);

      if (x > 0) enqueue(x - 1, y);
      if (x < width - 1) enqueue(x + 1, y);
      if (y > 0) enqueue(x, y - 1);
      if (y < height - 1) enqueue(x, y + 1);
    }

    if (removedPixels === 0) {
      return file;
    }

    context.putImageData(imageData, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    if (!blob) {
      return file;
    }

    const cleanedName = file.name.replace(/\.[^.]+$/, "") + ".png";
    return new File([blob], cleanedName, { type: "image/png", lastModified: Date.now() });
  } catch (error) {
    console.error("BACKGROUND REMOVAL ERROR:", error);
    return file;
  }
};

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
    prefetchProducts,
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
  const [stockFilter, setStockFilter] = useState<'All' | 'OutOfStock'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<WarehouseProduct | null>(null);
  const [categoryConfig, setCategoryConfig] = useState(DEFAULT_CATEGORY_CONFIG);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [contentVariantIndex, setContentVariantIndex] = useState(0);
  const [aiJob, setAiJob] = useState<ProductAiJob | null>(null);
  const [aiDraft, setAiDraft] = useState<ProductAiDraft | null>(null);
  const [isAiStarting, setIsAiStarting] = useState(false);
  const [aiInvalidFields, setAiInvalidFields] = useState<Set<AiRequiredField>>(() => new Set());
  const sessionDatasheetUploads = useRef<Set<string>>(new Set());
  const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const normalizedSearch = searchQuery.trim();
const [debouncedSearch, setDebouncedSearch] = useState(normalizedSearch);
const selectedCategoryId = typeFilter === 'all' ? undefined : Number(typeFilter);
const clearAiInvalidField = (field: AiRequiredField) => {
  setAiInvalidFields((current) => {
    if (!current.has(field)) return current;
    const next = new Set(current);
    next.delete(field);
    return next;
  });
};
const aiRequiredClass = (field: AiRequiredField) => aiInvalidFields.has(field)
  ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-100 focus:border-rose-500'
  : 'border-slate-100 focus:border-emerald-500';

  useEffect(() => {
    void getCategories({ includeAllLanguages: true });
    getProductCount();
  }, []);

useEffect(() => {
  const timer = window.setTimeout(() => {
    setDebouncedSearch(normalizedSearch);
    setPage(1);
  }, 250);

  return () => window.clearTimeout(timer);
}, [normalizedSearch]);

useEffect(() => {
  getProducts(selectedCategoryId, undefined, page, pageSize, debouncedSearch, stockFilter);
}, [page, pageSize, debouncedSearch, stockFilter, selectedCategoryId]);

useEffect(() => {
  const oppositeStock = stockFilter === 'OutOfStock' ? 'All' : 'OutOfStock';
  prefetchProducts(selectedCategoryId, undefined, page, pageSize, debouncedSearch, oppositeStock).catch(() => undefined);
}, [page, pageSize, debouncedSearch, stockFilter, selectedCategoryId]);

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

const getProductCountValue = (product: any) =>
  Number(product?.productParametrs?.reduce((sum: number, item: any) => sum + Number(item?.count || 0), 0) || 0);

const getProductValue = (product: any) =>
  Number(product?.productParametrs?.reduce((sum: number, item: any) => sum + Number(item?.count || 0) * Number(item?.amount || 0), 0) || 0);



  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;

    setAiInvalidFields((current) => {
      const next = new Set(current);
      next.delete('type');
      return next;
    });

    setNewProduct({
      ...newProduct,
      type: categoryId,
      subCategory: "",
      brand: "",
      technology: "",
    });

    try {
      await getSubCategories(categoryId, { includeAllLanguages: true });
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
    modelLabel: '',
    parametrId: null as number | null,
    useCommonVariantContent: false,
    variantDescription: emptyLocalizedText(),
    variantFeatures: emptyLocalizedText(),
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
    datasheetSources: [] as ProductDatasheetSource[],
    certificate: '',
    certificates: '',
    showOnHome: false,
    isOnOrder: false,
    status: 'in_warehouse' as 'on_site' | 'in_warehouse',
    variants: [] as Array<ProductVariant & {
      modelLabel?: string;
      description?: ReturnType<typeof emptyLocalizedText>;
      features?: ReturnType<typeof emptyLocalizedText>;
    }>
  };

  const [newProduct, setNewProduct] = useState<any>(initialNewProduct);
  const datasheetMode = getDatasheetMode(newProduct.datasheetSources || [], newProduct.datasheets || []);
  const datasheetAccept = datasheetMode === 'pdf'
    ? '.pdf,application/pdf'
    : datasheetMode === 'images'
      ? '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'
      : '.pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp';

  // Load from localStorage
  const [products, setProducts] = useState<WarehouseProduct[]>([]);


  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const toParametrLanguages = (description: Record<LangCode, string>, features: Record<LangCode, string>) =>
        newProduct.useCommonVariantContent
          ? []
          : LANGUAGES.map((lang) => ({
              languageCode: languageMap[lang.code],
              description: description?.[lang.code] || '',
              features: features?.[lang.code] || '',
            }));
      const payload = {
        productName: newProduct.name,
        productCategoryId: Number(newProduct.type),
        productSubCategoryId: Number(newProduct.subCategory),
        productBrandId: Number(newProduct.brand),
        productTechnologyId: Number(newProduct.technology),

        inStock: newProduct.isOnOrder,
        inHomePage: newProduct.showOnHome,
        useCommonVariantContent: Boolean(newProduct.useCommonVariantContent),

        certificate: newProduct.certificate,

        productImage: newProduct.images,
        productDatasheet: newProduct.datasheets,

        productParametrs: [
          {
            ...(newProduct.parametrId ? { id: Number(newProduct.parametrId) } : {}),
            modelLabel: newProduct.modelLabel || null,
            technicalPower: newProduct.power || '',
            effectiveness: Number(newProduct.efficiency) || 0,
            count: Number(newProduct.count) || 0,
            amount: Number(newProduct.amount) || 0,
            languages: toParametrLanguages(newProduct.variantDescription, newProduct.variantFeatures),
          },
           ...newProduct.variants.map((variant) => ({
    ...(variant.id ? { id: Number(variant.id) } : {}),
    modelLabel: variant.modelLabel || null,
    technicalPower: variant.power || "",
    effectiveness: Number(variant.efficiency) || 0,
    count: Number(variant.count) || 0,
    amount: Number(variant.price) || 0,
    languages: toParametrLanguages(variant.description || emptyLocalizedText(), variant.features || emptyLocalizedText()),
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

      await getProducts(selectedCategoryId, undefined, page, pageSize, debouncedSearch, stockFilter);
      await getProductCount();

      setShowAddModal(false);
      setNewProduct(initialNewProduct);
      setEditingProduct(null);
      setContentVariantIndex(0);
      setAiInvalidFields(new Set());
      sessionDatasheetUploads.current.clear();


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
        modelLabel: data.productParametrs?.[0]?.modelLabel || '',
        parametrId: data.productParametrs?.[0]?.id || null,
        useCommonVariantContent: data.useCommonVariantContent ?? true,
        variantDescription: languageRowsToText(data.productParametrs?.[0]?.languages, 'description'),
        variantFeatures: languageRowsToText(data.productParametrs?.[0]?.languages, 'features'),

        count: data.productParametrs?.[0]?.count || 0,
        amount: data.productParametrs?.[0]?.amount || 0,
  
   
          variants: (data.productParametrs || [])
    .slice(1)
    .map((p) => ({
      id: p.id,
      modelLabel: p.modelLabel || '',
      power: p.technicalPower || "",
      efficiency: p.effectiveness || 0,
      count: p.count || 0,
      price: p.amount || 0,
      description: languageRowsToText(p.languages, 'description'),
      features: languageRowsToText(p.languages, 'features'),
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
        datasheetSources: (data.productDatasheet || []).map(inferDatasheetSource),

        certificate: data.certificate || "",

        showOnSite: data.showOnSite || false,
        showOnHome: data.inHomePage || false,
        isOnOrder: data.inStock || false,

        status: data.showOnSite
          ? "on_site"
          : "in_warehouse",


        customSpecs: {},
      });
      setContentVariantIndex(0);
      sessionDatasheetUploads.current.clear();

      await getSubCategories(data.productCategoryId, { includeAllLanguages: true });
      await getBrands(data.productCategoryId);
      await getTechnology(data.productCategoryId);

      setShowAddModal(true);

    } catch (err) {
      console.error(err);
      showNotification("Məhsul məlumatı alınmadı", "error");
    }
  };

  const handleCloseModal = async () => {
    const unsavedUrls = Array.from(sessionDatasheetUploads.current);
    await Promise.allSettled(unsavedUrls.map((url) => deleteImage(url)));
    sessionDatasheetUploads.current.clear();
    if (aiJob && (aiJob.status === 'queued' || aiJob.status === 'processing' || aiJob.status === 'review_ready')) {
      await cancelProductAiImport(aiJob.id).catch(() => undefined);
    }
    setAiJob(null);
    setAiDraft(null);
    setAiInvalidFields(new Set());
    setShowAddModal(false);
    setEditingProduct(null);
    setNewProduct(initialNewProduct);
    setContentVariantIndex(0);
  };


const handleDelete = async (id: number | string) => {
  if (!(await confirm("Bu məhsulu silmək istədiyinizə əminsiniz?"))) return;

  try {
    await deleteProduct(id); // 👈 backend delete

    showNotification("Məhsul silindi", "success");

    // list refresh
   await getProducts(selectedCategoryId, undefined, page, pageSize, debouncedSearch, stockFilter);
   await getProductCount();

  } catch (error) {
    console.error("DELETE ERROR:", error);
    showNotification("Məhsul silinmədi", "error");
  }
};




const handleToggleHome = async (product: any) => {
  try {
    await showProductOnHome(product.id, !product.inHomePage);
    await getProducts(selectedCategoryId, undefined, page, pageSize, debouncedSearch, stockFilter);
    await getProductCount();
  } catch (err) {
    console.error(err);
  }
};


  const types = useMemo(() => {
    return ['all', ...categories.map((category: any) => String(category.id))];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return Array.isArray(productData?.items) ? productData.items : [];
  }, [productData?.items]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const cleanedFile = await removePlainImageBackground(file);
        const url = await uploadImage(cleanedFile); // 👈 backend upload
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
      const selectedFiles = Array.from(files);
      const selectedMode = getSelectedDatasheetMode(selectedFiles);
      if (selectedMode === 'mixed' || datasheetMode === 'mixed' || (datasheetMode && selectedMode && datasheetMode !== selectedMode)) {
        showNotification('Datasheet üçün PDF və şəkilləri birlikdə istifadə etmək olmaz. Formatı dəyişmək üçün mövcud faylları silin.', 'error');
        return;
      }
      if (newProduct.datasheets.length + selectedFiles.length > 10) {
        showNotification('Ən çox 10 datasheet faylı yükləmək olar.', 'error');
        return;
      }
      const existingKnownBytes = (newProduct.datasheetSources || [])
        .reduce((total: number, item: ProductDatasheetSource) => total + Math.max(0, Number(item.sizeBytes) || 0), 0);
      const selectedBytes = selectedFiles.reduce((total, file) => total + file.size, 0);
      if (existingKnownBytes + selectedBytes > 50 * 1024 * 1024) {
        showNotification('Datasheet fayllarının ümumi ölçüsü 50 MB-dan çox ola bilməz.', 'error');
        return;
      }
      const uploaded = await uploadProductDatasheets(selectedFiles);
      uploaded.forEach((item) => sessionDatasheetUploads.current.add(item.url));

      setNewProduct(prev => ({
        ...prev,
        datasheets: [...prev.datasheets, ...uploaded.map((item) => item.url)],
        datasheetSources: [...(prev.datasheetSources || []), ...uploaded],
      }));
      setAiInvalidFields((current) => {
        const next = new Set(current);
        next.delete('datasheets');
        return next;
      });

      showNotification('Datasheet faylları yükləndi', 'success');

    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      showNotification('Datasheet yüklənmədi. PDF/JPEG/PNG/WebP və 50 MB ümumi limiti yoxlayın.', 'error');
    } finally {
      e.target.value = '';
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

      if (sessionDatasheetUploads.current.has(datasheetUrl)) {
        await deleteImage(datasheetUrl);
        sessionDatasheetUploads.current.delete(datasheetUrl);
      }

      setNewProduct(prev => ({
        ...prev,
        datasheets: prev.datasheets.filter((_, i) => i !== index),
        datasheetSources: (prev.datasheetSources || []).filter((item) => item.url !== datasheetUrl),
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
        modelLabel: "",
        power: "",
        efficiency: "",
        count: 0,
        price: 0,
        description: emptyLocalizedText(),
        features: emptyLocalizedText(),
      },
    ],
  }));
};

const removeVariant = (index: number) => {
  setNewProduct((prev) => ({
    ...prev,
    variants: prev.variants.filter((_, i) => i !== index),
  }));
  setContentVariantIndex((current) => Math.min(current, Math.max(0, newProduct.variants.length - 1)));
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

const selectedVariantContent = contentVariantIndex === 0
  ? {
      description: newProduct.variantDescription || emptyLocalizedText(),
      features: newProduct.variantFeatures || emptyLocalizedText(),
    }
  : {
      description: newProduct.variants?.[contentVariantIndex - 1]?.description || emptyLocalizedText(),
      features: newProduct.variants?.[contentVariantIndex - 1]?.features || emptyLocalizedText(),
    };

const updateSelectedVariantContent = (field: 'description' | 'features', value: string) => {
  setNewProduct((prev) => {
    if (contentVariantIndex === 0) {
      const target = field === 'description' ? 'variantDescription' : 'variantFeatures';
      return { ...prev, [target]: { ...(prev[target] || emptyLocalizedText()), [activeLang]: value } };
    }
    return {
      ...prev,
      variants: prev.variants.map((variant, index) => index === contentVariantIndex - 1
        ? { ...variant, [field]: { ...(variant[field] || emptyLocalizedText()), [activeLang]: value } }
        : variant),
    };
  });
};

useEffect(() => {
  if (!aiJob || (aiJob.status !== 'queued' && aiJob.status !== 'processing')) return;
  let cancelled = false;
  let timer: number | undefined;
  const poll = async () => {
    try {
      const next = await getProductAiImport(aiJob.id);
      if (cancelled) return;
      setAiJob(next);
      if (next.status === 'review_ready' && next.draft) {
        setAiDraft(next.draft);
        await getTechnology(Number(newProduct.type)).catch(() => undefined);
        return;
      }
      if (next.status === 'failed') showNotification(next.errorMessage || 'AI datasheet emalı uğursuz oldu.', 'error');
      if (next.status === 'queued' || next.status === 'processing') {
        timer = window.setTimeout(poll, 2500);
      }
    } catch {
      if (!cancelled) timer = window.setTimeout(poll, 4000);
    }
  };
  timer = window.setTimeout(poll, 1200);
  return () => {
    cancelled = true;
    if (timer !== undefined) window.clearTimeout(timer);
  };
}, [aiJob?.id]);

const startAiExtraction = async () => {
  const missing = new Set<AiRequiredField>();
  if (!newProduct.datasheets?.length) missing.add('datasheets');
  if (!newProduct.type) missing.add('type');
  if (!newProduct.subCategory) missing.add('subCategory');
  if (!newProduct.brand) missing.add('brand');
  if (newProduct.count === '') missing.add('count');
  if (newProduct.amount === '') missing.add('amount');
  setAiInvalidFields(missing);
  if (missing.size > 0) {
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[data-ai-required="invalid"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return;
  }

  setIsAiStarting(true);
  try {
    const settings = await getProductAiSettings();
    if (!settings.enabled) {
      showNotification('AI import serverdə konfiqurasiya edilməyib.', 'warning');
      return;
    }
    const knownSources = (newProduct.datasheetSources || []) as ProductDatasheetSource[];
    const sources = newProduct.datasheets.map((url: string) =>
      knownSources.find((item) => item.url === url) || inferDatasheetSource(url));
    const job = await startProductAiImport({
      ...(editingProduct?.id ? { productId: Number(editingProduct.id) } : {}),
      productCategoryId: Number(newProduct.type),
      productSubCategoryId: Number(newProduct.subCategory),
      productBrandId: Number(newProduct.brand),
      ...(newProduct.technology ? { productTechnologyId: Number(newProduct.technology) } : {}),
      defaultCount: Number(newProduct.count),
      defaultAmount: Number(newProduct.amount),
      sources,
    });
    setAiDraft(null);
    setAiJob(job);
  } catch (error) {
    console.error('PRODUCT AI START ERROR:', error);
    showNotification('AI datasheet emalı başladılmadı.', 'error');
  } finally {
    setIsAiStarting(false);
  }
};

const closeAiImport = async () => {
  if (aiJob) await cancelProductAiImport(aiJob.id).catch(() => undefined);
  setAiJob(null);
  setAiDraft(null);
};

const updateAiVariant = (index: number, patch: Partial<ProductAiDraft['variants'][number]>) => {
  setAiDraft((current) => current ? {
    ...current,
    variants: current.variants.map((variant, itemIndex) => itemIndex === index ? { ...variant, ...patch } : variant),
  } : current);
};

const updateAiVariantLanguage = (variantIndex: number, languageCode: number, field: 'description' | 'features', value: string) => {
  setAiDraft((current) => current ? {
    ...current,
    variants: current.variants.map((variant, itemIndex) => itemIndex === variantIndex ? {
      ...variant,
      languages: variant.languages.map((language) => language.languageCode === languageCode
        ? { ...language, [field]: value }
        : language),
    } : variant),
  } : current);
};

const applyAiDraft = async () => {
  if (!aiDraft || !aiDraft.variants.length) return;
  if (aiDraft.variants.some((variant) => !variant.commercialValuesConfirmed)) {
    showNotification('Bütün modellər üçün stok və qiymət təsdiqlənməlidir.', 'warning');
    return;
  }
  const localized = (variant: ProductAiDraft['variants'][number], field: 'description' | 'features') => ({
    az: variant.languages.find((item) => item.languageCode === 1)?.[field] || '',
    en: variant.languages.find((item) => item.languageCode === 2)?.[field] || '',
    ru: variant.languages.find((item) => item.languageCode === 3)?.[field] || '',
    tr: variant.languages.find((item) => item.languageCode === 4)?.[field] || '',
  });
  const [base, ...rest] = aiDraft.variants;
  const baseDescription = localized(base, 'description');
  const baseFeatures = localized(base, 'features');
  await getTechnology(Number(newProduct.type)).catch(() => undefined);
  setNewProduct((prev) => ({
    ...prev,
    name: aiDraft.productName || prev.name,
    technology: String(aiDraft.productTechnologyId || prev.technology),
    useCommonVariantContent: false,
    modelLabel: base.modelLabel,
    parametrId: null,
    power: base.technicalPower,
    efficiency: base.effectiveness ?? 0,
    count: base.count,
    amount: base.amount,
    description: baseDescription,
    features: baseFeatures,
    variantDescription: baseDescription,
    variantFeatures: baseFeatures,
    variants: rest.map((variant) => ({
      modelLabel: variant.modelLabel,
      power: variant.technicalPower,
      efficiency: variant.effectiveness ?? 0,
      count: variant.count,
      price: variant.amount,
      description: localized(variant, 'description'),
      features: localized(variant, 'features'),
    })),
  }));
  setContentVariantIndex(0);
  setAiJob(null);
  setAiDraft(null);
  showNotification(
    aiDraft.productTechnologyCreated
      ? `“${aiDraft.productTechnologyName}” texnologiyası yaradıldı və AI draft formaya tətbiq edildi.`
      : 'AI draft formaya tətbiq edildi. Yadda saxlamadan əvvəl yoxlayın.',
    'success',
  );
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
            type="button"
            onClick={() => {
              setStockFilter((current) => current === 'OutOfStock' ? 'All' : 'OutOfStock');
              setPage(1);
            }}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
              stockFilter === 'OutOfStock'
                ? 'bg-red-600 text-white hover:bg-slate-900'
                : 'bg-white text-red-600 border border-red-100 hover:bg-red-50'
            }`}
          >
            Stokda olmayanlar
          </button>
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
          <div className="text-3xl font-black text-slate-900">{filteredProducts.reduce((sum, p) => sum + getProductCountValue(p), 0)}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Məhsul Çeşidi</div>
          <div className="text-3xl font-black text-emerald-600">{filteredProducts.length}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ümumi Dəyər</div>
          <div className="text-3xl font-black text-blue-600">
            {filteredProducts.reduce((sum, p) => sum + getProductValue(p), 0).toLocaleString()} AZN
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div className="md:w-64">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="admin-product-select w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
          >
            <option value="all">Bütün Tiplər</option>
            {types.filter(t => t !== 'all').map(t => (
              <option key={t} value={t}>{getItemName(categories.find((category: any) => String(category.id) === t)) || t}</option>
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
              {loading && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 text-xs font-black uppercase tracking-widest">Yüklənir...</td>
                </tr>
              )}
              {!loading && filteredProducts.map((product) => (
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
              {!loading && filteredProducts.length === 0 && (
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
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div
            className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
            onMouseDown={(event) => event.stopPropagation()}
          >
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
                      data-ai-required={aiInvalidFields.has('type') ? 'invalid' : undefined}
                      aria-invalid={aiInvalidFields.has('type')}
                      className={`admin-product-select w-full border bg-slate-50 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none transition-all ${aiRequiredClass('type')}`}
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
                      onChange={e => { setNewProduct({ ...newProduct, subCategory: e.target.value }); clearAiInvalidField('subCategory'); }}
                      data-ai-required={aiInvalidFields.has('subCategory') ? 'invalid' : undefined}
                      aria-invalid={aiInvalidFields.has('subCategory')}
                      className={`admin-product-select w-full border bg-slate-50 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none transition-all ${aiRequiredClass('subCategory')}`}
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
                      onChange={e => { setNewProduct({ ...newProduct, brand: e.target.value }); clearAiInvalidField('brand'); }}
                      data-ai-required={aiInvalidFields.has('brand') ? 'invalid' : undefined}
                      aria-invalid={aiInvalidFields.has('brand')}
                      className={`admin-product-select w-full border bg-slate-50 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none transition-all ${aiRequiredClass('brand')}`}
                    >
                      <option value="" disabled>Seçin...</option>
                      {brands?.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}</select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Texnologiyalar <span className="normal-case text-indigo-500">· AI özü tapa bilər</span></label>
                    <select
                      value={newProduct.technology}
                      onChange={e => { setNewProduct({ ...newProduct, technology: e.target.value }); clearAiInvalidField('technology'); }}
                      data-ai-required={aiInvalidFields.has('technology') ? 'invalid' : undefined}
                      aria-invalid={aiInvalidFields.has('technology')}
                      className={`admin-product-select w-full border bg-slate-50 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none transition-all ${aiRequiredClass('technology')}`}
                    >
                      <option value="">AI tapsın və ya seçin...</option>
                      {technologies?.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name}
                        </option>
                      ))}</select>
                  </div>


                </div>


                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Əsas model adı / kodu</label>
                  <input
                    type="text"
                    value={newProduct.modelLabel || ''}
                    onChange={(event) => setNewProduct({ ...newProduct, modelLabel: event.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                    placeholder="Məs: LR5-72HTH-590M"
                  />
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
                      onChange={e => {
                        setNewProduct({
                          ...newProduct,
                          count: e.target.value === ""
                            ? ""
                            : Number(e.target.value)
                        });
                        clearAiInvalidField('count');
                      }}
                      data-ai-required={aiInvalidFields.has('count') ? 'invalid' : undefined}
                      aria-invalid={aiInvalidFields.has('count')}
                      className={`w-full bg-slate-50 border rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none transition-all no-spinner ${aiRequiredClass('count')}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qiyməti (AZN)</label>
                    <input
                      required
                      type="number"
                      value={newProduct.amount}
                      onChange={e => {
                        setNewProduct({
                          ...newProduct,
                          amount: e.target.value === ""
                            ? ""
                            : Number(e.target.value)
                        });
                        clearAiInvalidField('amount');
                      }}
                      data-ai-required={aiInvalidFields.has('amount') ? 'invalid' : undefined}
                      aria-invalid={aiInvalidFields.has('amount')}
                      className={`w-full bg-slate-50 border rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none transition-all no-spinner ${aiRequiredClass('amount')}`}
                    />
                  </div>
                </div>
                 
                  <div className="space-y-1.5 pt-4 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Model variantləri</label>
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
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Model adı / kodu</label>
                            <input
                              type="text"
                              value={variant.modelLabel || ''}
                              onChange={(event) => updateVariant(idx, 'modelLabel', event.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                              placeholder="Məs: LR5-72HTH-595M"
                            />
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
                        Model variantı əlavə et (+)
                      </button>
                    </div>
                  </div>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs font-black text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(newProduct.useCommonVariantContent)}
                    onChange={(event) => {
                      setNewProduct({ ...newProduct, useCommonVariantContent: event.target.checked });
                      setContentVariantIndex(0);
                    }}
                    className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Bütün modellər üçün ümumi mətn istifadə et
                </label>

                {!newProduct.useCommonVariantContent && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mətni redaktə edilən model</label>
                    <select
                      value={contentVariantIndex}
                      onChange={(event) => setContentVariantIndex(Number(event.target.value))}
                      className="admin-product-select w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                    >
                      <option value={0}>{newProduct.modelLabel || newProduct.power || 'Əsas model'}</option>
                      {(newProduct.variants || []).map((variant, index) => (
                        <option key={index} value={index + 1}>{variant.modelLabel || variant.power || `Variant #${index + 1}`}</option>
                      ))}
                    </select>
                  </div>
                )}

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
                    value={newProduct.useCommonVariantContent ? newProduct.description[activeLang] : selectedVariantContent.description[activeLang]}
                    onChange={(e) => newProduct.useCommonVariantContent
                      ? setNewProduct((prev) => ({ ...prev, description: { ...prev.description, [activeLang]: e.target.value } }))
                      : updateSelectedVariantContent('description', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all min-h-[80px]"
                    placeholder="Məhsulun qısa təsviri"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Xüsusiyyətlər</label>
                  <textarea
                    value={newProduct.useCommonVariantContent ? newProduct.features[activeLang] : selectedVariantContent.features[activeLang]}
                    onChange={(e) => newProduct.useCommonVariantContent
                      ? setNewProduct((prev) => ({ ...prev, features: { ...prev.features, [activeLang]: e.target.value } }))
                      : updateSelectedVariantContent('features', e.target.value)}
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
                        accept={datasheetAccept}
                        multiple
                        onChange={handleDatasheetUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div
                        data-ai-required={aiInvalidFields.has('datasheets') ? 'invalid' : undefined}
                        aria-invalid={aiInvalidFields.has('datasheets')}
                        className={`bg-slate-50 border-2 border-dashed rounded-xl p-3 text-center transition-all ${
                          aiInvalidFields.has('datasheets')
                            ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-100'
                            : newProduct.datasheets.length > 0
                              ? 'border-emerald-500 bg-emerald-50/30'
                              : 'border-slate-200 group-hover:border-emerald-500'
                        }`}
                      >
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                          {newProduct.datasheets.length > 0
                            ? `${newProduct.datasheets.length} Datasheet Yükləndi`
                            : 'Datasheet seç (yalnız PDF və ya yalnız şəkil)'}
                        </span>
                      </div>
                    </div>
                    {datasheetMode === 'pdf' && <p className="px-1 text-[10px] font-semibold text-slate-500">PDF seçilib — şəkil əlavə etmək üçün bütün PDF-ləri silin.</p>}
                    {datasheetMode === 'images' && <p className="px-1 text-[10px] font-semibold text-slate-500">Şəkillər seçilib — PDF əlavə etmək üçün bütün şəkilləri silin.</p>}
                    {datasheetMode === 'mixed' && <p className="px-1 text-[10px] font-semibold text-rose-600">Bu köhnə datasheet siyahısı qarışıq formatdadır. Yeni fayl əlavə etməzdən əvvəl tək format saxlayın.</p>}
                    {newProduct.datasheets.length > 0 && (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {newProduct.datasheets.map((ds, idx) => {
                          const isPdf = ds.split('?')[0].toLowerCase().endsWith('.pdf');
                          return (
                          <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 group bg-white">
                            {isPdf ? (
                              <a href={ds} target="_blank" rel="noopener noreferrer" className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center text-[9px] font-black uppercase text-red-600">
                                <span className="text-3xl">PDF</span>
                                <span className="max-w-full truncate">{decodeURIComponent(ds.split('/').pop() || 'Datasheet')}</span>
                              </a>
                            ) : (
                              <img src={ds} alt={`DS ${idx}`} className="w-full h-full object-contain bg-white" />
                            )}
                            <button
                              type="button"
                              onClick={() => removeDatasheet(idx)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                          );
                        })}
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

                <button
                  type="button"
                  onClick={startAiExtraction}
                  disabled={isAiStarting}
                  className="w-full rounded-2xl bg-indigo-600 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {isAiStarting ? 'AI hazırlanır…' : 'AI ilə datasheet-dən doldur'}
                </button>

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
                    <label htmlFor="isOnOrder" className="text-[10px] font-black text-slate-700 uppercase tracking-widest cursor-pointer">Stokda var</label>
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
      {aiJob && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => { if (event.target === event.currentTarget) void closeAiImport(); }}
        >
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl md:p-8"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">AI datasheet importu</h3>
                <p className="mt-1 text-xs text-slate-500">Nəticə yalnız formaya tətbiq edilir. Bazaya yazmaq üçün ayrıca “Yadda saxla” düyməsini basın.</p>
              </div>
              <button type="button" onClick={() => void closeAiImport()} className="rounded-full p-2 text-xl text-slate-400 hover:bg-slate-100">×</button>
            </div>

            {(aiJob.status === 'queued' || aiJob.status === 'processing') && (
              <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-center">
                <div className="h-11 w-11 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
                <div>
                  <div className="font-black text-slate-800">{aiJob.status === 'queued' ? 'Növbədədir…' : 'PDF və şəkillər emal edilir…'}</div>
                  <div className="mt-1 text-xs text-slate-500">Status avtomatik yenilənir. Emal 3 dəqiqədən çox çəkərsə təhlükəsiz dayandırılıb retry göstəriləcək.</div>
                </div>
                <button type="button" onClick={() => void closeAiImport()} className="rounded-xl bg-slate-100 px-5 py-3 text-xs font-black text-slate-600">Ləğv et</button>
              </div>
            )}

            {aiJob.status === 'review_ready' && aiDraft && (
              <div className="space-y-6">
                <label className="block text-xs font-black text-slate-700">
                  Məhsul ailəsinin adı
                  <input
                    value={aiDraft.productName}
                    onChange={(event) => setAiDraft({ ...aiDraft, productName: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  />
                </label>
                <div className={`rounded-2xl border p-4 text-xs ${aiDraft.productTechnologyCreated ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-indigo-100 bg-indigo-50 text-indigo-800'}`}>
                  <span className="font-black">Texnologiya:</span> {aiDraft.productTechnologyName}
                  {aiDraft.productTechnologyCreated && <span className="ml-2 rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-black text-white">Yeni yaradıldı</span>}
                </div>
                {aiDraft.warnings.length > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                    <div className="mb-2 font-black">Yoxlanmalı qeydlər</div>
                    <ul className="list-disc space-y-1 pl-5">{aiDraft.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => setActiveLang(language.code)}
                      className={`rounded-xl px-4 py-2 text-xs font-black ${activeLang === language.code ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {language.name}
                    </button>
                  ))}
                </div>
                <div className="space-y-4">
                  {aiDraft.variants.map((variant, index) => {
                    const languageCode = languageMap[activeLang];
                    const language = variant.languages.find((item) => item.languageCode === languageCode);
                    return (
                      <div key={index} className="rounded-2xl border border-slate-200 p-5">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <div className="text-xs font-black uppercase tracking-widest text-slate-400">Model #{index + 1}</div>
                          <label className="flex items-center gap-2 text-xs font-black text-emerald-700">
                            <input
                              type="checkbox"
                              checked={variant.commercialValuesConfirmed}
                              onChange={(event) => updateAiVariant(index, { commercialValuesConfirmed: event.target.checked })}
                            />
                            Stok və qiymət yoxlanılıb
                          </label>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                          <label className="text-[11px] font-black text-slate-600 sm:col-span-2">
                            Model
                            <input value={variant.modelLabel} onChange={(event) => updateAiVariant(index, { modelLabel: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900" placeholder="Məsələn, MID 13KTL3-X" />
                          </label>
                          <label className="text-[11px] font-black text-slate-600">
                            Texniki güc
                            <input value={variant.technicalPower} onChange={(event) => updateAiVariant(index, { technicalPower: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900" placeholder="13kW" />
                          </label>
                          <label className="text-[11px] font-black text-slate-600">
                            Effektivlik (%)
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={variant.effectiveness ?? ''}
                              onChange={(event) => updateAiVariant(index, { effectiveness: event.target.value === '' ? null : Number(event.target.value) })}
                              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900"
                              placeholder="98.75"
                            />
                          </label>
                          <label className="text-[11px] font-black text-slate-600">
                            Stok sayı
                            <input type="number" min="0" value={variant.count} onChange={(event) => updateAiVariant(index, { count: Number(event.target.value) })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900" />
                          </label>
                          <label className="text-[11px] font-black text-slate-600">
                            Qiymət (AZN)
                            <input type="number" min="0" step="0.01" value={variant.amount} onChange={(event) => updateAiVariant(index, { amount: Number(event.target.value) })} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900" />
                          </label>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <label className="text-[11px] font-black text-slate-600">
                            Haqqında ({activeLang.toUpperCase()})
                            <textarea value={language?.description || ''} onChange={(event) => updateAiVariantLanguage(index, languageCode, 'description', event.target.value)} className="mt-1.5 min-h-32 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium leading-5 text-slate-900" placeholder="Məhsul haqqında qısa və axtarış üçün uyğun mətn" />
                          </label>
                          <label className="text-[11px] font-black text-slate-600">
                            Xüsusiyyətlər ({activeLang.toUpperCase()})
                            <textarea value={language?.features || ''} onChange={(event) => updateAiVariantLanguage(index, languageCode, 'features', event.target.value)} className="mt-1.5 min-h-32 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium leading-5 text-slate-900" placeholder="Əsas texniki göstəricilər və modellər" />
                          </label>
                        </div>
                        {variant.evidence.length > 0 && <p className="mt-3 text-[10px] text-slate-400">Mənbə sübutu: {variant.evidence.join(' · ')}</p>}
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <button type="button" onClick={() => void closeAiImport()} className="rounded-xl bg-slate-100 px-5 py-3 text-xs font-black text-slate-600">Draftı sil</button>
                  <button type="button" onClick={() => void applyAiDraft()} className="rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black text-white">Formaya tətbiq et</button>
                </div>
              </div>
            )}

            {(aiJob.status === 'failed' || aiJob.status === 'expired' || aiJob.status === 'cancelled') && (
              <div className="rounded-2xl bg-rose-50 p-6 text-center">
                <div className="font-black text-rose-700">AI import tamamlanmadı</div>
                <p className="mt-2 text-xs text-rose-600">{aiJob.errorMessage || 'Job ləğv edilib və ya draftın müddəti bitib.'}</p>
                <div className="mt-4 flex justify-center gap-3">
                  <button type="button" onClick={() => void closeAiImport()} className="rounded-xl bg-white px-5 py-3 text-xs font-black text-slate-600">Bağla</button>
                  <button type="button" onClick={async () => { await closeAiImport(); await startAiExtraction(); }} className="rounded-xl bg-indigo-600 px-5 py-3 text-xs font-black text-white">Yenidən yoxla</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWarehouse;
