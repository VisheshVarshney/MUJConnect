import {
  Youtube,
  Twitter,
  Facebook,
  MessageCircle,
  Share2,
  Send,
} from 'lucide-react';

export interface SocialMediaMetadata {
  platform:
    | 'youtube'
    | 'reddit'
    | 'facebook'
    | 'twitter'
    | 'discord'
    | 'telegram'
    | 'pinterest'
    | 'generic';
  title: string;
  url: string;
  icon: any;
  color: string;
  domain?: string;
}

const PLATFORM_PATTERNS = {
  youtube: {
    pattern:
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    icon: Youtube,
    color: '#FF0000',
  },
  reddit: {
    pattern:
      /(?:https?:\/\/)?(?:www\.)?reddit\.com\/r\/\w+\/comments\/[a-zA-Z0-9]+\/[^\/]+/,
    icon: Share2,
    color: '#FF4500',
  },
  facebook: {
    pattern:
      /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:.*?\/posts\/|.*?\/photos\/|.*?\/videos\/|.*?\/)(\d+)/,
    icon: Facebook,
    color: '#1877F2',
  },
  twitter: {
    pattern:
      /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/,
    icon: Twitter,
    color: '#1DA1F2',
  },
  discord: {
    pattern:
      /(?:https?:\/\/)?(?:www\.)?(?:discord\.com|discord\.gg)\/(?:channels\/\d+\/\d+|\w+)/,
    icon: MessageCircle,
    color: '#5865F2',
  },
  telegram: {
    pattern: /(?:https?:\/\/)?(?:www\.)?t\.me\/\w+/,
    icon: Send,
    color: '#0088cc',
  },
  pinterest: {
    pattern:
      /(?:https?:\/\/)?(?:www\.)?(?:pinterest\.com|in\.pinterest\.com)\/pin\/(?:[^\/]+\/)?\d+/,
    icon: Share2,
    color: '#E60023',
  },
};

export const detectSocialMediaLink = (
  url: string
): SocialMediaMetadata | null => {
  // Try recognized platforms first
  for (const [platform, config] of Object.entries(PLATFORM_PATTERNS)) {
    const match = url.match(config.pattern);
    if (match) {
      return {
        platform: platform as SocialMediaMetadata['platform'],
        title: getDefaultTitle(platform as SocialMediaMetadata['platform']),
        url: url,
        icon: config.icon,
        color: config.color,
      };
    }
  }

  // Handle generic links
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    return {
      platform: 'generic',
      title: domain,
      url: url,
      icon: Share2,
      color: '#6B7280',
      domain: domain,
    };
  } catch {
    return null;
  }
};

const getDefaultTitle = (platform: SocialMediaMetadata['platform']): string => {
  switch (platform) {
    case 'youtube':
      return 'YouTube Video';
    case 'reddit':
      return 'Reddit Post';
    case 'facebook':
      return 'Facebook Post';
    case 'twitter':
      return 'Tweet';
    case 'discord':
      return 'Discord';
    case 'telegram':
      return 'Telegram';
    case 'pinterest':
      return 'Pinterest Pin';
    default:
      return 'Link';
  }
};

export const fetchMetadata = async (
  url: string
): Promise<SocialMediaMetadata | null> => {
  const metadata = detectSocialMediaLink(url);
  if (!metadata) return null;

  try {
    if (metadata.platform === 'youtube') {
      const videoId = url.match(PLATFORM_PATTERNS.youtube.pattern)?.[1];
      if (!videoId) return null;

      // Use YouTube oEmbed API
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      const data = await response.json();
      metadata.title = data.title;
    }
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return null;
  }
};
