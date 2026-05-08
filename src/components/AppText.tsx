import { Text, TextProps, StyleSheet } from 'react-native';

import { colors } from '@/src/theme/colors';
import { fontFamily } from '@/src/theme/typography';

type AppTextProps = TextProps & {
  variant?: 'body' | 'title';
  color?: keyof typeof colors;
};

export function AppText({
  variant = 'body',
  color = 'text',
  style,
  ...rest
}: AppTextProps) {
  const font =
    variant === 'title' ? fontFamily.bold : fontFamily.regular;
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
