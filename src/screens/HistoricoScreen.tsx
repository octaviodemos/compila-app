import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/src/hooks/useAuth';
import {
  getUserAttempts,
  type AttemptListItem,
} from '@/src/services/challenges';
import { colors } from '@/src/theme/colors';
import { fontFamily } from '@/src/theme/typography';

type FiltroHistorico = 'todos' | 'acertos' | 'erros';

function formatarDataHoraBr(d: Date | null): string {
  if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) {
    return '—';
  }
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} • ${h}:${min}`;
}

const FILTROS: { key: FiltroHistorico; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'acertos', label: 'Acertos' },
  { key: 'erros', label: 'Erros' },
];

export function HistoricoScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [filtro, setFiltro] = useState<FiltroHistorico>('todos');
  const [items, setItems] = useState<AttemptListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    if (!user?.uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await getUserAttempts(user.uid);
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const listaFiltrada = useMemo(() => {
    if (filtro === 'todos') return items;
    if (filtro === 'acertos') {
      return items.filter((t) => t.acertou);
    }
    return items.filter((t) => !t.acertou);
  }, [filtro, items]);

  const renderItem: ListRenderItem<AttemptListItem> = ({ item }) => (
    <View style={styles.itemRow}>
      <View
        style={[
          styles.iconCircle,
          item.acertou ? styles.iconCircleOk : styles.iconCircleErr,
        ]}
      >
        {item.acertou ? (
          <Ionicons name="checkmark" size={18} color="#4ADE80" />
        ) : (
          <Ionicons name="close" size={18} color="#F87171" />
        )}
      </View>
      <View style={styles.itemCenter}>
        <Text style={styles.itemNome} numberOfLines={1}>
          {item.titulo}
        </Text>
        <Text style={styles.itemData}>
          {formatarDataHoraBr(item.criadoEm)}
        </Text>
      </View>
      <View style={styles.itemRight}>
        <View style={styles.itemRightTexts}>
          <Text
            style={[
              styles.itemPontos,
              item.acertou ? styles.itemPontosOk : styles.itemPontosErr,
            ]}
          >
            {item.pontos} pts
          </Text>
          <Text
            style={[
              styles.itemStatus,
              item.acertou ? styles.itemStatusOk : styles.itemStatusErr,
            ]}
          >
            {item.acertou ? 'Acertou' : 'Errou'}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textSecondary}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.headerTitle}>Histórico</Text>

      <View style={styles.tabsRow}>
        {FILTROS.map(({ key, label }) => {
          const ativo = filtro === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFiltro(key)}
              style={styles.tabPress}
            >
              <Text
                style={[styles.tabLabel, ativo && styles.tabLabelAtivo]}
              >
                {label}
              </Text>
              {ativo ? <View style={styles.tabUnderline} /> : null}
            </Pressable>
          );
        })}
      </View>

      <FlatList
        style={styles.list}
        data={listaFiltrada}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          listaFiltrada.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="document-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>Nenhum desafio aqui ainda</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.text,
    marginBottom: 20,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    marginBottom: 16,
  },
  tabPress: {
    alignItems: 'center',
    paddingBottom: 8,
    minWidth: 72,
    position: 'relative',
  },
  tabLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 15,
    color: colors.textSecondary,
  },
  tabLabelAtivo: {
    color: colors.text,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.card,
    backgroundColor: 'transparent',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconCircleOk: {
    borderColor: 'rgba(74, 222, 128, 0.35)',
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
  },
  iconCircleErr: {
    borderColor: 'rgba(248, 113, 113, 0.35)',
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
  },
  itemCenter: {
    flex: 1,
    minWidth: 0,
  },
  itemNome: {
    fontFamily: fontFamily.semibold,
    fontSize: 15,
    color: colors.text,
  },
  itemData: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemRightTexts: {
    alignItems: 'flex-end',
  },
  itemPontos: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
  },
  itemPontosOk: {
    color: colors.primary,
  },
  itemPontosErr: {
    color: '#F87171',
  },
  itemStatus: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    marginTop: 2,
  },
  itemStatusOk: {
    color: '#4ADE80',
  },
  itemStatusErr: {
    color: '#F87171',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
