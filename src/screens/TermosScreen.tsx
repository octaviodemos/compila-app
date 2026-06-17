import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily } from '@src/constants/typography';
import { useThemeColors } from '@src/hooks/useTheme';

const TERMOS = [
  {
    titulo: '1. Aceitação',
    texto:
      'Ao usar o Compila, você concorda com estes termos. Se não concordar, não utilize o aplicativo.',
  },
  {
    titulo: '2. Conta e acesso',
    texto:
      'Você é responsável por manter suas credenciais seguras e por toda atividade realizada na sua conta.',
  },
  {
    titulo: '3. Uso do serviço',
    texto:
      'O Compila oferece desafios diários de programação e avaliação automática de respostas. O conteúdo é destinado a fins educacionais.',
  },
  {
    titulo: '4. Pontuação e ranking',
    texto:
      'Pontos, sequências e rankings são calculados com base nas tentativas registradas no sistema e podem ser ajustados em caso de inconsistências técnicas.',
  },
  {
    titulo: '5. Conduta',
    texto:
      'É proibido tentar burlar o sistema, enviar conteúdo ofensivo ou usar o app de forma que prejudique outros usuários ou a infraestrutura.',
  },
  {
    titulo: '6. Privacidade',
    texto:
      'Coletamos dados necessários para autenticação, histórico de tentativas e exibição do perfil. Não compartilhamos suas informações com terceiros sem base legal.',
  },
  {
    titulo: '7. Alterações',
    texto:
      'Estes termos podem ser atualizados. O uso continuado do app após mudanças significa aceitação da nova versão.',
  },
  {
    titulo: '8. Contato',
    texto:
      'Dúvidas sobre estes termos podem ser enviadas pelo e-mail de suporte informado no app ou na loja de distribuição.',
  },
];

export function TermosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();

  function onVoltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/configuracoes' as Href);
    }
  }

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      minHeight: 48,
      marginBottom: 16,
    },
    headerSide: {
      width: 44,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontFamily: fontFamily.bold,
      fontSize: 20,
      color: colors.text,
    },
    content: {
      paddingHorizontal: 20,
      gap: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      gap: 16,
    },
    sectionTitle: {
      fontFamily: fontFamily.semibold,
      fontSize: 15,
      color: colors.text,
    },
    sectionText: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    atualizado: {
      fontFamily: fontFamily.regular,
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
  });

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable style={styles.headerSide} onPress={onVoltar} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Termos de uso</Text>
          <View style={styles.headerSide} />
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            {TERMOS.map((secao) => (
              <View key={secao.titulo}>
                <Text style={styles.sectionTitle}>{secao.titulo}</Text>
                <Text style={styles.sectionText}>{secao.texto}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.atualizado}>Última atualização: junho de 2026</Text>
        </View>
      </ScrollView>
    </View>
  );
}
