import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/src/theme/colors';
import { fontFamily } from '@/src/theme/typography';

const MOCK_DESAFIO = {
  titulo: 'Soma dos Dígitos',
  descricao:
    'Dado um número inteiro positivo N, calcule a soma de todos os seus dígitos e imprima o resultado.',
  pontos: 10,
  badgeEnergia: 100,
  exemplos: [
    { entrada: '123', saida: '6' },
    { entrada: '9999', saida: '36' },
    { entrada: '5', saida: '5' },
  ],
} as const;

const MONO_FONT = Platform.OS === 'android' ? 'monospace' : 'Courier';

export function DesafiosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [resposta, setResposta] = useState('');

  const onVoltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 12 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={[styles.headerCol, styles.headerColStart]}>
            <Pressable onPress={onVoltar} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          </View>
          <View style={[styles.headerCol, styles.headerColCenter]}>
            <Text style={styles.headerTitle}>Desafio</Text>
          </View>
          <View style={[styles.headerCol, styles.headerColEnd]}>
            <View style={styles.energyPill}>
              <Text style={styles.energyEmoji}>⚡</Text>
              <Text style={styles.energyNum}>
                {MOCK_DESAFIO.badgeEnergia}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.badgesRow}>
          <View style={styles.diffBadge}>
            <Text style={styles.diffBadgeText}>FÁCIL</Text>
          </View>
          <View style={styles.ptsPill}>
            <Text style={styles.ptsPillText}>{MOCK_DESAFIO.pontos} pts</Text>
          </View>
        </View>

        <Text style={styles.challengeTitle}>{MOCK_DESAFIO.titulo}</Text>
        <Text style={styles.challengeDesc}>{MOCK_DESAFIO.descricao}</Text>

        <Text style={styles.sectionLabel}>Exemplos</Text>
        <View style={styles.examplesCard}>
          {MOCK_DESAFIO.exemplos.map((ex, index) => (
            <View
              key={`${ex.entrada}-${ex.saida}`}
              style={[
                styles.exampleBlock,
                index < MOCK_DESAFIO.exemplos.length - 1 &&
                  styles.exampleBlockSep,
              ]}
            >
              <View style={styles.ioLine}>
                <Text style={styles.labelEntrada}>Entrada:</Text>
                <Text style={styles.valorIo}>{ex.entrada}</Text>
              </View>
              <View style={[styles.ioLine, styles.ioLineSecond]}>
                <Text style={styles.labelSaida}>Saída:</Text>
                <Text style={styles.valorIo}>{ex.saida}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, styles.labelResposta]}>
          Sua resposta
        </Text>
        <TextInput
          style={styles.input}
          multiline
          value={resposta}
          onChangeText={setResposta}
          placeholder="// Digite sua resposta aqui..."
          placeholderTextColor={colors.textSecondary}
          textAlignVertical="top"
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 12,
            paddingTop: 12,
          },
        ]}
      >
        <View style={styles.footerActions}>
          <Pressable style={[styles.btnDica, { flex: 1 }]}>
            <Text style={styles.btnDicaText}>💡 Dica</Text>
          </Pressable>
          <Pressable style={[styles.btnEnviar, { flex: 2 }]}>
            <Text style={styles.btnEnviarText}>Enviar resposta</Text>
            <Text style={styles.btnEnviarChevron}> ›</Text>
            <Ionicons name="send" size={16} color={colors.text} />
          </Pressable>
        </View>
        <Text style={styles.footerHint}>
          🔒 Você pode enviar quantas vezes quiser
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 44,
  },
  headerCol: {
    flex: 1,
    justifyContent: 'center',
  },
  headerColStart: {
    alignItems: 'flex-start',
  },
  headerColCenter: {
    alignItems: 'center',
  },
  headerColEnd: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 17,
    color: colors.text,
  },
  energyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 4,
  },
  energyEmoji: {
    fontSize: 13,
  },
  energyNum: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: '#0F0F14',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  ptsPill: {
    backgroundColor: '#252530',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  ptsPillText: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  challengeTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: colors.text,
    marginBottom: 10,
  },
  challengeDesc: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
  },
  labelResposta: {
    marginTop: 8,
  },
  examplesCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  exampleBlock: {
    paddingBottom: 0,
  },
  exampleBlockSep: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 14,
    marginBottom: 14,
  },
  ioLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  ioLineSecond: {
    marginTop: 8,
  },
  labelEntrada: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    color: '#4ADE80',
  },
  labelSaida: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    color: '#A78BFA',
  },
  valorIo: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.text,
    flexShrink: 1,
  },
  input: {
    minHeight: 120,
    backgroundColor: colors.card,
    color: colors.text,
    fontFamily: MONO_FONT,
    fontSize: 14,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 20,
    backgroundColor: colors.background,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  btnDica: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDicaText: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    color: colors.primary,
  },
  btnEnviar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 4,
  },
  btnEnviarText: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    color: colors.text,
  },
  btnEnviarChevron: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    color: colors.text,
  },
  footerHint: {
    marginTop: 10,
    textAlign: 'center',
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
  },
});
