import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Orange (Brand Color) - from theme.ts
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#FFF0E5',
          100: '#FFD1B2',
          200: '#FFC299',
          300: '#FFA366',
          400: '#FF8533',
          500: '#FF6600',  // Brand Orange - Primary CTAs, active states
        },
        
        // Secondary Blue (Selection Color) - from theme.ts
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          25: '#4CB3F8',
          50: '#2EA6F6',
          100: '#1099F5',  // Selection Blue - Selection states, links, charts
          200: '#0988DD',
          300: '#0988DD',
        },
        
        // Grayscale (Backgrounds & Text) - from theme.ts
        grayscale: {
          0: '#F8F9FB',   // Surface Gray - Page background
          25: '#F6F6FA',
          50: '#ECEFF3',
          100: '#DFE1E6',  // Border Gray - Dividers, borders
          200: '#C1C7CF',
          300: '#A4ABB8',  // Disabled Text
          400: '#808897',
          500: '#666D80',  // Secondary Text - Subtitles, metadata
          600: '#353849',
          700: '#272835',
          800: '#1A1B25',  // Primary Text - Headers, body text
          900: '#0D0D12',
        },
        
        // Additional Blue Colors - from theme.ts
        'additional-blue': {
          50: '#E9FFFD',
          100: '#BDD0F9',
          400: '#5082EF',
          500: '#2463EB',
          600: '#1D4FBC',
        },
        
        // Alert Success - from theme.ts
        'alert-success': {
          0: '#EFFEFA',
          25: '#DDF2EE',
          50: '#9DE0D3',
          100: '#40C4AA',
          200: '#2876E',
          300: '#174E43',
        },
        
        // Alert Warning - from theme.ts
        'alert-warning': {
          0: '#FFFE60',
          25: '#F9CCCB',
          50: '#FFB092',
          100: '#FFB04C',
          200: '#953621',
          300: '#583D1E',
        },
        
        // Alert Error - from theme.ts
        'alert-error': {
          0: '#FFEFF2',
          25: '#FADAEB',
          50: '#ED8296',
          100: '#DF1C41',  // Primary Error - Negative changes, errors
          200: '#95122B',
          300: '#710E21',
          400: '#823329',
        },
        
        // Success (Standard) - from theme.ts
        success: {
          100: '#6E9C83',
          200: '#609277',
          300: '#508769',
          400: '#42C257',
          500: '#2DB470',  // Primary Success - Positive changes
        },
        
        // Muscle Group Colors - from theme.ts (all 17 groups)
        'muscle-groups': {
          abdominals: '#0563AB',
          hamstrings: '#086E47',
          calves: '#171016',
          shoulders: '#523173',
          adductors: '#061207',
          glutes: '#9C2146',
          quadriceps: '#69583A',
          lats: '#143E45',
          biceps: '#151D30',
          forearms: '#1B8C2C',
          triceps: '#505D75',
          chest: '#6B2B06',
          lowerback: '#13233B',
          middleback: '#7E2EB3',
          traps: '#9C4702',
          abductors: '#301A4B',
          neck: '#301A4B',
        },
        
        // Superset Colors - from theme.ts
        superset: {
          exerciseOne: '#2097E6',
          exerciseTwo: '#828AE8',
        },
        
        // Semantic aliases for convenience (maps to theme.ts values)
        'brand-orange': '#FF6600',      // Maps to primary-500
        'brand-primary': '#FF6600',     // Alias for brand-orange (legacy support)
        'brand-blue': '#1099F5',        // Maps to secondary-100
        'surface-gray': '#F8F9FB',      // Maps to grayscale-0
        'card-white': '#FFFFFF',        // White for cards
        'text-primary': '#1A1B25',      // Maps to grayscale-800
        'text-secondary': '#666D80',    // Maps to grayscale-500
        'text-disabled': '#A4ABB8',     // Maps to grayscale-300
        'border-gray': '#DFE1E6',       // Maps to grayscale-100
        'success-green': '#2DB470',     // Maps to success-500
        'error-red': '#DF1C41',         // Maps to alert-error-100
        
        // shadcn/ui semantic colors (HSL format)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontSize: {
        // EzLift Typography Scale (from mobile app)
        'page-title': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'section-header': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'card-title': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'secondary': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'metric-large': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'button-text': ['18px', { lineHeight: '24px', fontWeight: '600' }],
      },
      spacing: {
        'screen-padding': '16px',
        'card-padding': '20px',
        'card-gap': '16px',
        'section-gap': '32px',
        'element-gap': '12px',
        'touch-target': '44px',
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
        'input': '8px',
        'pill': '20px',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(to right, #FF6600, #FF3729)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};

export default config;