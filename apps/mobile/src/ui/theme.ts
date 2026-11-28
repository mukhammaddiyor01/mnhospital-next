import { useColorScheme } from 'react-native';
import { palettes, type Palette } from '@mnhospital/design-tokens';

export function useTheme(): Palette {
  return useColorScheme() === 'dark' ? palettes.dark : palettes.light;
}
