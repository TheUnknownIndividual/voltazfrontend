import axiosInstance from './axiosInstance';

export interface SocialPost {
  id: number;
  sourceType: 'news' | 'product';
  sourceId: number;
  platform: 'facebook' | 'instagram';
  status: 'candidate' | 'rejected' | 'dryrun' | 'publishing' | 'published' | 'failed';
  caption?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  topicKey?: string | null;
  qualityScore?: number | null;
  rejectReason?: string | null;
  permalinkUrl?: string | null;
  attempts: number;
  createdAt: string;
  postedAt?: string | null;
}

export interface SocialPostingStatus {
  enabled: boolean;
  dryRun: boolean;
  paused: boolean;
  postedToday: number;
  maxPostsPerDay: number;
  facebookConfigured: boolean;
  instagramConfigured: boolean;
  instagramTokenAgeDays?: number | null;
  instagramTokenNearExpiry: boolean;
}

const unwrap = <T>(response: { data?: { success?: boolean; data?: T } }): T => {
  if (!response.data?.success || response.data.data === undefined) {
    throw new Error('API_REQUEST_FAILED');
  }
  return response.data.data;
};

export const getSocialPostingStatus = async () =>
  unwrap<SocialPostingStatus>(await axiosInstance.get('SocialPosts/status'));

export const getSocialPosts = async (status?: string) =>
  unwrap<SocialPost[]>(await axiosInstance.get('SocialPosts', { params: { status: status || undefined, take: 100 } }));

export const setSocialPostingPaused = async (paused: boolean) =>
  unwrap<boolean>(await axiosInstance.post('SocialPosts/pause', { paused }));
