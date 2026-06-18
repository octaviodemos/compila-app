import { useMemo } from 'react';

import { useTheme } from '@src/theme/ThemeContext';
import { getColors, type AppColors } from '@src/theme/colors';

export function useAppTheme() {
  const { tema, setTema, temaEfetivo, ready } = useTheme();
  const colors = useMemo(() => getColors(temaEfetivo), [temaEfetivo]);

  return {
    colors,
    tema,
    setTema,
    temaEfetivo,
    ready,
  };
}

export function useThemeColors(): AppColors {
  return useAppTheme().colors;
}
