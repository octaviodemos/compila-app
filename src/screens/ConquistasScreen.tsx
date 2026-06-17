import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
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
import { calculateAchievements } from '@src/services/achievements';
import {
  getUserProfile,
  getUserTotalAcertos,
  type UserPublicProfile,
} from '@src/services/challenges';

const GRID_H_PAD = 20;
const GRID_GAPS_TOTAL = 32;
const COR_CIRCULO_BLOQUEADO = '#2D2D3A';

export function ConquistasScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();
  const colors = useThemeColors();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [totalAcertos, setTotalAcertos] = useState(0);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    if (!user?.uid) {
      setProfile(null);
      setTotalAcertos(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [p, acertos] = await Promise.all([
        getUserProfile(user.uid),
        getUserTotalAcertos(user.uid).catch(() => 0),
      ]);
      setProfile(p);
      setTotalAcertos(acertos);
    } catch {
      setProfile(null);
      setTotalAcertos(0);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const conquistas = useMemo(
    () =>
      calculateAchievements(
        profile?.pontuacao ?? 0,
        profile?.sequencia ?? 0,
        totalAcertos
      ),
    [profile?.pontuacao, profile?.sequencia, totalAcertos]
  );

  const desbloqueadas = conquistas.filter((c) => c.desbloqueada).length;
  const conqItemWidth = (screenWidth - GRID_H_PAD * 2 - GRID_GAPS_TOTAL) / 3;

  function onVoltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/perfil' as Href);
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
      paddingHorizontal: GRID_H_PAD,
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
      paddingHorizontal: GRID_H_PAD,
    },
    subtitle: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    centered: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    conqGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      justifyContent: 'flex-start',
    },
    conqCell: {
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    conqCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      position: 'relative',
    },
    conqCircleBlocked: {
      backgroundColor: COR_CIRCULO_BLOQUEADO,
    },
    conqEmoji: {
      fontSize: 26,
    },
    conqEmojiBlocked: {
      opacity: 0.4,
    },
    conqLockBadge: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    conqNome: {
      fontFamily: fontFamily.semibold,
      fontSize: 12,
      color: colors.text,
      textAlign: 'center',
      alignSelf: 'stretch',
      marginBottom: 4,
    },
    conqNomeBlocked: {
      color: colors.textSecondary,
    },
    conqDesc: {
      fontFamily: fontFamily.regular,
      fontSize: 10,
      color: colors.textSecondary,
      textAlign: 'center',
      alignSelf: 'stretch',
      lineHeight: 14,
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
          <Text style={styles.headerTitle}>Conquistas</Text>
          <View style={styles.headerSide} />
        </View>

        <View style={styles.content}>
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>
                {desbloqueadas} de {conquistas.length} desbloqueadas
              </Text>
              <View style={styles.conqGrid}>
                {conquistas.map((c) => (
                  <View
                    key={c.id}
                    style={[styles.conqCell, { width: conqItemWidth }]}
                  >
                    <View
                      style={[
                        styles.conqCircle,
                        c.desbloqueada
                          ? { backgroundColor: c.cor }
                          : styles.conqCircleBlocked,
                      ]}
                    >
                      <Text
                        style={[
                          styles.conqEmoji,
                          !c.desbloqueada && styles.conqEmojiBlocked,
                        ]}
                      >
                        {c.emoji}
                      </Text>
                      {!c.desbloqueada ? (
                        <View style={styles.conqLockBadge}>
                          <Ionicons
                            name="lock-closed"
                            size={11}
                            color={colors.textSecondary}
                          />
                        </View>
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.conqNome,
                        !c.desbloqueada && styles.conqNomeBlocked,
                      ]}
                      numberOfLines={2}
                    >
                      {c.nome}
                    </Text>
                    <Text style={styles.conqDesc} numberOfLines={3}>
                      {c.descricao}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
