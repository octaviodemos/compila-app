import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily } from '@src/constants/typography';
import { useAuth } from '@src/hooks/useAuth';
import { useThemeColors } from '@src/hooks/useTheme';
import { getUserProfile, updateUserPlano } from '@src/services/challenges';
import type { UserPlano } from '@src/types';

const COR_PRO = '#FACC15';

type FeatureItem = {
  texto: string;
  incluso: boolean;
};

const FEATURES_FREE: FeatureItem[] = [
  { texto: '1 desafio por dia', incluso: true },
  { texto: 'Máximo 3 tentativas', incluso: true },
  { texto: 'Apenas desafios fáceis', incluso: true },
  { texto: 'Desafios médios e difíceis', incluso: false },
  { texto: 'Tentativas ilimitadas', incluso: false },
];

const FEATURES_PRO: FeatureItem[] = [
  { texto: 'Desafios ilimitados', incluso: true },
  { texto: 'Tentativas ilimitadas', incluso: true },
  { texto: 'Todos os níveis de dificuldade', incluso: true },
  { texto: 'Exportar histórico em PDF', incluso: true },
];

function ListaFeatures({ items }: { items: FeatureItem[] }) {
  const colors = useThemeColors();

  return (
    <View style={{ gap: 10 }}>
      {items.map((item) => (
        <View
          key={item.texto}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Text style={{ fontSize: 14 }}>
            {item.incluso ? '✅' : '❌'}
          </Text>
          <Text
            style={{
              flex: 1,
              fontFamily: fontFamily.regular,
              fontSize: 14,
              color: item.incluso ? colors.text : colors.textSecondary,
            }}
          >
            {item.texto}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function PlanosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const empilhado = width < 560;

  const [plano, setPlano] = useState<UserPlano>('free');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    if (!user?.uid) {
      setPlano('free');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const perfil = await getUserProfile(user.uid);
      setPlano(perfil?.plano ?? 'free');
    } catch {
      setPlano('free');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  function onVoltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/configuracoes' as Href);
    }
  }

  async function aoAssinarPro() {
    if (!user?.uid || salvando) return;
    setSalvando(true);
    try {
      await updateUserPlano(user.uid, 'pro');
      setPlano('pro');
    } finally {
      setSalvando(false);
    }
  }

  async function aoCancelarAssinatura() {
    if (!user?.uid || salvando) return;
    setSalvando(true);
    try {
      await updateUserPlano(user.uid, 'free');
      setPlano('free');
    } finally {
      setSalvando(false);
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
      marginBottom: 8,
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
      gap: 16,
    },
    cardsRow: {
      flexDirection: empilhado ? 'column' : 'row',
      gap: 16,
      alignItems: 'stretch',
    },
    card: {
      flex: empilhado ? undefined : 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      gap: 14,
    },
    cardProAtivo: {
      borderColor: COR_PRO,
      borderWidth: 2,
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: colors.surface,
    },
    badgePro: {
      backgroundColor: 'rgba(250, 204, 21, 0.2)',
    },
    badgeTexto: {
      fontFamily: fontFamily.bold,
      fontSize: 11,
      letterSpacing: 0.6,
      color: colors.textSecondary,
    },
    badgeTextoPro: {
      color: COR_PRO,
    },
    preco: {
      fontFamily: fontFamily.bold,
      fontSize: 28,
      color: colors.text,
    },
    precoPeriodo: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      color: colors.textSecondary,
    },
    planoAtual: {
      fontFamily: fontFamily.semibold,
      fontSize: 13,
      color: COR_PRO,
      marginTop: 4,
    },
    botao: {
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
      marginTop: 4,
    },
    botaoPro: {
      backgroundColor: colors.primary,
    },
    botaoCancelar: {
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    botaoDisabled: {
      opacity: 0.6,
    },
    botaoTexto: {
      fontFamily: fontFamily.semibold,
      fontSize: 15,
      color: colors.text,
    },
    centered: {
      paddingVertical: 48,
      alignItems: 'center',
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
          <Text style={styles.headerTitle}>Escolha seu plano</Text>
          <View style={styles.headerSide} />
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.cardsRow}>
              <View
                style={[
                  styles.card,
                  plano === 'free' && { borderColor: colors.primary },
                ]}
              >
                <View style={styles.badge}>
                  <Text style={styles.badgeTexto}>GRÁTIS</Text>
                </View>
                <Text style={styles.preco}>
                  R$ 0
                  <Text style={styles.precoPeriodo}>/mês</Text>
                </Text>
                {plano === 'free' ? (
                  <Text style={[styles.planoAtual, { color: colors.primary }]}>
                    Seu plano atual
                  </Text>
                ) : null}
                <ListaFeatures items={FEATURES_FREE} />
              </View>

              <View
                style={[styles.card, plano === 'pro' && styles.cardProAtivo]}
              >
                <View style={[styles.badge, styles.badgePro]}>
                  <Text style={[styles.badgeTexto, styles.badgeTextoPro]}>
                    PRO
                  </Text>
                </View>
                <Text style={styles.preco}>
                  R$ 9,90
                  <Text style={styles.precoPeriodo}>/mês</Text>
                </Text>
                {plano === 'pro' ? (
                  <Text style={styles.planoAtual}>Seu plano atual</Text>
                ) : null}
                <ListaFeatures items={FEATURES_PRO} />
                {plano === 'pro' ? (
                  <Pressable
                    style={[
                      styles.botao,
                      styles.botaoCancelar,
                      salvando && styles.botaoDisabled,
                    ]}
                    onPress={aoCancelarAssinatura}
                    disabled={salvando}
                  >
                    {salvando ? (
                      <ActivityIndicator color={colors.text} />
                    ) : (
                      <Text style={styles.botaoTexto}>Cancelar assinatura</Text>
                    )}
                  </Pressable>
                ) : (
                  <Pressable
                    style={[
                      styles.botao,
                      styles.botaoPro,
                      salvando && styles.botaoDisabled,
                    ]}
                    onPress={aoAssinarPro}
                    disabled={salvando}
                  >
                    {salvando ? (
                      <ActivityIndicator color={colors.text} />
                    ) : (
                      <Text style={styles.botaoTexto}>Assinar Pro</Text>
                    )}
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
