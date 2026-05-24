import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily } from '@src/constants/typography';
import { useThemeColors } from '@src/hooks/useTheme';

const GRID_H_PAD = 20;
const GRID_GAPS_TOTAL = 32;

const MOCK_CONQUISTAS = [
  {
    id: '1',
    emoji: '🥇',
    nome: 'Primeiro Passo',
    descricao: 'Complete seu primeiro desafio',
    circleBg: '#CA8A04',
  },
  {
    id: '2',
    emoji: '🔥',
    nome: 'Persistente',
    descricao: 'Mantenha uma sequência de 7 dias',
    circleBg: '#EA580C',
  },
  {
    id: '3',
    emoji: '🎯',
    nome: 'Focado',
    descricao: 'Acerte 10 desafios seguidos',
    circleBg: '#DC2626',
  },
  {
    id: '4',
    emoji: '🧠',
    nome: 'Lógico',
    descricao: 'Domine desafios de lógica',
    circleBg: '#7C3AED',
  },
  {
    id: '5',
    emoji: '🏆',
    nome: 'Imbatível',
    descricao: 'Fique no topo do ranking',
    circleBg: '#B45309',
  },
  {
    id: '6',
    emoji: '👑',
    nome: 'Lendário',
    descricao: 'Alcance 5000 pontos totais',
    circleBg: '#5B21B6',
  },
] as const;

export function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const colors = useThemeColors();
  const conqItemWidth = (screenWidth - 40 - GRID_GAPS_TOTAL) / 3;

  const styles = StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: GRID_H_PAD,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    avatarWrap: {
      alignItems: 'center',
      marginBottom: 28,
    },
    avatarCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: '#3B0764',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    usernameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 8,
    },
    username: {
      fontFamily: fontFamily.bold,
      fontSize: 20,
      color: colors.text,
    },
    pencilBtn: {
      marginTop: 2,
    },
    bio: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 28,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
    },
    statLabel: {
      fontFamily: fontFamily.regular,
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 6,
    },
    statEmoji: {
      fontSize: 22,
      marginBottom: 4,
    },
    statValue: {
      fontFamily: fontFamily.bold,
      fontSize: 22,
      color: colors.text,
      textAlign: 'center',
    },
    conqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    conqTitle: {
      fontFamily: fontFamily.semibold,
      fontSize: 16,
      color: colors.text,
    },
    conqVerTudo: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      color: colors.primary,
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
    },
    conqEmoji: {
      fontSize: 26,
    },
    conqNome: {
      fontFamily: fontFamily.semibold,
      fontSize: 12,
      color: colors.text,
      textAlign: 'center',
      alignSelf: 'stretch',
      marginBottom: 4,
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
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable hitSlop={12}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </Pressable>
        <Pressable hitSlop={12}>
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.avatarWrap}>
        <View style={styles.avatarCircle}>
          <Ionicons name="code-slash" size={40} color={colors.text} />
        </View>
        <View style={styles.usernameRow}>
          <Text style={styles.username}>dev_hero</Text>
          <Pressable hitSlop={8} style={styles.pencilBtn}>
            <Ionicons name="pencil" size={16} color={colors.primary} />
          </Pressable>
        </View>
        <Text style={styles.bio}>Bora compilar o futuro! 🚀</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Pontuação total</Text>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statValue}>3.420</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Sequência atual</Text>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValue}>7 dias</Text>
        </View>
      </View>

      <View style={styles.conqHeader}>
        <Text style={styles.conqTitle}>Conquistas</Text>
        <Pressable>
          <Text style={styles.conqVerTudo}>Ver todas ›</Text>
        </Pressable>
      </View>

      <View style={styles.conqGrid}>
        {MOCK_CONQUISTAS.map((c) => (
          <View
            key={c.id}
            style={[styles.conqCell, { width: conqItemWidth }]}
          >
            <View style={[styles.conqCircle, { backgroundColor: c.circleBg }]}>
              <Text style={styles.conqEmoji}>{c.emoji}</Text>
            </View>
            <Text style={styles.conqNome} numberOfLines={2}>
              {c.nome}
            </Text>
            <Text style={styles.conqDesc} numberOfLines={2}>
              {c.descricao}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
