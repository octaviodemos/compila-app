import type { AppColors } from '@src/theme/colors';
import { useThemeColors } from '@src/hooks/useAppTheme';

export function useThemeColor(colorName: keyof AppColors) {
  return useThemeColors()[colorName];
}
