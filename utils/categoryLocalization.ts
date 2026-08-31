export type CategoryLocale = 'az' | 'en' | 'ru' | 'tr';

export const categoryLanguageCodeByLocale: Record<CategoryLocale, number> = {
  az: 1,
  en: 2,
  ru: 3,
  tr: 4,
};
type LocalizedCategoryNames = Record<CategoryLocale, string>;

interface CategoryFallback {
  seoKeys?: string[];
  aliases: string[];
  names: LocalizedCategoryNames;
}

const normalizeCategoryName = (value: unknown) => String(value || '')
  .trim()
  .toLocaleLowerCase('az')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[əışğçöü]/g, character => ({
    'ə': 'e',
    'ı': 'i',
    'ş': 's',
    'ğ': 'g',
    'ç': 'c',
    'ö': 'o',
    'ü': 'u',
  }[character] || character))
  .replace(/[^a-z0-9а-яё]+/gi, ' ')
  .trim();

const categoryFallbacks: CategoryFallback[] = [
  {
    seoKeys: ['solar-panels'],
    aliases: ['gunes panel', 'gunes paneli', 'gunes panelleri', 'solar panel', 'solar panels', 'солнечные панели'],
    names: {
      az: 'Günəş panelləri',
      en: 'Solar panels',
      ru: 'Солнечные панели',
      tr: 'Güneş panelleri',
    },
  },
  {
    seoKeys: ['inverters'],
    aliases: ['invertor', 'invertorlar', 'inverter', 'inverters', 'inverterler', 'invertorler', 'инверторы'],
    names: {
      az: 'İnvertorlar',
      en: 'Inverters',
      ru: 'Инверторы',
      tr: 'İnvertörler',
    },
  },
  {
    seoKeys: ['cables-wires'],
    aliases: ['kabel ve naqiller', 'cables and wires', 'cables wires', 'кабели и провода', 'kablolar ve iletkenler'],
    names: {
      az: 'Kabel və naqillər',
      en: 'Cables and wires',
      ru: 'Кабели и провода',
      tr: 'Kablolar ve iletkenler',
    },
  },
  {
    seoKeys: ['electrical-systems'],
    aliases: ['elektrik sistemleri', 'electrical systems', 'электрические системы'],
    names: {
      az: 'Elektrik sistemləri',
      en: 'Electrical systems',
      ru: 'Электрические системы',
      tr: 'Elektrik sistemleri',
    },
  },
  {
    seoKeys: ['photovoltaic-protection', 'pv-protection'],
    aliases: [
      'fotovoltaik sistemlerin muhafizesi',
      'photovoltaic system protection',
      'photovoltaic systems protection',
      'защита фотоэлектрических систем',
      'fotovoltaik sistem korumasi',
    ],
    names: {
      az: 'Fotovoltaik sistemlərin mühafizəsi',
      en: 'Photovoltaic system protection',
      ru: 'Защита фотоэлектрических систем',
      tr: 'Fotovoltaik sistem koruması',
    },
  },
  {
    seoKeys: ['mounting-systems'],
    aliases: ['montaj sistemleri', 'qurasdirma ve montaj', 'mounting systems', 'монтажные системы'],
    names: {
      az: 'Montaj sistemləri',
      en: 'Mounting systems',
      ru: 'Монтажные системы',
      tr: 'Montaj sistemleri',
    },
  },
];

const missingNameByType: Record<'category' | 'subcategory', LocalizedCategoryNames> = {
  category: {
    az: 'Kateqoriya',
    en: 'Category',
    ru: 'Категория',
    tr: 'Kategori',
  },
  subcategory: {
    az: 'Alt kateqoriya',
    en: 'Subcategory',
    ru: 'Подкатегория',
    tr: 'Alt kategori',
  },
};

const getLanguageName = (language: any) => String(
  language?.categoryName || language?.subCategoryName || ''
).trim();

export const getLocalizedCategoryName = (
  item: any,
  locale: CategoryLocale,
  type: 'category' | 'subcategory' = 'category'
) => {
  const languages = Array.isArray(item?.languages) ? item.languages : [];
  const selectedLanguage = languages.find(
    (language: any) => Number(language?.languageCode) === categoryLanguageCodeByLocale[locale]
  );
  const selectedName = getLanguageName(selectedLanguage);

  if (selectedName) return selectedName;

  const normalizedSeoKey = normalizeCategoryName(item?.seoKey).replace(/ /g, '-');
  const availableNames = languages.map(getLanguageName).filter(Boolean).map(normalizeCategoryName);
  const fallback = categoryFallbacks.find(candidate => (
    candidate.seoKeys?.includes(normalizedSeoKey)
    || candidate.aliases.some(alias => availableNames.includes(normalizeCategoryName(alias)))
  ));

  return fallback?.names[locale] || missingNameByType[type][locale];
};
