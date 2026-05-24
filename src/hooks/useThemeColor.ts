import { theme } from "@src/constants/theme";
import { useThemeColors } from "@src/hooks/useTheme";

export function useThemeColor(
  colorName: keyof typeof theme.colors.light & keyof typeof theme.colors.dark
) {
  return useThemeColors()[colorName];
}
