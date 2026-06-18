import { darkColors, getColors, type AppColors } from '@src/theme/colors';
import { lightColors } from '@src/theme/lightColors';
import type { ThemeConfig } from '@src/types/theme';

export const theme: ThemeConfig = {
  colors: {
    light: lightColors,
    dark: darkColors,
  },
};

export { getColors, darkColors, lightColors };
export type { AppColors };
