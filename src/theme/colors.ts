// Theme Colors — Sianlk
// Brand: #1D4ED8 | Domain: platform

export const Colors = {
  // Brand
  primary: '#1D4ED8',
  primaryDark: '#1E40AF',
  primaryLight: '#3B82F6',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50:  '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Surfaces
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  overlay: 'rgba(0,0,0,0.5)',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  textLink: '#1D4ED8',

  // AI-specific
  aiPrimary: '#1D4ED8',
  aiSecondary: '#3B82F6',
  aiBackground: '#1D4ED81A',
  aiText: '#1E40AF',

  // Input
  inputBorder: '#D1D5DB',
  inputFocusBorder: '#1D4ED8',
  inputBackground: '#FFFFFF',
  inputPlaceholder: '#9CA3AF',

  // Dark mode
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    inputBorder: '#475569',
    inputBackground: '#1E293B',
  },
} as const;

export type ColorKey = keyof typeof Colors;
export default Colors;
