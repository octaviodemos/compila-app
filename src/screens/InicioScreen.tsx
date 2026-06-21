import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily } from '@src/constants/typography';
import { useAuth } from '@src/hooks/useAuth';
import { useThemeColors } from '@src/hooks/useTheme';
import {
    getRanking,
    getTodayChallenge,
    getUserProfile,
    normalizarUserPlano,
    type RankingItem,
} from '@src/services/challenges';
import { syncStreakWidget } from '@src/services/widgetSync';
import type { Challenge, UserPlano } from '@src/types';
import { labelDificuldade, textoAceitaMultiplasLinguagens } from '@src/utils/challengeUi';

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

const DIAS_SEMANA = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'] as const;
const SEMANA_TAMANHO = DIAS_SEMANA.length;

function formatarDataBr(data: Date): string {
  return `${data.getDate()} de ${MESES[data.getMonth()]}`;
}

function corPosicao(pos: number, textSecondary: string): string {
  if (pos === 1) return '#FACC15';
  if (pos === 2) return '#E5E7EB';
  if (pos === 3) return '#D97706';
  return textSecondary;
}

export function InicioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuth();
  const dataFormatada = useMemo(() => formatarDataBr(new Date()), []);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [sequencia, setSequencia] = useState(0);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(true);

  const carregar = useCallback(async () => {
    setLoadingChallenge(true);
    setLoadingRanking(true);
    try {
      let userPlano: UserPlano = 'free';
      let sequenciaAtual = 0;
      if (user?.uid) {
        try {
          const perfil = await getUserProfile(user.uid);
          userPlano = normalizarUserPlano(perfil?.plano);
          sequenciaAtual = perfil?.sequencia ?? 0;
        } catch {
          sequenciaAtual = 0;
        }
      }
      setSequencia(sequenciaAtual);
      // Mantém o widget da tela inicial em sincronia com a sequência.
      void syncStreakWidget(sequenciaAtual);

      const [ch, rank] = await Promise.all([
        getTodayChallenge(userPlano).catch(() => null),
        getRanking().catch(() => [] as RankingItem[]),
      ]);
      setChallenge(ch);
      setRanking(rank);
    } finally {
      setLoadingChallenge(false);
      setLoadingRanking(false);
    }
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const exemploLinha = useMemo(() => {
    const ex = challenge?.exemplos[0];
    if (!ex) return '';
    return `Ex.: entrada ${ex.entrada} → saída ${ex.saida}`;
  }, [challenge]);

  const aoResolver = () => {
    if (!challenge?.id) return;
    router.push({
      pathname: '/desafio',
      params: { challengeId: challenge.id },
    });
  };

  const styles = StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 28,
    },
    compilaLogo: {
      fontFamily: fontFamily.bold,
      fontSize: 24,
      color: colors.text,
    },
    streakPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      gap: 4,
    },
    streakEmoji: {
      fontSize: 15,
    },
    streakNum: {
      fontFamily: fontFamily.semibold,
      fontSize: 16,
      color: colors.text,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    sectionLabel: {
      fontFamily: fontFamily.semibold,
      fontSize: 16,
      color: colors.text,
    },
    sectionSpacer: {
      marginTop: 28,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dateText: {
      fontFamily: fontFamily.regular,
      fontSize: 13,
      color: colors.textSecondary,
    },
    challengeCard: {
      backgroundColor: '#5B21B6',
      borderRadius: 16,
      padding: 16,
      minHeight: 120,
    },
    challengeLoading: {
      paddingVertical: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    challengeEmpty: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.85)',
      textAlign: 'center',
      paddingVertical: 16,
    },
    challengeTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    diffBadge: {
      backgroundColor: '#22C55E',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    diffBadgeText: {
      fontFamily: fontFamily.semibold,
      fontSize: 10,
      color: colors.text,
      letterSpacing: 0.5,
    },
    codeIconWrap: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 20,
      padding: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    challengeTitle: {
      fontFamily: fontFamily.bold,
      fontSize: 18,
      color: colors.text,
      marginBottom: 8,
    },
    challengeDesc: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.7)',
      lineHeight: 20,
      marginBottom: 8,
    },
    challengeLangs: {
      fontFamily: fontFamily.regular,
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.75)',
      lineHeight: 17,
      marginBottom: 10,
    },
    challengeExemplo: {
      fontFamily: fontFamily.regular,
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    resolveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#4F46E5',
      paddingVertical: 14,
      borderRadius: 12,
      width: '100%',
    },
    resolveBtnText: {
      fontFamily: fontFamily.semibold,
      fontSize: 15,
      color: colors.text,
    },
    resolveBtnChevron: {
      fontFamily: fontFamily.semibold,
      fontSize: 15,
      color: colors.text,
    },
    streakCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
    },
    streakCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    streakCardEmoji: {
      fontSize: 18,
    },
    streakCardTitle: {
      fontFamily: fontFamily.semibold,
      fontSize: 16,
      color: colors.text,
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    weekDay: {
      alignItems: 'center',
      gap: 6,
    },
    weekDot: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekLetter: {
      fontFamily: fontFamily.regular,
      fontSize: 11,
      color: colors.textSecondary,
    },
    verTudo: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      color: colors.primary,
    },
    rankingList: {
      marginTop: 4,
      gap: 12,
    },
    rankingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    rankingPos: {
      fontFamily: fontFamily.bold,
      fontSize: 16,
      width: 22,
      textAlign: 'center',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
    },
    rankingUser: {
      flex: 1,
      fontFamily: fontFamily.regular,
      fontSize: 15,
      color: colors.text,
    },
    rankingPts: {
      fontFamily: fontFamily.semibold,
      fontSize: 14,
      color: colors.textSecondary,
    },
    rankingEmpty: {
      fontFamily: fontFamily.regular,
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingVertical: 12,
    },
  });

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.compilaLogo}>Compila</Text>
        <View style={styles.streakPill}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakNum}>{sequencia}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Desafio do dia</Text>
        <View style={styles.dateRow}>
          <Feather
            name="calendar"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={styles.dateText}>{dataFormatada}</Text>
        </View>
      </View>

      <View style={styles.challengeCard}>
        {loadingChallenge ? (
          <View style={styles.challengeLoading}>
            <ActivityIndicator color={colors.text} />
          </View>
        ) : challenge ? (
          <>
            <View style={styles.challengeTopRow}>
              <View style={styles.diffBadge}>
                <Text style={styles.diffBadgeText}>
                  {labelDificuldade(challenge.dificuldade)}
                </Text>
              </View>
              <View style={styles.codeIconWrap}>
                <Ionicons name="code-slash" size={24} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.challengeTitle}>{challenge.titulo}</Text>
            <Text style={styles.challengeDesc}>{challenge.descricao}</Text>
            <Text style={styles.challengeLangs}>
              {textoAceitaMultiplasLinguagens()}
            </Text>
            {exemploLinha ? (
              <Text style={styles.challengeExemplo}>{exemploLinha}</Text>
            ) : null}
            <Pressable style={styles.resolveBtn} onPress={aoResolver}>
              <Text style={styles.resolveBtnText}>Resolver desafio</Text>
              <Text style={styles.resolveBtnChevron}> ›</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.challengeEmpty}>
            Nenhum desafio ativo no momento.
          </Text>
        )}
      </View>

      <Text style={[styles.sectionLabel, styles.sectionSpacer]}>
        Sequência atual
      </Text>
      <View style={styles.streakCard}>
        <View style={styles.streakCardHeader}>
          <Text style={styles.streakCardEmoji}>🔥</Text>
          <Text style={styles.streakCardTitle}>
            {sequencia} {sequencia === 1 ? 'dia' : 'dias'}
          </Text>
        </View>
        <View style={styles.weekRow}>
          {DIAS_SEMANA.map((letra, index) => {
            const ativo = index < Math.min(sequencia, SEMANA_TAMANHO);
            return (
              <View key={`${letra}-${index}`} style={styles.weekDay}>
                <View
                  style={[
                    styles.weekDot,
                    ativo && {
                      backgroundColor: 'rgba(124, 58, 237, 0.18)',
                    },
                  ]}
                >
                  {ativo ? (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={colors.primary}
                    />
                  ) : null}
                </View>
                <Text style={styles.weekLetter}>{letra}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.sectionHeader, styles.sectionSpacer]}>
        <Text style={styles.sectionLabel}>Ranking</Text>
        <Pressable onPress={() => router.push('/ranking' as Href)}>
          <Text style={styles.verTudo}>Ver tudo ›</Text>
        </Pressable>
      </View>
      <View style={styles.rankingList}>
        {loadingRanking ? (
          <ActivityIndicator color={colors.primary} />
        ) : ranking.length === 0 ? (
          <Text style={styles.rankingEmpty}>
            Ninguém pontuou ainda. Resolva o desafio do dia para aparecer aqui.
          </Text>
        ) : (
          ranking.map((item, index) => {
            const pos = index + 1;
            const nome = item.username || 'usuário';
            const eVoce = item.uid === user?.uid;
            return (
              <View key={item.uid} style={styles.rankingRow}>
                <Text
                  style={[
                    styles.rankingPos,
                    { color: corPosicao(pos, colors.textSecondary) },
                  ]}
                >
                  {pos}
                </Text>
                <View style={styles.avatar} />
                <Text style={styles.rankingUser} numberOfLines={1}>
                  {nome}
                  {eVoce ? '  (você)' : ''}
                </Text>
                <Text style={styles.rankingPts}>
                  {item.pontuacao.toLocaleString('pt-BR')} pts
                </Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
