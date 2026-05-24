import { ThemeConfigContext } from "@src/contexts/useThemeContext";
import { useContext } from "react";
import { useColorScheme } from "react-native";

export function useThemeColors() {
  const themeColorScheme = useColorScheme() ?? 'light';
  const { colors } = useContext(ThemeConfigContext);
  return colors[themeColorScheme];
}
