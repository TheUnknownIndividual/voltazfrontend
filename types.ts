
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
  power: string;
  efficiency: string;
  count: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category?: string;
  subCategory?: string;
  price: number;
  image: string;
  images?: string[];
  power: string;
  efficiency: string;
  technology?: string;
  model?: string;
  mppt?: string;
  phaseCount?: string;
  description: string;
  stockCount?: number;
  isOnOrder?: boolean;
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
