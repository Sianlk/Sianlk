// Typography — Design system font scale

import { Platform } from 'react-native';

export const FontFamilies = {
  regular:  Platform.OS === 'ios' ? 'System' : 'Roboto',
  medium:   Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
  semibold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  bold:     Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  mono:     Platform.OS === 'ios' ? 'Courier New' : 'monospace',
};

export const FontSizes = {
  xs:   10,
  sm:   12,
  base: 14,
  md:   16,
  lg:   18,
  xl:   20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
} as const;

export const LineHeights = {
  tight:  1.25,
  snug:   1.375,
  normal: 1.5,
  relaxed:1.625,
  loose:  2,
} as const;

export const FontWeights = {
  normal:    '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
};

export const Typography = {
  // Display
  displayXl: { fontSize: FontSizes['6xl'], fontWeight: FontWeights.bold,     lineHeight: FontSizes['6xl'] * LineHeights.tight },
  displayLg: { fontSize: FontSizes['5xl'], fontWeight: FontWeights.bold,     lineHeight: FontSizes['5xl'] * LineHeights.tight },
  displayMd: { fontSize: FontSizes['4xl'], fontWeight: FontWeights.bold,     lineHeight: FontSizes['4xl'] * LineHeights.tight },

  // Headings
  h1: { fontSize: FontSizes['3xl'], fontWeight: FontWeights.bold,     lineHeight: FontSizes['3xl'] * LineHeights.tight },
  h2: { fontSize: FontSizes['2xl'], fontWeight: FontWeights.semibold, lineHeight: FontSizes['2xl'] * LineHeights.snug },
  h3: { fontSize: FontSizes.xl,     fontWeight: FontWeights.semibold, lineHeight: FontSizes.xl * LineHeights.snug },
  h4: { fontSize: FontSizes.lg,     fontWeight: FontWeights.medium,   lineHeight: FontSizes.lg * LineHeights.normal },
  h5: { fontSize: FontSizes.md,     fontWeight: FontWeights.medium,   lineHeight: FontSizes.md * LineHeights.normal },
  h6: { fontSize: FontSizes.base,   fontWeight: FontWeights.medium,   lineHeight: FontSizes.base * LineHeights.normal },

  // Body
  bodyLg:  { fontSize: FontSizes.lg,   fontWeight: FontWeights.normal, lineHeight: FontSizes.lg * LineHeights.relaxed },
  bodyMd:  { fontSize: FontSizes.base, fontWeight: FontWeights.normal, lineHeight: FontSizes.base * LineHeights.relaxed },
  bodySm:  { fontSize: FontSizes.sm,   fontWeight: FontWeights.normal, lineHeight: FontSizes.sm * LineHeights.relaxed },

  // UI
  label:   { fontSize: FontSizes.sm,   fontWeight: FontWeights.medium,  letterSpacing: 0.5 },
  caption: { fontSize: FontSizes.xs,   fontWeight: FontWeights.normal,  lineHeight: FontSizes.xs * LineHeights.normal },
  button:  { fontSize: FontSizes.base, fontWeight: FontWeights.semibold, letterSpacing: 0.25 },
  overline:{ fontSize: FontSizes.xs,   fontWeight: FontWeights.semibold, letterSpacing: 1.5,  textTransform: 'uppercase' as const },

  // Code
  code: { fontSize: FontSizes.sm, fontFamily: FontFamilies.mono, lineHeight: FontSizes.sm * LineHeights.relaxed },
} as const;

export default Typography;
