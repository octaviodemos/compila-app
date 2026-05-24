import { useThemeColor } from "@src/hooks/useThemeColor";
import { Text as DefaultText } from 'react-native';

export function Text({ style, ...otherProps }: DefaultText['props']) {
  const color = useThemeColor('text');
  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}
