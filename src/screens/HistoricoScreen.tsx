import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/src/theme/colors';
import { fontFamily } from '@/src/theme/typography';

type FiltroHistorico = 'todos' | 'acertos' | 'erros';

type HistoricoItem = {
  id: string;
  desafioNome: string;
  dataHora: string;
  acertou: boolean;
  pontos: number;
};

const MOCK_TENTATIVAS: HistoricoItem[] = [
  {
    id: '1',
    desafioNome: 'Soma dos Dígitos',
    dataHora: '30/05/2025 • 10:32',
    acertou: true,
    pontos: 10,
  },
  {
    id: '2',
    desafioNome: 'Fatorial',
    dataHora: '29/05/2025 • 18:45',
    acertou: false,
    pontos: 0,
  },
  {
    id: '3',
    desafioNome: 'Palíndromo',
    dataHora: '29/05/2025 • 09:12',
    acertou: true,
    pontos: 15,
  },
  {
    id: '4',
    desafioNome: 'Busca Binária',
    dataHora: '28/05/2025 • 22:01',
    acertou: true,
    pontos: 20,
  },
  {
    id: '5',
    desafioNome: 'Merge de listas',
    dataHora: '28/05/2025 • 14:30',
    acertou: false,
    pontos: 0,
  },
  {
    id: '6',
    desafioNome: 'Contagem de vogais',
    dataHora: '27/05/2025 • 08:55',
    acertou: true,
    pontos: 10,
  },
  {
    id: '7',
    desafioNome: 'Fibonacci',
    dataHora: '26/05/2025 • 16:20',
    acertou: false,
    pontos: 0,
  },
];

const FILTROS: { key: FiltroHistorico; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'acertos', label: 'Acertos' },
  { key: 'erros', label: 'Erros' },
];

export function HistoricoScreen() {
  const insets = useSafeAreaInsets();
  const [filtro, setFiltro] = useState<FiltroHistorico>('todos');

  const listaFiltrada = useMemo(() => {
    if (filtro === 'todos') return MOCK_TENTATIVAS;
    if (filtro === 'acertos') {
      return MOCK_TENTATIVAS.filter((t) => t.acertou);
    }
    return MOCK_TENTATIVAS.filter((t) => !t.acertou);
  }, [filtro]);

  const renderItem: ListRenderItem<HistoricoItem> = ({ item }) => (
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
          {item.desafioNome}
        </Text>
        <Text style={styles.itemData}>{item.dataHora}</Text>
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
