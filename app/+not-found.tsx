import { fontFamily } from '@src/constants/typography';
import { useThemeColors } from '@src/hooks/useTheme';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';


export default function NotFoundScreen() {

  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 20,
      fontFamily: fontFamily.bold,
      color: colors.text,
    },
    link: {
      marginTop: 15,
      paddingVertical: 15,
    },
    linkText: {
      fontSize: 14,
      fontFamily: fontFamily.regular,
      color: colors.primary,
    },
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Ops' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Esta tela não existe.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Voltar ao início</Text>
        </Link>
      </View>
    </>
  );
}


