import { theme } from "@src/constants/theme";
import { ThemeConfig } from "@src/types/theme";
import { createContext } from "react";

export const ThemeConfigContext = createContext<ThemeConfig>(theme);
