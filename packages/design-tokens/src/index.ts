// Values mirror apps/web/scss/design-system.scss.
export const palettes = {
  light: {
    page: '#f3f6fa', card: '#ffffff', primary: '#1769b2', primarySoft: '#e7f0fa', onPrimary: '#ffffff',
    navy: '#17334b', text: '#23394b', muted: '#617489', line: '#dce5ee',
  },
  dark: {
    page: '#0d1722', card: '#172838', primary: '#82c9ff', primarySoft: '#19394f', onPrimary: '#0d1722',
    navy: '#e9f4fb', text: '#e4edf4', muted: '#aec0cd', line: '#334b5f',
  },
} as const;

export type Palette = Record<keyof typeof palettes.light, string>;

export const radius = { control: 10, card: 16 } as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
