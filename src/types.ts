export interface Profile {
  id: string;
  username: string;
  email?: string;
  bio: string;
  avatar_url: string;
  adsense_pub_id: string;
  views_count: number;
  created_at: string;
  posts_count?: number;
  is_banned?: boolean;
  milestones?: {
    requiredPosts: number;
    currentPosts: number;
    meetsPostRequirement: boolean;
    requiredViews: number;
    currentViews: number;
    meetsViewRequirement: boolean;
    isMonetizationQualified: boolean;
    newViewCounted?: boolean;
  };
}

export interface Post {
  id: string;
  user_id: string;
  username?: string;
  user_avatar?: string;
  image_url: string;
  title: string;
  description: string;
  views_count: number;
  created_at: string;
  link_url?: string;
}

export interface AdConfig {
  username: string;
  randomNumber: number;
  threshold: number;
  activePublisherId: string;
  revenueShareSource: 'creator' | 'platform';
  creatorPubId: string | null;
  platformPubId: string;
  isMonetized: boolean;
  milestones: {
    currentPosts: number;
    requiredPosts: number;
    currentViews: number;
    requiredViews: number;
  };
}

export interface PlatformStats {
  totalUsers: string;
  totalPublications: string;
  partnersEarnings: string;
  platformName: string;
  revenueShare: {
    creator: number;
    platform: number;
  };
}
