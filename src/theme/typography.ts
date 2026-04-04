// Typography Design System
import { Platform } from 'react-native';

export const FontSizes = {
  xs: 10, sm: 12, base: 14, md: 16, lg: 18, xl: 20,
  '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48,
} as const;

export const Typography = {
  h1: { fontSize: 30, fontWeight: '700' as const, lineHeight: 38 },
  h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '500' as const, lineHeight: 26 },
  h5: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  bodyLg: { fontSize: 18, fontWeight: '400' as const, lineHeight: 28 },
  bodyMd: { fontSize: 14, fontWeight: '400' as const, lineHeight: 22 },
  bodySm: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.5 },
  caption: { fontSize: 10, fontWeight: '400' as const, lineHeight: 14 },
  button: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.25 },
  code: { fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', lineHeight: 20 },
} as const;

export default Typography;
