import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontFamily } from '@src/constants/typography';
import { useThemeColors } from '@src/hooks/useTheme';

type PlanoProBloqueioProps = {
  descricao: string;
  titulo?: string;
  rotuloBotao?: string;
};

export function PlanoProBloqueio({
  descricao,
  titulo = 'Recurso exclusivo Pro',
  rotuloBotao = 'Ver planos',
}: PlanoProBloqueioProps) {
  const router = useRouter();
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
      backgroundColor: colors.background,
    },
    lockCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    titulo: {
      fontFamily: fontFamily.bold,
      fontSize: 22,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    descricao: {
      fontFamily: fontFamily.regular,
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 28,
    },
    botao: {
      backgroundColor: colors.primary,
      paddingHorizontal: 28,
      paddingVertical: 14,
      borderRadius: 12,
      minWidth: 200,
      alignItems: 'center',
    },
    botaoTexto: {
      fontFamily: fontFamily.semibold,
      fontSize: 15,
      color: colors.text,
    },
  });

  function irParaPlanos() {
    router.push('/planos' as Href);
  }

  return (
    <View style={styles.root}>
      <View style={styles.lockCircle}>
        <Ionicons name="lock-closed" size={40} color={colors.primary} />
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.descricao}>{descricao}</Text>
      <Pressable style={styles.botao} onPress={irParaPlanos}>
        <Text style={styles.botaoTexto}>{rotuloBotao}</Text>
      </Pressable>
    </View>
  );
}
