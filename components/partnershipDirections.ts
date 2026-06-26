export type PartnershipLang = 'az' | 'en' | 'ru' | 'tr';

export interface PartnershipDirection {
  id: string;
  label: Record<PartnershipLang, string>;
}

export const PARTNERSHIP_DIRECTIONS_STORAGE_KEY = 'volt_partnership_directions';

export const DEFAULT_PARTNERSHIP_DIRECTIONS: PartnershipDirection[] = [
  {
    id: 'technology',
    label: {
      az: 'Beynəlxalq texnologiya tərəfdaşlığı',
      en: 'International technology partnership',
      ru: 'Международное технологическое партнерство',
      tr: 'Uluslararası teknoloji ortaklığı'
    }
  },
  {
    id: 'financial',
    label: {
      az: 'Yerli maliyyə tərəfdaşlığı',
      en: 'Local financial partnership',
      ru: 'Локальное финансовое партнерство',
      tr: 'Yerel finans ortaklığı'
    }
  },
  {
    id: 'funding',
    label: {
      az: 'Beynəlxalq maliyyələşmə tərəfdaşlığı',
      en: 'International funding partnership',
      ru: 'Международное финансовое партнерство',
      tr: 'Uluslararası finansman ortaklığı'
    }
  },
  {
    id: 'media',
    label: {
      az: 'Media və proqram təminatı tərəfdaşlığı',
      en: 'Media and software partnership',
      ru: 'Партнерство в медиа и ПО',
      tr: 'Medya ve yazılım ortaklığı'
    }
  },
  {
    id: 'construction',
    label: {
      az: 'Tikinti və infrastruktur tərəfdaşlığı',
      en: 'Construction and infrastructure partnership',
      ru: 'Партнерство в строительстве и инфраструктуре',
      tr: 'İnşaat ve altyapı ortaklığı'
    }
  }
];

const isDirection = (value: unknown): value is PartnershipDirection => {
  if (!value || typeof value !== 'object') return false;
  const direction = value as PartnershipDirection;
  return Boolean(
    direction.id &&
    direction.label &&
    direction.label.az &&
    direction.label.en &&
    direction.label.ru &&
    direction.label.tr
  );
};

export const loadPartnershipDirections = (): PartnershipDirection[] => {
  const saved = localStorage.getItem(PARTNERSHIP_DIRECTIONS_STORAGE_KEY);
  if (!saved) return DEFAULT_PARTNERSHIP_DIRECTIONS;

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return DEFAULT_PARTNERSHIP_DIRECTIONS;
    const validDirections = parsed.filter(isDirection);
    return validDirections.length > 0 ? validDirections : DEFAULT_PARTNERSHIP_DIRECTIONS;
  } catch (error) {
    return DEFAULT_PARTNERSHIP_DIRECTIONS;
  }
};
