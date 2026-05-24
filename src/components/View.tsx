
import { useThemeColor } from '@src/hooks/useThemeColor';
import { View as DefaultView } from 'react-native';

export function View({ style, ...otherProps }: DefaultView['props']) {
  const backgroundColor = useThemeColor('background');
  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
