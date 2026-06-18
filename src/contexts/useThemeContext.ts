import { theme } from '@src/constants/theme';
import type { ThemeConfig } from '@src/types/theme';
import { createContext } from 'react';

export const ThemeConfigContext = createContext<ThemeConfig>(theme);
