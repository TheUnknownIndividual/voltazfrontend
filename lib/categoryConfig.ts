
export interface CategoryConfig {
  subCategories: Record<string, string[]>;
  brands: Record<string, string[]>;
  series: Record<string, string[]>;
  technologies: Record<string, string[]>;
  customAttributes?: {
    id: string;
    name: string;
    values: Record<string, string[]>;
  }[];
}

export const DEFAULT_CATEGORY_CONFIG: CategoryConfig = {
  subCategories: {
    'Günəş paneli': [
      'Monokristallik panellər',
      'Polikristallik panellər',
      'Bifacial panellər',
      'Full Black panellər',
      'Half-cut panellər',
      'Glass-Glass panellər',
      'Flexible panellər',
      'Smart / Optimized panellər'
    ],
    'İnverter': [
      'On-Grid İnverterlər',
      'Off-Grid İnverterlər',
      'Hibrid İnverterlər',
      'Mikro-inverterlər'
    ],
    'Enerji saxlama sistemləri': [
      'Litium-İon (LiFePO4)',
      'GEL',
      'High Voltaga',
      'Batareya İdarəetmə Sistemləri (BMS)'
    ],
    'Quraşdırma və montaj': [
      'Dam Tipli Konstruksiyalar',
      'Yerüstü Montaj Sistemləri',
      'İzləmə Sistemləri (Solar Trackers)',
      'Kafel və Dam Bağlayıcılar'
    ],
    'Elektrik və bağlantı': [
      'Solar Kabellər (DC)',
      'MC4 Konnektorlar və Şaxələndiricilər',
      'Mühafizə Qutuları',
      'Fuselər, Avtomatlar və SPD'
    ],
    'Monitorinq və İdarəetmə': [
      'Smart Meters',
      'Wi-Fi / Datalogger Moduls',
      'Enerji İdarəetmə Panelləri'
    ]
  },
  brands: {
    'Günəş paneli': ['Jinko', 'Trina', 'Longi', 'JA Solar', 'Canadian Solar', 'SunPower', 'REC Solar', 'Other'],
    'İnverter': ['Growatt', 'Huawei', 'Solis', 'SMA', 'Fronius', 'GoodWe', 'Other']
  },
  series: {
    'İnverter': []
  },
  technologies: {
    'Günəş paneli': ['P-Type', 'N-Type', 'PERC', 'TOPCon', 'HJT (Heterojunction)', 'IBC', 'Thin-Film (a-Si / CdTe / CIGS)']
  },
  customAttributes: []
};
