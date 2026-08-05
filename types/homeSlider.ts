export interface HomeSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  mobileImage?: string;
  video?: string;
  cta?: string;
  centered: boolean;
}

export const DEFAULT_HOME_SLIDES: HomeSlide[] = [
  {
    id: 1,
    title: 'solar enerji',
    subtitle: '',
    image: '/sliderphoto.png',
    mobileImage: '/sliderphotomobile.png',
    cta: 'Ətraflı Öyrən',
    centered: true,
  },
  {
    id: 2,
    title: 'enerji qənaəti',
    subtitle: '',
    image: '/sliderphoto2.png',
    mobileImage: '/sliderphotomobile2.png',
    cta: 'Ətraflı Öyrən',
    centered: true,
  },
];

export const normalizeHomeSlides = (value: unknown): HomeSlide[] => {
  if (!Array.isArray(value)) return DEFAULT_HOME_SLIDES;

  return value.slice(0, 3).map((slide: any, index) => ({
    id: Number(slide?.id) || index + 1,
    title: String(slide?.title || `Slide ${index + 1}`),
    subtitle: String(slide?.subtitle || ''),
    image: String(slide?.image || '').trim(),
    mobileImage: String(slide?.mobileImage || '').trim() || undefined,
    video: String(slide?.video || '').trim() || undefined,
    cta: String(slide?.cta || '').trim() || undefined,
    centered: slide?.centered !== false,
  })).filter(slide => slide.image);
};
