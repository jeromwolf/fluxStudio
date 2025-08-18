'use client';

export interface UIControl {
  id: string;
  type: 'text' | 'color' | 'number' | 'select' | 'toggle' | 'file' | 'slider' | 'colorScheme' | 'multiSelect' | 'checkbox';
  label: string;
  description?: string;
  placeholder?: string;
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
  accept?: string; // for file input
  multiple?: boolean;
  category?: 'text' | 'colors' | 'options' | 'media';
}

export interface UISection {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  controls: UIControl[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface TemplateUISchema {
  templateId: string;
  layout: 'default' | 'wizard' | 'advanced';
  sections: UISection[];
  previewMode: 'realtime' | 'manual';
  validation?: {
    required?: string[];
    custom?: Array<{
      field: string;
      validate: (value: any) => boolean;
      message: string;
    }>;
  };
}

// Color scheme presets
const colorSchemePresets = [
  { value: 'professional', label: 'Professional' },
  { value: 'vibrant', label: 'Vibrant' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'playful', label: 'Playful' },
  { value: 'tech', label: 'Tech' },
  { value: 'warm', label: 'Warm' },
  { value: 'cool', label: 'Cool' },
  { value: 'monochrome', label: 'Monochrome' },
];

// Template-specific UI schemas
export const templateUISchemas: Record<string, TemplateUISchema> = {
  'corporate-logo-intro': {
    templateId: 'corporate-logo-intro',
    layout: 'default',
    previewMode: 'realtime',
    sections: [
      {
        id: 'branding',
        title: 'Company Branding',
        icon: '🏢',
        controls: [
          {
            id: 'title',
            type: 'text',
            label: 'Company Name',
            placeholder: 'Enter your company name',
            category: 'text',
          },
          {
            id: 'subtitle',
            type: 'text',
            label: 'Tagline',
            placeholder: 'Your company tagline',
            category: 'text',
          },
          {
            id: 'company',
            type: 'text',
            label: 'Establishment',
            placeholder: 'Est. 2024',
            category: 'text',
          },
          {
            id: 'logo',
            type: 'file',
            label: 'Company Logo',
            accept: 'image/*',
            category: 'media',
          },
        ],
      },
      {
        id: 'visual',
        title: 'Visual Style',
        icon: '🎨',
        controls: [
          {
            id: 'colorScheme',
            type: 'colorScheme',
            label: 'Color Scheme',
            options: colorSchemePresets,
            category: 'colors',
          },
          {
            id: 'primary',
            type: 'color',
            label: 'Primary Color',
            category: 'colors',
          },
          {
            id: 'secondary',
            type: 'color',
            label: 'Secondary Color',
            category: 'colors',
          },
          {
            id: 'style',
            type: 'select',
            label: 'Animation Style',
            options: [
              { value: 'professional', label: 'Professional' },
              { value: 'dynamic', label: 'Dynamic' },
              { value: 'minimal', label: 'Minimal' },
              { value: 'tech', label: 'Tech' },
            ],
            category: 'options',
          },
        ],
      },
      {
        id: 'animation',
        title: 'Animation Settings',
        icon: '⚡',
        controls: [
          {
            id: 'speed',
            type: 'slider',
            label: 'Animation Speed',
            min: 0.5,
            max: 2,
            step: 0.1,
            defaultValue: 1,
            category: 'options',
          },
          {
            id: 'rotationStyle',
            type: 'select',
            label: 'Rotation Style',
            options: [
              { value: 'smooth', label: 'Smooth' },
              { value: 'bounce', label: 'Bounce' },
              { value: 'elastic', label: 'Elastic' },
            ],
            category: 'options',
          },
        ],
      },
    ],
  },

  'instagram-story': {
    templateId: 'instagram-story',
    layout: 'default',
    previewMode: 'realtime',
    sections: [
      {
        id: 'content',
        title: 'Story Content',
        icon: '📱',
        controls: [
          {
            id: 'title',
            type: 'text',
            label: 'Main Text',
            placeholder: 'Swipe Up!',
            category: 'text',
          },
          {
            id: 'subtitle',
            type: 'text',
            label: 'Call to Action',
            placeholder: 'New Content Alert',
            category: 'text',
          },
          {
            id: 'company',
            type: 'text',
            label: 'Username',
            placeholder: '@yourusername',
            category: 'text',
          },
        ],
      },
      {
        id: 'style',
        title: 'Instagram Style',
        icon: '🌈',
        controls: [
          {
            id: 'gradient',
            type: 'select',
            label: 'Gradient Style',
            options: [
              { value: 'instagram', label: 'Instagram Classic' },
              { value: 'sunset', label: 'Sunset' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'neon', label: 'Neon' },
              { value: 'custom', label: 'Custom' },
            ],
            category: 'colors',
          },
          {
            id: 'stickers',
            type: 'toggle',
            label: 'Add Stickers',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'floatingSpeed',
            type: 'slider',
            label: 'Floating Speed',
            min: 0.5,
            max: 3,
            step: 0.1,
            defaultValue: 1.5,
            category: 'options',
          },
        ],
      },
    ],
  },

  'wedding-invitation': {
    templateId: 'wedding-invitation',
    layout: 'wizard',
    previewMode: 'manual',
    sections: [
      {
        id: 'couple',
        title: 'Couple Information',
        icon: '💑',
        controls: [
          {
            id: 'brideName',
            type: 'text',
            label: 'Bride\'s Name',
            placeholder: 'Sarah',
            category: 'text',
          },
          {
            id: 'groomName',
            type: 'text',
            label: 'Groom\'s Name',
            placeholder: 'John',
            category: 'text',
          },
          {
            id: 'title',
            type: 'text',
            label: 'Title Text',
            defaultValue: 'Are Getting Married',
            category: 'text',
          },
          {
            id: 'couplePhoto',
            type: 'file',
            label: 'Couple Photo (Optional)',
            accept: 'image/*',
            category: 'media',
          },
        ],
      },
      {
        id: 'event',
        title: 'Wedding Details',
        icon: '📅',
        controls: [
          {
            id: 'subtitle',
            type: 'text',
            label: 'Wedding Date',
            placeholder: 'June 15, 2025',
            category: 'text',
          },
          {
            id: 'company',
            type: 'text',
            label: 'Venue',
            placeholder: 'Grand Ballroom',
            category: 'text',
          },
          {
            id: 'time',
            type: 'text',
            label: 'Time',
            placeholder: '6:00 PM',
            category: 'text',
          },
        ],
      },
      {
        id: 'theme',
        title: 'Wedding Theme',
        icon: '🌸',
        controls: [
          {
            id: 'weddingTheme',
            type: 'select',
            label: 'Theme Style',
            options: [
              { value: 'romantic', label: 'Romantic Rose' },
              { value: 'elegant', label: 'Elegant Gold' },
              { value: 'vintage', label: 'Vintage Charm' },
              { value: 'garden', label: 'Garden Party' },
              { value: 'beach', label: 'Beach Wedding' },
            ],
            category: 'options',
          },
          {
            id: 'particleType',
            type: 'select',
            label: 'Particle Effect',
            options: [
              { value: 'rose-petals', label: 'Rose Petals' },
              { value: 'hearts', label: 'Hearts' },
              { value: 'sparkles', label: 'Sparkles' },
              { value: 'confetti', label: 'Confetti' },
            ],
            defaultValue: 'rose-petals',
            category: 'options',
          },
          {
            id: 'speed',
            type: 'slider',
            label: 'Animation Elegance',
            min: 0.3,
            max: 1,
            step: 0.1,
            defaultValue: 0.7,
            category: 'options',
          },
        ],
      },
    ],
    validation: {
      required: ['brideName', 'groomName', 'subtitle'],
    },
  },

  'youtube-intro': {
    templateId: 'youtube-intro',
    layout: 'default',
    previewMode: 'realtime',
    sections: [
      {
        id: 'channel',
        title: 'Channel Info',
        icon: '▶️',
        controls: [
          {
            id: 'title',
            type: 'text',
            label: 'Channel Name',
            placeholder: 'Your Channel Name',
            category: 'text',
          },
          {
            id: 'subtitle',
            type: 'text',
            label: 'Subscribe Message',
            placeholder: 'Subscribe for More!',
            category: 'text',
          },
          {
            id: 'company',
            type: 'text',
            label: 'Upload Schedule',
            placeholder: 'New Videos Every Week',
            category: 'text',
          },
        ],
      },
      {
        id: 'youtube',
        title: 'YouTube Elements',
        icon: '🔔',
        controls: [
          {
            id: 'subscribeButton',
            type: 'toggle',
            label: 'Show Subscribe Button',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'bellAnimation',
            type: 'toggle',
            label: 'Bell Notification Effect',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'youtubeStyle',
            type: 'select',
            label: 'Intro Style',
            options: [
              { value: 'dynamic', label: 'Dynamic' },
              { value: 'minimal', label: 'Minimal' },
              { value: 'gaming', label: 'Gaming' },
              { value: 'vlog', label: 'Vlog' },
              { value: 'tech', label: 'Tech' },
            ],
            category: 'options',
          },
        ],
      },
    ],
  },

  'product-showcase': {
    templateId: 'product-showcase',
    layout: 'advanced',
    previewMode: 'manual',
    sections: [
      {
        id: 'product',
        title: 'Product Information',
        icon: '📦',
        controls: [
          {
            id: 'title',
            type: 'text',
            label: 'Product Name',
            placeholder: 'Amazing Product',
            category: 'text',
          },
          {
            id: 'subtitle',
            type: 'text',
            label: 'Product Tagline',
            placeholder: 'Experience Innovation',
            category: 'text',
          },
          {
            id: 'company',
            type: 'text',
            label: 'Price/Availability',
            placeholder: '$99 - Available Now',
            category: 'text',
          },
          {
            id: 'productImage',
            type: 'file',
            label: 'Product Image (Optional)',
            accept: 'image/*',
            category: 'media',
          },
        ],
      },
      {
        id: 'showcase',
        title: 'Showcase Settings',
        icon: '💎',
        controls: [
          {
            id: 'rotation',
            type: 'select',
            label: 'Rotation Style',
            options: [
              { value: 'turntable', label: 'Turntable' },
              { value: 'floating', label: 'Floating' },
              { value: 'spotlight', label: 'Spotlight' },
              { value: 'dramatic', label: 'Dramatic' },
            ],
            defaultValue: 'turntable',
            category: 'options',
          },
          {
            id: 'lighting',
            type: 'select',
            label: 'Lighting Setup',
            options: [
              { value: 'studio', label: 'Studio' },
              { value: 'dramatic', label: 'Dramatic' },
              { value: 'soft', label: 'Soft' },
              { value: 'neon', label: 'Neon' },
            ],
            defaultValue: 'studio',
            category: 'options',
          },
          {
            id: 'speed',
            type: 'slider',
            label: 'Rotation Speed',
            min: 0.3,
            max: 2,
            step: 0.1,
            defaultValue: 0.8,
            category: 'options',
          },
          {
            id: 'reflections',
            type: 'toggle',
            label: 'Show Reflections',
            defaultValue: true,
            category: 'options',
          },
        ],
      },
    ],
  },

  'tiktok-effect': {
    templateId: 'tiktok-effect',
    layout: 'default',
    previewMode: 'realtime',
    sections: [
      {
        id: 'viral',
        title: 'Viral Content',
        icon: '🎵',
        controls: [
          {
            id: 'title',
            type: 'text',
            label: 'Hook Text',
            placeholder: 'Wait for it...',
            category: 'text',
          },
          {
            id: 'subtitle',
            type: 'text',
            label: 'Reveal Text',
            placeholder: 'Mind = Blown',
            category: 'text',
          },
          {
            id: 'company',
            type: 'text',
            label: 'Hashtags',
            placeholder: '#ForYou #Viral',
            category: 'text',
          },
        ],
      },
      {
        id: 'effects',
        title: 'TikTok Effects',
        icon: '✨',
        controls: [
          {
            id: 'glitch',
            type: 'toggle',
            label: 'Glitch Effect',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'neon',
            type: 'toggle',
            label: 'Neon Glow',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'trendStyle',
            type: 'select',
            label: 'Trend Style',
            options: [
              { value: 'trendy', label: 'Current Trend' },
              { value: 'aesthetic', label: 'Aesthetic' },
              { value: 'gaming', label: 'Gaming' },
              { value: 'comedy', label: 'Comedy' },
            ],
            defaultValue: 'trendy',
            category: 'options',
          },
          {
            id: 'speed',
            type: 'slider',
            label: 'Effect Speed',
            min: 1,
            max: 3,
            step: 0.1,
            defaultValue: 2,
            category: 'options',
          },
        ],
      },
    ],
  },

  'birthday-celebration': {
    templateId: 'birthday-celebration',
    layout: 'default',
    previewMode: 'realtime',
    sections: [
      {
        id: 'birthday',
        title: 'Birthday Details',
        icon: '🎂',
        controls: [
          {
            id: 'title',
            type: 'text',
            label: 'Birthday Message',
            placeholder: 'Happy Birthday!',
            category: 'text',
          },
          {
            id: 'subtitle',
            type: 'text',
            label: 'Name',
            placeholder: 'Sarah',
            category: 'text',
          },
          {
            id: 'company',
            type: 'text',
            label: 'Age/Message',
            placeholder: 'Sweet 16',
            category: 'text',
          },
        ],
      },
      {
        id: 'party',
        title: 'Party Settings',
        icon: '🎉',
        controls: [
          {
            id: 'balloons',
            type: 'toggle',
            label: 'Floating Balloons',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'confetti',
            type: 'toggle',
            label: 'Confetti Rain',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'cake',
            type: 'toggle',
            label: 'Birthday Cake',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'partyTheme',
            type: 'select',
            label: 'Party Theme',
            options: [
              { value: 'festive', label: 'Festive' },
              { value: 'elegant', label: 'Elegant' },
              { value: 'kids', label: 'Kids Party' },
              { value: 'surprise', label: 'Surprise' },
            ],
            defaultValue: 'festive',
            category: 'options',
          },
        ],
      },
    ],
  },

  'sale-notice': {
    templateId: 'sale-notice',
    layout: 'default',
    previewMode: 'realtime',
    sections: [
      {
        id: 'offer',
        title: 'Sale Information',
        icon: '🏷️',
        controls: [
          {
            id: 'title',
            type: 'text',
            label: 'Discount',
            placeholder: '50% OFF',
            category: 'text',
          },
          {
            id: 'subtitle',
            type: 'text',
            label: 'Sale Duration',
            placeholder: 'Limited Time Only',
            category: 'text',
          },
          {
            id: 'company',
            type: 'text',
            label: 'Call to Action',
            placeholder: 'Shop Now',
            category: 'text',
          },
        ],
      },
      {
        id: 'urgency',
        title: 'Urgency Settings',
        icon: '⏰',
        controls: [
          {
            id: 'explosion',
            type: 'toggle',
            label: 'Explosion Effect',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'countdown',
            type: 'toggle',
            label: 'Countdown Timer',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'priceReveal',
            type: 'toggle',
            label: 'Price Reveal Animation',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'urgencyLevel',
            type: 'select',
            label: 'Urgency Level',
            options: [
              { value: 'explosive', label: 'Explosive' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'exciting', label: 'Exciting' },
              { value: 'calm', label: 'Calm' },
            ],
            defaultValue: 'explosive',
            category: 'options',
          },
        ],
      },
    ],
  },

  'year-end-greeting': {
    templateId: 'year-end-greeting',
    layout: 'default',
    previewMode: 'realtime',
    sections: [
      {
        id: 'message',
        title: 'Year-End Message',
        icon: '🎊',
        controls: [
          {
            id: 'title',
            type: 'text',
            label: 'Main Message',
            placeholder: 'Thank You for a Great Year',
            category: 'text',
          },
          {
            id: 'subtitle',
            type: 'text',
            label: 'New Year Wishes',
            placeholder: 'Wishing You Success in 2025',
            category: 'text',
          },
          {
            id: 'company',
            type: 'text',
            label: 'Company Name',
            placeholder: 'Your Company',
            category: 'text',
          },
        ],
      },
      {
        id: 'celebration',
        title: 'Celebration Effects',
        icon: '🎆',
        controls: [
          {
            id: 'particles',
            type: 'select',
            label: 'Particle Type',
            options: [
              { value: 'fireworks', label: 'Fireworks' },
              { value: 'stars', label: 'Stars' },
              { value: 'confetti', label: 'Confetti' },
              { value: 'sparkles', label: 'Sparkles' },
            ],
            defaultValue: 'fireworks',
            category: 'options',
          },
          {
            id: 'colorTheme',
            type: 'select',
            label: 'Color Theme',
            options: [
              { value: 'gold-silver', label: 'Gold & Silver' },
              { value: 'festive', label: 'Festive Colors' },
              { value: 'corporate', label: 'Corporate' },
              { value: 'elegant', label: 'Elegant' },
            ],
            defaultValue: 'gold-silver',
            category: 'options',
          },
        ],
      },
    ],
  },

  'new-year-greeting': {
    templateId: 'new-year-greeting',
    layout: 'default',
    previewMode: 'realtime',
    sections: [
      {
        id: 'newyear',
        title: 'New Year Message',
        icon: '🎇',
        controls: [
          {
            id: 'title',
            type: 'text',
            label: 'New Year Greeting',
            placeholder: 'Happy New Year 2025',
            category: 'text',
          },
          {
            id: 'subtitle',
            type: 'text',
            label: 'Wishes',
            placeholder: 'New Dreams, New Adventures',
            category: 'text',
          },
          {
            id: 'company',
            type: 'text',
            label: 'From',
            placeholder: 'Best Wishes from [Name]',
            category: 'text',
          },
        ],
      },
      {
        id: 'countdown',
        title: 'Countdown & Effects',
        icon: '⏱️',
        controls: [
          {
            id: 'fireworks',
            type: 'toggle',
            label: 'Fireworks Display',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'countdown',
            type: 'toggle',
            label: 'Countdown Animation',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'champagne',
            type: 'toggle',
            label: 'Champagne Effect',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'celebrationIntensity',
            type: 'slider',
            label: 'Celebration Intensity',
            min: 0.5,
            max: 2,
            step: 0.1,
            defaultValue: 1,
            category: 'options',
          },
        ],
      },
    ],
  },

  'interactive-globe': {
    templateId: 'interactive-globe',
    layout: 'advanced',
    previewMode: 'realtime',
    sections: [
      {
        id: 'globe',
        title: 'Globe Settings',
        icon: '🌍',
        controls: [
          {
            id: 'title',
            type: 'text',
            label: 'Network Title',
            placeholder: 'Global Network',
            category: 'text',
          },
          {
            id: 'subtitle',
            type: 'text',
            label: 'Connection Message',
            placeholder: 'Connected Worldwide',
            category: 'text',
          },
          {
            id: 'company',
            type: 'text',
            label: 'Data Source',
            placeholder: 'Live Data Feed',
            category: 'text',
          },
        ],
      },
      {
        id: 'visualization',
        title: 'Data Visualization',
        icon: '📊',
        controls: [
          {
            id: 'satellites',
            type: 'slider',
            label: 'Number of Satellites',
            min: 1,
            max: 6,
            step: 1,
            defaultValue: 3,
            category: 'options',
          },
          {
            id: 'dataFlowIntensity',
            type: 'slider',
            label: 'Data Flow Intensity',
            min: 0.3,
            max: 2.0,
            step: 0.1,
            defaultValue: 1.0,
            category: 'options',
          },
          {
            id: 'connectionStyle',
            type: 'select',
            label: 'Connection Style',
            options: [
              { value: 'arcs', label: 'Curved Arcs' },
              { value: 'direct', label: 'Direct Lines' },
              { value: 'pulse', label: 'Pulsing Beams' },
              { value: 'data-stream', label: 'Data Streams' },
            ],
            defaultValue: 'arcs',
            category: 'options',
          },
          {
            id: 'globeStyle',
            type: 'select',
            label: 'Globe Appearance',
            options: [
              { value: 'realistic', label: 'Realistic Earth' },
              { value: 'wireframe', label: 'Wireframe' },
              { value: 'holographic', label: 'Holographic' },
              { value: 'neon', label: 'Neon Grid' },
            ],
            defaultValue: 'realistic',
            category: 'options',
          },
        ],
      },
      {
        id: 'effects',
        title: 'Visual Effects',
        icon: '✨',
        controls: [
          {
            id: 'atmosphere',
            type: 'toggle',
            label: 'Atmospheric Glow',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'rotation',
            type: 'toggle',
            label: 'Globe Rotation',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'particleField',
            type: 'toggle',
            label: 'Particle Field',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'speed',
            type: 'slider',
            label: 'Animation Speed',
            min: 0.3,
            max: 2.0,
            step: 0.1,
            defaultValue: 1.0,
            category: 'options',
          },
        ],
      },
      {
        id: 'colors',
        title: 'Color Scheme',
        icon: '🎨',
        controls: [
          {
            id: 'globeTheme',
            type: 'select',
            label: 'Globe Theme',
            options: [
              { value: 'earth', label: 'Earth (Blue/Green)' },
              { value: 'cyber', label: 'Cyber (Blue/Cyan)' },
              { value: 'plasma', label: 'Plasma (Purple/Pink)' },
              { value: 'fire', label: 'Fire (Red/Orange)' },
              { value: 'ice', label: 'Ice (Light Blue/White)' },
            ],
            defaultValue: 'cyber',
            category: 'colors',
          },
          {
            id: 'primary',
            type: 'color',
            label: 'Primary Color',
            category: 'colors',
          },
          {
            id: 'secondary',
            type: 'color',
            label: 'Secondary Color', 
            category: 'colors',
          },
          {
            id: 'accent',
            type: 'color',
            label: 'Connection Color',
            category: 'colors',
          },
        ],
      },
    ],
  },

  'matrix-digital-rain': {
    templateId: 'matrix-digital-rain',
    layout: 'default',
    previewMode: 'realtime',
    sections: [
      {
        id: 'characters',
        title: '문자 설정',
        icon: '🔤',
        description: '매트릭스 레인에 사용할 문자를 선택하세요',
        controls: [
          {
            id: 'characterSet',
            type: 'multiSelect',
            label: '문자 세트',
            defaultValue: ['katakana', 'numbers', 'matrix'],
            options: [
              { value: 'korean', label: '한글' },
              { value: 'japanese', label: '히라가나' },
              { value: 'katakana', label: '카타카나' },
              { value: 'latin', label: '영문' },
              { value: 'numbers', label: '숫자' },
              { value: 'symbols', label: '기호' },
              { value: 'matrix', label: '바이너리 (0,1)' }
            ],
            category: 'options',
          },
        ],
      },
      {
        id: 'appearance',
        title: '시각 효과',
        icon: '🎨',
        controls: [
          {
            id: 'colorScheme',
            type: 'select',
            label: '색상 테마',
            defaultValue: 'classic',
            options: [
              { value: 'classic', label: '클래식 (초록색)' },
              { value: 'red', label: '레드 매트릭스' },
              { value: 'blue', label: '블루 매트릭스' },
              { value: 'purple', label: '퍼플 매트릭스' },
              { value: 'golden', label: '골든 매트릭스' },
              { value: 'custom', label: '커스텀' }
            ],
            category: 'options',
          },
          {
            id: 'primaryColor',
            type: 'color',
            label: '메인 색상',
            defaultValue: '#00ff00',
            category: 'options',
          },
          {
            id: 'secondaryColor',
            type: 'color',
            label: '보조 색상',
            defaultValue: '#00cc00',
            category: 'options',
          },
          {
            id: 'glitchIntensity',
            type: 'slider',
            label: '글리치 강도',
            min: 0,
            max: 1,
            step: 0.1,
            defaultValue: 0.1,
            category: 'options',
          },
        ],
      },
      {
        id: 'animation',
        title: '애니메이션',
        icon: '⚡',
        controls: [
          {
            id: 'speed',
            type: 'slider',
            label: '떨어지는 속도',
            min: 0.2,
            max: 2,
            step: 0.1,
            defaultValue: 0.7,
            category: 'options',
          },
          {
            id: 'density',
            type: 'slider',
            label: '문자 밀도',
            min: 0.5,
            max: 2,
            step: 0.1,
            defaultValue: 1,
            category: 'options',
          },
          {
            id: 'trailLength',
            type: 'slider',
            label: '트레일 길이',
            min: 5,
            max: 30,
            step: 1,
            defaultValue: 15,
            category: 'options',
          },
          {
            id: 'depth',
            type: 'toggle',
            label: '3D 깊이감',
            defaultValue: true,
            category: 'options',
          },
        ],
      },
    ],
  },

  'liquid-flow-transitions': {
    templateId: 'liquid-flow-transitions',
    layout: 'default',
    previewMode: 'realtime',
    sections: [
      {
        id: 'style',
        title: '액체 스타일',
        icon: '💧',
        description: '트랜지션 효과의 액체 유형을 선택하세요',
        controls: [
          {
            id: 'style',
            type: 'select',
            label: '스타일',
            options: [
              { value: 'water', label: '맑은 물 💧' },
              { value: 'paint', label: '페인트 🎨' },
              { value: 'ink', label: '잉크 🖋️' },
              { value: 'oil', label: '오일 🛢️' },
              { value: 'lava', label: '용암 🌋' },
              { value: 'honey', label: '꿀 🍯' },
              { value: 'milk', label: '우유 🥛' },
              { value: 'metal', label: '액체 금속 🔧' },
              { value: 'plasma', label: '플라즈마 ⚡' },
              { value: 'magic', label: '마법 ✨' },
            ],
            defaultValue: 'water',
            category: 'options',
          },
        ],
      },
      {
        id: 'colors',
        title: '색상 설정',
        icon: '🎨',
        controls: [
          {
            id: 'colorA',
            type: 'color',
            label: '시작 색상',
            defaultValue: '#007AFF',
            category: 'options',
          },
          {
            id: 'colorB',
            type: 'color',
            label: '종료 색상',
            defaultValue: '#5856D6',
            category: 'options',
          },
          {
            id: 'glowIntensity',
            type: 'slider',
            label: '글로우 강도',
            min: 0,
            max: 1,
            step: 0.1,
            defaultValue: 0.5,
            category: 'options',
          },
        ],
      },
      {
        id: 'physics',
        title: '물리 속성',
        icon: '⚗️',
        controls: [
          {
            id: 'viscosity',
            type: 'slider',
            label: '점성',
            description: '액체의 끈적임 정도',
            min: 0,
            max: 1,
            step: 0.1,
            defaultValue: 0.5,
            category: 'options',
          },
          {
            id: 'turbulence',
            type: 'slider',
            label: '난류',
            description: '액체의 불규칙한 움직임',
            min: 0,
            max: 1,
            step: 0.1,
            defaultValue: 0.3,
            category: 'options',
          },
        ],
      },
      {
        id: 'animation',
        title: '애니메이션',
        icon: '🎬',
        controls: [
          {
            id: 'direction',
            type: 'select',
            label: '방향',
            options: [
              { value: 'left-to-right', label: '왼쪽에서 오른쪽 →' },
              { value: 'right-to-left', label: '오른쪽에서 왼쪽 ←' },
              { value: 'top-to-bottom', label: '위에서 아래 ↓' },
              { value: 'bottom-to-top', label: '아래에서 위 ↑' },
              { value: 'center-out', label: '중앙에서 바깥 ⟲' },
              { value: 'random', label: '랜덤 🎲' },
            ],
            defaultValue: 'left-to-right',
            category: 'options',
          },
          {
            id: 'duration',
            type: 'slider',
            label: '지속 시간',
            min: 1,
            max: 10,
            step: 0.5,
            defaultValue: 3,
            category: 'options',
          },
        ],
      },
    ],
  },

  'dna-helix-data': {
    templateId: 'dna-helix-data',
    layout: 'advanced',
    previewMode: 'realtime',
    sections: [
      {
        id: 'genetic',
        title: 'Genetic Structure',
        icon: '🧬',
        controls: [
          {
            id: 'title',
            type: 'text',
            label: 'Analysis Title',
            placeholder: 'Genetic Data Analysis',
            category: 'text',
          },
          {
            id: 'subtitle',
            type: 'text',
            label: 'Sequence Type',
            placeholder: 'DNA Sequence Visualization',
            category: 'text',
          },
          {
            id: 'company',
            type: 'text',
            label: 'Research Source',
            placeholder: 'Biotech Research Lab',
            category: 'text',
          },
        ],
      },
      {
        id: 'helix',
        title: 'DNA Helix Parameters',
        icon: '🔬',
        controls: [
          {
            id: 'helixTurns',
            type: 'slider',
            label: 'Helix Turns',
            min: 1,
            max: 5,
            step: 0.5,
            defaultValue: 3,
            description: 'Number of complete DNA turns',
            category: 'options',
          },
          {
            id: 'basePairs',
            type: 'slider',
            label: 'Base Pairs',
            min: 50,
            max: 200,
            step: 10,
            defaultValue: 120,
            description: 'Number of nucleotide base pairs',
            category: 'options',
          },
          {
            id: 'helixRadius',
            type: 'slider',
            label: 'Helix Radius',
            min: 1,
            max: 4,
            step: 0.1,
            defaultValue: 2,
            description: 'Radius of the DNA double helix',
            category: 'options',
          },
          {
            id: 'rotationSpeed',
            type: 'slider',
            label: 'Rotation Speed',
            min: 0.1,
            max: 3,
            step: 0.1,
            defaultValue: 1,
            category: 'options',
          },
        ],
      },
      {
        id: 'visualization',
        title: 'Data Visualization',
        icon: '📊',
        controls: [
          {
            id: 'dataParticles',
            type: 'slider',
            label: 'Data Particle Count',
            min: 100,
            max: 500,
            step: 50,
            defaultValue: 300,
            category: 'options',
          },
          {
            id: 'particleFlow',
            type: 'select',
            label: 'Particle Flow Pattern',
            options: [
              { value: 'spiral', label: 'Spiral Motion' },
              { value: 'orbital', label: 'Orbital Rings' },
              { value: 'stream', label: 'Data Streams' },
              { value: 'random', label: 'Random Float' },
            ],
            defaultValue: 'spiral',
            category: 'options',
          },
          {
            id: 'hologramPanels',
            type: 'toggle',
            label: 'Holographic Panels',
            defaultValue: false,
            description: 'Show floating data analysis panels',
            category: 'options',
          },
          {
            id: 'sequenceDisplay',
            type: 'select',
            label: 'Base Sequence Display',
            options: [
              { value: 'color-coded', label: 'Color Coded (A-T-G-C)' },
              { value: 'uniform', label: 'Uniform Color' },
              { value: 'gradient', label: 'Gradient Flow' },
              { value: 'pulsing', label: 'Pulsing Sequence' },
            ],
            defaultValue: 'color-coded',
            category: 'options',
          },
        ],
      },
      {
        id: 'effects',
        title: 'Visual Effects',
        icon: '✨',
        controls: [
          {
            id: 'glowIntensity',
            type: 'slider',
            label: 'Glow Intensity',
            min: 0,
            max: 2,
            step: 0.1,
            defaultValue: 1,
            category: 'options',
          },
          {
            id: 'particleTrails',
            type: 'toggle',
            label: 'Particle Trails',
            defaultValue: false,
            description: 'Add motion trails to particles',
            category: 'options',
          },
          {
            id: 'dynamicLighting',
            type: 'toggle',
            label: 'Dynamic Lighting',
            defaultValue: true,
            description: 'Animated lighting that follows DNA structure',
            category: 'options',
          },
          {
            id: 'backgroundField',
            type: 'select',
            label: 'Background Field',
            options: [
              { value: 'none', label: 'Clean Background' },
              { value: 'grid', label: 'Scientific Grid' },
              { value: 'particles', label: 'Particle Field' },
              { value: 'nebula', label: 'Space Nebula' },
            ],
            defaultValue: 'particles',
            category: 'options',
          },
        ],
      },
      {
        id: 'colors',
        title: 'Genetic Color Scheme',
        icon: '🎨',
        controls: [
          {
            id: 'dnaColorScheme',
            type: 'select',
            label: 'DNA Color Scheme',
            options: [
              { value: 'classic', label: 'Classic (Cyan/Magenta)' },
              { value: 'nature', label: 'Nature (Green/Blue)' },
              { value: 'medical', label: 'Medical (Blue/Red)' },
              { value: 'neon', label: 'Neon (Pink/Cyan)' },
              { value: 'sunset', label: 'Sunset (Orange/Purple)' },
              { value: 'custom', label: 'Custom Colors' },
            ],
            defaultValue: 'classic',
            category: 'colors',
          },
          {
            id: 'primary',
            type: 'color',
            label: 'Primary Backbone',
            description: 'Color for first DNA strand',
            category: 'colors',
          },
          {
            id: 'secondary',
            type: 'color',
            label: 'Secondary Backbone',
            description: 'Color for second DNA strand',
            category: 'colors',
          },
          {
            id: 'accent',
            type: 'color',
            label: 'Connection Lines',
            description: 'Color for base pair connections',
            category: 'colors',
          },
        ],
      },
    ],
  },

  // Add default schema for templates without specific UI
  default: {
    templateId: 'default',
    layout: 'default',
    previewMode: 'realtime',
    sections: [
      {
        id: 'text',
        title: 'Text Content',
        icon: '📝',
        controls: [
          {
            id: 'title',
            type: 'text',
            label: 'Title',
            category: 'text',
          },
          {
            id: 'subtitle',
            type: 'text',
            label: 'Subtitle',
            category: 'text',
          },
          {
            id: 'company',
            type: 'text',
            label: 'Additional Text',
            category: 'text',
          },
        ],
      },
      {
        id: 'colors',
        title: 'Colors',
        icon: '🎨',
        controls: [
          {
            id: 'primary',
            type: 'color',
            label: 'Primary Color',
            category: 'colors',
          },
          {
            id: 'secondary',
            type: 'color',
            label: 'Secondary Color',
            category: 'colors',
          },
          {
            id: 'accent',
            type: 'color',
            label: 'Accent Color',
            category: 'colors',
          },
        ],
      },
      {
        id: 'options',
        title: 'Animation Options',
        icon: '⚙️',
        controls: [
          {
            id: 'speed',
            type: 'slider',
            label: 'Animation Speed',
            min: 0.5,
            max: 2,
            step: 0.1,
            defaultValue: 1,
            category: 'options',
          },
        ],
      },
    ],
  },

  'particle-universe': {
    templateId: 'particle-universe',
    layout: 'default',
    previewMode: 'realtime',
    sections: [
      {
        id: 'particles',
        title: '파티클 설정',
        icon: '✨',
        description: '파티클의 개수와 타입을 설정합니다',
        controls: [
          {
            id: 'particleCount',
            type: 'slider',
            label: '파티클 개수',
            min: 500,
            max: 10000,
            step: 100,
            defaultValue: 3000,
            category: 'options',
          },
          {
            id: 'particleType',
            type: 'multiSelect',
            label: '파티클 타입',
            defaultValue: ['star', 'planet'],
            options: [
              { value: 'star', label: '별' },
              { value: 'planet', label: '행성' },
              { value: 'asteroid', label: '소행성' },
              { value: 'comet', label: '혜성' },
              { value: 'nebula', label: '성운' }
            ],
            category: 'options',
          },
          {
            id: 'particleSize',
            type: 'slider',
            label: '파티클 크기',
            min: 0.5,
            max: 3,
            step: 0.1,
            defaultValue: 1,
            category: 'options',
          },
        ],
      },
      {
        id: 'physics',
        title: '물리 시뮬레이션',
        icon: '🌀',
        controls: [
          {
            id: 'gravityMode',
            type: 'select',
            label: '중력 모드',
            defaultValue: 'galaxy',
            options: [
              { value: 'galaxy', label: '나선 은하' },
              { value: 'solar', label: '태양계' },
              { value: 'cluster', label: '구상 성단' },
              { value: 'random', label: '랜덤' },
              { value: 'blackhole', label: '블랙홀' }
            ],
            category: 'options',
          },
          {
            id: 'gravityStrength',
            type: 'slider',
            label: '중력 강도',
            min: 0.1,
            max: 3,
            step: 0.1,
            defaultValue: 1,
            category: 'options',
          },
          {
            id: 'rotationSpeed',
            type: 'slider',
            label: '회전 속도',
            min: 0,
            max: 5,
            step: 0.1,
            defaultValue: 1,
            category: 'options',
          },
          {
            id: 'autoRotate',
            type: 'toggle',
            label: '자동 회전',
            defaultValue: true,
            category: 'options',
          },
        ],
      },
      {
        id: 'appearance',
        title: '시각 효과',
        icon: '🎨',
        controls: [
          {
            id: 'colorTheme',
            type: 'select',
            label: '색상 테마',
            defaultValue: 'cosmic',
            options: [
              { value: 'cosmic', label: '우주' },
              { value: 'aurora', label: '오로라' },
              { value: 'sunset', label: '석양' },
              { value: 'ocean', label: '바다' },
              { value: 'fire', label: '불꽃' },
              { value: 'custom', label: '커스텀' }
            ],
            category: 'options',
          },
          {
            id: 'primaryColor',
            type: 'color',
            label: '주 색상',
            defaultValue: '#4444ff',
            category: 'options',
          },
          {
            id: 'secondaryColor',
            type: 'color',
            label: '보조 색상',
            defaultValue: '#ff44ff',
            category: 'options',
          },
          {
            id: 'showConnections',
            type: 'toggle',
            label: '연결선 표시',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'connectionDistance',
            type: 'slider',
            label: '연결 거리',
            min: 2,
            max: 10,
            step: 0.5,
            defaultValue: 5,
            category: 'options',
          },
          {
            id: 'trailEffect',
            type: 'toggle',
            label: '꼬리 효과',
            defaultValue: false,
            category: 'options',
          },
        ],
      },
      {
        id: 'interaction',
        title: '인터랙션',
        icon: '🖱️',
        controls: [
          {
            id: 'interactionStrength',
            type: 'slider',
            label: '마우스 인터랙션 강도',
            min: 0,
            max: 3,
            step: 0.1,
            defaultValue: 1,
            category: 'options',
          },
        ],
      },
    ],
  },

  'neon-city': {
    templateId: 'neon-city',
    layout: 'default',
    previewMode: 'realtime',
    sections: [
      {
        id: 'city',
        title: '도시 설정',
        icon: '🏙️',
        description: '도시의 스타일과 구조를 설정합니다',
        controls: [
          {
            id: 'cityStyle',
            type: 'select',
            label: '도시 스타일',
            defaultValue: 'cyberpunk',
            options: [
              { value: 'cyberpunk', label: '사이버펑크' },
              { value: 'tokyo', label: '도쿄' },
              { value: 'hongkong', label: '홍콩' },
              { value: 'miami', label: '마이애미' },
              { value: 'blade-runner', label: '블레이드 러너' }
            ],
            category: 'options',
          },
          {
            id: 'buildingDensity',
            type: 'slider',
            label: '건물 밀도',
            min: 0.5,
            max: 2,
            step: 0.1,
            defaultValue: 1,
            category: 'options',
          },
          {
            id: 'buildingHeight',
            type: 'slider',
            label: '건물 높이',
            min: 10,
            max: 50,
            step: 5,
            defaultValue: 30,
            category: 'options',
          },
        ],
      },
      {
        id: 'neon',
        title: '네온 효과',
        icon: '💡',
        controls: [
          {
            id: 'neonIntensity',
            type: 'slider',
            label: '네온 강도',
            min: 0.5,
            max: 2,
            step: 0.1,
            defaultValue: 1,
            category: 'options',
          },
          {
            id: 'neonTheme',
            type: 'select',
            label: '네온 색상 테마',
            defaultValue: 'classic',
            options: [
              { value: 'classic', label: '클래식' },
              { value: 'vaporwave', label: '베이퍼웨이브' },
              { value: 'matrix', label: '매트릭스' },
              { value: 'rainbow', label: '레인보우' },
              { value: 'custom', label: '커스텀' }
            ],
            category: 'options',
          },
          {
            id: 'primaryNeonColor',
            type: 'color',
            label: '주 네온 색상',
            defaultValue: '#ff0099',
            category: 'options',
          },
          {
            id: 'secondaryNeonColor',
            type: 'color',
            label: '보조 네온 색상',
            defaultValue: '#00ffff',
            category: 'options',
          },
        ],
      },
      {
        id: 'weather',
        title: '날씨 효과',
        icon: '🌧️',
        controls: [
          {
            id: 'weatherEffect',
            type: 'select',
            label: '날씨',
            defaultValue: 'rain',
            options: [
              { value: 'rain', label: '비' },
              { value: 'fog', label: '안개' },
              { value: 'clear', label: '맑음' },
              { value: 'storm', label: '폭풍' }
            ],
            category: 'options',
          },
          {
            id: 'rainIntensity',
            type: 'slider',
            label: '비 강도',
            min: 0,
            max: 2,
            step: 0.1,
            defaultValue: 1,
            category: 'options',
          },
          {
            id: 'fogDensity',
            type: 'slider',
            label: '안개 밀도',
            min: 0,
            max: 2,
            step: 0.1,
            defaultValue: 0.5,
            category: 'options',
          },
        ],
      },
      {
        id: 'effects',
        title: '추가 효과',
        icon: '✨',
        controls: [
          {
            id: 'reflectionIntensity',
            type: 'slider',
            label: '반사 강도',
            min: 0,
            max: 2,
            step: 0.1,
            defaultValue: 1,
            category: 'options',
          },
          {
            id: 'glitchEffect',
            type: 'toggle',
            label: '글리치 효과',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'glitchIntensity',
            type: 'slider',
            label: '글리치 강도',
            min: 0,
            max: 1,
            step: 0.1,
            defaultValue: 0.3,
            category: 'options',
          },
          {
            id: 'cameraMovement',
            type: 'toggle',
            label: '카메라 움직임',
            defaultValue: true,
            category: 'options',
          },
          {
            id: 'cameraSpeed',
            type: 'slider',
            label: '카메라 속도',
            min: 0.1,
            max: 2,
            step: 0.1,
            defaultValue: 0.5,
            category: 'options',
          },
        ],
      },
    ],
  },
};

// Helper function to get UI schema for a template
export function getTemplateUISchema(templateId: string): TemplateUISchema | null {
  return templateUISchemas[templateId] || templateUISchemas.default;
}

// Helper function to get default values from schema
export function getDefaultValuesFromSchema(schema: TemplateUISchema): Record<string, any> {
  const defaults: Record<string, any> = {};
  
  schema.sections.forEach(section => {
    section.controls.forEach(control => {
      if (control.defaultValue !== undefined) {
        defaults[control.id] = control.defaultValue;
      }
    });
  });
  
  return defaults;
}

// Helper function to validate form data against schema
export function validateFormData(
  data: Record<string, any>,
  schema: TemplateUISchema
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (schema.validation?.required) {
    schema.validation.required.forEach(field => {
      if (!data[field] || data[field] === '') {
        const control = schema.sections
          .flatMap(s => s.controls)
          .find(c => c.id === field);
        errors.push(`${control?.label || field} is required`);
      }
    });
  }
  
  // Run custom validations
  if (schema.validation?.custom) {
    schema.validation.custom.forEach(rule => {
      if (!rule.validate(data[rule.field])) {
        errors.push(rule.message);
      }
    });
  }
  
  return { valid: errors.length === 0, errors };
}