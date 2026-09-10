export interface SocialLinks {
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  facebook?: string;
  linkedin?: string;
  snapchat?: string;
  discord?: string;
  custom?: string;
  country?: string;
  email?: string;
}

export interface Profile {
  id: string;
  username: string;
  email?: string;
  bio: string;
  avatar_url: string;
  views_count: number;
  created_at: string;
  posts_count?: number;
  is_banned?: boolean;
  category?: string;
  social_links?: SocialLinks;
  milestones?: {
    requiredPosts: number;
    currentPosts: number;
    meetsPostRequirement: boolean;
    requiredViews: number;
    currentViews: number;
    meetsViewRequirement: boolean;
    isVerifiedCreator: boolean;
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
  upvotes?: number;
  downvotes?: number;
}

export interface PlatformStats {
  activeCreators: string;
  totalPublications: string;
  platformName: string;
}

