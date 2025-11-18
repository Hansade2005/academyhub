// Theme definitions for Skill Passport customization

export type ThemeName = 'default' | 'minimalist' | 'creative' | 'corporate' | 'dark';

export interface Theme {
  name: ThemeName;
  label: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    cardPadding: string;
    sectionGap: string;
    elementGap: string;
  };
  borderRadius: string;
  shadow: string;
}

export const themes: Record<ThemeName, Theme> = {
  default: {
    name: 'default',
    label: 'Default',
    description: 'Clean and professional design',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#10b981',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
    },
    fonts: {
      heading: 'font-bold text-2xl',
      body: 'font-normal text-base',
    },
    spacing: {
      cardPadding: 'p-6',
      sectionGap: 'mb-6',
      elementGap: 'mb-4',
    },
    borderRadius: 'rounded-lg',
    shadow: 'shadow-lg',
  },
  minimalist: {
    name: 'minimalist',
    label: 'Minimalist',
    description: 'Simple and elegant design',
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#ffffff',
      background: '#ffffff',
      surface: '#fafafa',
      text: '#000000',
      textSecondary: '#666666',
      border: '#cccccc',
    },
    fonts: {
      heading: 'font-light text-3xl',
      body: 'font-light text-base',
    },
    spacing: {
      cardPadding: 'p-8',
      sectionGap: 'mb-8',
      elementGap: 'mb-6',
    },
    borderRadius: 'rounded-none',
    shadow: 'shadow-sm',
  },
  creative: {
    name: 'creative',
    label: 'Creative',
    description: 'Bold and artistic design',
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      accent: '#45b7d1',
      background: '#f7f1e3',
      surface: '#fff5e3',
      text: '#2d3436',
      textSecondary: '#636e72',
      border: '#fdcb6e',
    },
    fonts: {
      heading: 'font-bold text-3xl italic',
      body: 'font-medium text-base',
    },
    spacing: {
      cardPadding: 'p-6',
      sectionGap: 'mb-6',
      elementGap: 'mb-4',
    },
    borderRadius: 'rounded-xl',
    shadow: 'shadow-2xl',
  },
  corporate: {
    name: 'corporate',
    label: 'Corporate',
    description: 'Professional business style',
    colors: {
      primary: '#1e40af',
      secondary: '#475569',
      accent: '#059669',
      background: '#ffffff',
      surface: '#f1f5f9',
      text: '#0f172a',
      textSecondary: '#475569',
      border: '#cbd5e1',
    },
    fonts: {
      heading: 'font-semibold text-2xl',
      body: 'font-normal text-base',
    },
    spacing: {
      cardPadding: 'p-6',
      sectionGap: 'mb-5',
      elementGap: 'mb-3',
    },
    borderRadius: 'rounded-md',
    shadow: 'shadow-md',
  },
  dark: {
    name: 'dark',
    label: 'Dark Mode',
    description: 'Modern dark theme',
    colors: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      accent: '#34d399',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      border: '#334155',
    },
    fonts: {
      heading: 'font-bold text-2xl',
      body: 'font-normal text-base',
    },
    spacing: {
      cardPadding: 'p-6',
      sectionGap: 'mb-6',
      elementGap: 'mb-4',
    },
    borderRadius: 'rounded-lg',
    shadow: 'shadow-xl',
  },
};

export const getTheme = (themeName: ThemeName): Theme => {
  return themes[themeName] || themes.default;
};

export const themeNames = Object.keys(themes) as ThemeName[];