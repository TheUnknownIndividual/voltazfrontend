
export interface MultilingualText {
  az: string;
  en: string;
  ru: string;
  tr: string
}

export type Language = 'az' | 'en' | 'ru' | 'tr';

export interface AboutSection {
  id: string;
  title: MultilingualText;
  description: MultilingualText;
  images: string;
}

export interface BlogsSection {
  id: string;
  title: MultilingualText;
  description: MultilingualText;
  images: string[]; // Base64 or URLs
}

export interface ProductVariant {
  id?: number;
  modelLabel?: string;
  power?: string;
  efficiency?: string;
  technicalPower?: string;
  effectiveness?: string | number;
  count: number;
  price?: number;
  amount?: number;
  languages?: ProductVariantLanguage[];
}

export interface ProductVariantLanguage {
  languageCode: number;
  description: string;
  features: string;
}

export interface Product {
  id: string;
  name: string;
  productName?: string;
  brand: string;
  category?: string;
  subCategory?: string;
  price: number;
  image: string;
  productImage?: string[];
  images?: string[];
  power: string;
  efficiency: string;
  productParametrs?: {
    id?: number;
    modelLabel?: string;
    technicalPower?: string;
    effectiveness?: string | number;
    count?: number;
    amount?: number;
    languages?: ProductVariantLanguage[];
  }[];
  useCommonVariantContent?: boolean;
  productBrandId?: string | number;
  technology?: string;
  model?: string;
  mppt?: string;
  phaseCount?: string;
  description: string;
  stockCount?: number;
  isOnOrder?: boolean;
  inStock?: boolean;
  showOnHome?: boolean;
  features?: string[];
  specs?: string[];
  datasheet?: string;
  datasheets?: string[];
  certificate?: string;
  certificates?: string[];
  variants?: ProductVariant[];
  customSpecs?: Record<string, string>;
}

export interface Project {
  id: string;
  title: string;
  location: string;
  capacity: string;
  description: string;
  image: string;
}

export interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
}
