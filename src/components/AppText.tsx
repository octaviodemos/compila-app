import { StyleSheet, Text, TextProps } from 'react-native';

import { fontFamily } from '@src/constants/typography';
import { useThemeColors } from '@src/hooks/useTheme';
import { ThemeColorSet } from '@src/types/theme';

type AppTextProps = TextProps & {
  variant?: 'body' | 'title';
  color?: keyof ThemeColorSet;
};

export function AppText({
  variant = 'body',
  color = 'text',
  style,
  ...rest
}: AppTextProps) {
  const colors = useThemeColors();
  const font = variant === 'title' ? fontFamily.bold : fontFamily.regular;

  return (
    <Text
      style={[
        variant === 'title' ? styles.title : styles.body,
        { color: colors[color], fontFamily: font },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
  },
  title: {
    fontSize: 22,
  },
});
