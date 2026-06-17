import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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
import { getRanking, type RankingItem } from '@src/services/challenges';

const LIMITE_RANKING = 50;

function corPosicao(pos: number, textSecondary: string): string {
  if (pos === 1) return '#FACC15';
  if (pos === 2) return '#CBD5E1';
  if (pos === 3) return '#D97706';
  return textSecondary;
}

export function RankingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getRanking(LIMITE_RANKING);
      setRanking(items);
    } catch {
      setRanking([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  function onVoltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/' as Href);
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
      marginBottom: 20,
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
    },
    subtitle: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 20,
      textAlign: 'center',
    },
    centered: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    rankingList: {
      gap: 12,
    },
    rankingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
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
      backgroundColor: '#2D2D3A',
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
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingVertical: 24,
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
          <Text style={styles.headerTitle}>Ranking</Text>
          <View style={styles.headerSide} />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Top {LIMITE_RANKING} jogadores por pontuação total
          </Text>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : ranking.length === 0 ? (
            <Text style={styles.rankingEmpty}>
              Ninguém pontuou ainda. Resolva o desafio do dia para aparecer aqui.
            </Text>
          ) : (
            <View style={styles.rankingList}>
              {ranking.map((item, index) => {
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
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
