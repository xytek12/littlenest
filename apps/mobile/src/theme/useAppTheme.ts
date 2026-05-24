import { useColorScheme } from 'react-native';
import { colors } from './colors';

export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return {
    isDark,
    background: isDark ? colors.black : colors.white,
    text: isDark ? colors.textDark : colors.textLight,
    mutedText: isDark ? '#8B99AA' : '#5B6B7C',
    surface: isDark ? '#111820' : colors.white,
    border: isDark ? '#263443' : '#E6EDF5',
  };
}
