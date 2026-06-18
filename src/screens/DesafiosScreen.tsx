import { Ionicons } from '@expo/vector-icons';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily } from '@src/constants/typography';
import { useAuth } from '@src/hooks/useAuth';
import { useThemeColors } from '@src/hooks/useTheme';
import {
  getChallengeById,
  getTodayChallenge,
  getUserProfile,
  getUserPontuacao,
  normalizarUserPlano,
  saveAttempt,
} from '@src/services/challenges';
import { evaluateAnswer } from '@src/services/gemini';
import { checkCanAttempt } from '@src/services/planRestrictions';
import type { Challenge, UserPlano } from '@src/types';
import {
  gerarDicaDesafio,
  labelDificuldade,
  textoAceitaMultiplasLinguagens,
  textoRespostaMultiLinguagem,
} from '@src/utils/challengeUi';

const MONO_FONT = Platform.OS === 'android' ? 'monospace' : 'Courier';

export function DesafiosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ challengeId?: string | string[] }>();
  const challengeIdParam = Array.isArray(params.challengeId)
    ? params.challengeId[0]
    : params.challengeId;
  const { user } = useAuth();
  const colors = useThemeColors();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [pontuacao, setPontuacao] = useState(0);
  const [resposta, setResposta] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackOk, setFeedbackOk] = useState<boolean | null>(null);
  const [feedbackPoints, setFeedbackPoints] = useState<number | null>(null);
  const [dicaOpen, setDicaOpen] = useState(false);
  const [plano, setPlano] = useState<UserPlano>('free');
  const [planoCarregado, setPlanoCarregado] = useState(false);
  const [restricaoOpen, setRestricaoOpen] = useState(false);
  const [restricaoReason, setRestricaoReason] = useState('');

  const completou = feedbackOk === true;
  const errouUltima = feedbackOk === false;

  const carregar = useCallback(async () => {
    setLoadingChallenge(true);
    setLoadError('');
    setPlanoCarregado(false);
    try {
      let userPlano: UserPlano = 'free';
      if (user?.uid) {
        const [pts, perfil] = await Promise.all([
          getUserPontuacao(user.uid),
          getUserProfile(user.uid),
        ]);
        setPontuacao(pts);
        userPlano = normalizarUserPlano(perfil?.plano);
        console.log('plano usuario:', userPlano);
        setPlano(userPlano);
      } else {
        setPlano('free');
      }

      let ch: Challenge | null = null;
      if (challengeIdParam) {
        ch = await getChallengeById(challengeIdParam);
      }
      if (!ch) {
        ch = await getTodayChallenge(userPlano);
      }
      setChallenge(ch);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Não foi possível carregar o desafio.';
      setLoadError(msg);
      setChallenge(null);
      setPlano('free');
    } finally {
      setPlanoCarregado(true);
      setLoadingChallenge(false);
    }
  }, [user?.uid, challengeIdParam]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const onVoltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/' as Href);
    }
  };

  function irParaPlanos() {
    setRestricaoOpen(false);
    router.push('/planos' as Href);
  }

  async function aoEnviar() {
    if (!user?.uid || !challenge) return;

    const permissao = await checkCanAttempt(
      user.uid,
      challenge.dificuldade,
      challenge.id
    );
    if (!permissao.allowed) {
      setRestricaoReason(
        permissao.reason ?? 'Este recurso requer o plano Pro.'
      );
      setRestricaoOpen(true);
      return;
    }

    setFeedbackText('');
    setFeedbackOk(null);
    setFeedbackPoints(null);
    setSubmitting(true);
    try {
      const result = await evaluateAnswer(challenge, resposta);
      await saveAttempt(user.uid, challenge, resposta, result);
      setFeedbackText(result.feedback);
      setFeedbackOk(result.correct);
      setFeedbackPoints(result.points);
      if (result.correct) {
        setPontuacao((p) => p + result.points);
      }
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Erro ao avaliar. Tente novamente.';
      setFeedbackText(msg);
      setFeedbackOk(false);
      setFeedbackPoints(null);
    } finally {
      setSubmitting(false);
    }
  }

  function aoTentarNovamente() {
    setFeedbackText('');
    setFeedbackOk(null);
    setFeedbackPoints(null);
  }

  function abrirDica() {
    setDicaOpen(true);
  }

  function fecharDica() {
    setDicaOpen(false);
  }

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorPad: {
      paddingHorizontal: 24,
    },
    errorTitle: {
      fontFamily: fontFamily.regular,
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    retryBtn: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    retryBtnText: {
      fontFamily: fontFamily.semibold,
      fontSize: 14,
      color: colors.primary,
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
      backgroundColor: colors.card,
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
      marginBottom: 16,
    },
    langsBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 12,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    langsBannerText: {
      flex: 1,
      fontFamily: fontFamily.regular,
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    respostaHint: {
      fontFamily: fontFamily.regular,
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 8,
      lineHeight: 18,
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
      borderBottomColor: colors.borderSubtle,
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
    feedbackBox: {
      marginTop: 8,
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      gap: 10,
    },
    feedbackOk: {
      borderColor: 'rgba(74, 222, 128, 0.35)',
    },
    feedbackErr: {
      borderColor: 'rgba(248, 113, 113, 0.35)',
    },
    feedbackHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    feedbackBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    feedbackBadgeOk: {
      backgroundColor: 'rgba(74, 222, 128, 0.18)',
    },
    feedbackBadgeErr: {
      backgroundColor: 'rgba(248, 113, 113, 0.18)',
    },
    feedbackBadgeText: {
      fontFamily: fontFamily.semibold,
      fontSize: 12,
      letterSpacing: 0.3,
    },
    feedbackBadgeTextOk: {
      color: '#4ADE80',
    },
    feedbackBadgeTextErr: {
      color: '#F87171',
    },
    feedbackText: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    feedbackTryAgain: {
      alignSelf: 'flex-start',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    feedbackTryAgainText: {
      fontFamily: fontFamily.semibold,
      fontSize: 13,
      color: colors.primary,
    },
    completedHint: {
      marginTop: 12,
      padding: 14,
      borderRadius: 12,
      backgroundColor: 'rgba(124, 58, 237, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(124, 58, 237, 0.35)',
    },
    completedHintText: {
      fontFamily: fontFamily.semibold,
      fontSize: 14,
      color: colors.text,
      textAlign: 'center',
    },
    completedHintSub: {
      fontFamily: fontFamily.regular,
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.borderSubtle,
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
      minHeight: 48,
    },
    btnDisabled: {
      opacity: 0.7,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    modalCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      gap: 14,
    },
    modalTitle: {
      fontFamily: fontFamily.bold,
      fontSize: 18,
      color: colors.text,
    },
    modalText: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    modalBtn: {
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: colors.primary,
      marginTop: 4,
    },
    modalBtnText: {
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

  if (loadingChallenge || !planoCarregado) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (loadError || !challenge) {
    return (
      <View style={[styles.root, styles.centered, styles.errorPad]}>
        <Text style={styles.errorTitle}>
          {loadError || 'Nenhum desafio ativo no momento.'}
        </Text>
        <Pressable style={styles.retryBtn} onPress={carregar}>
          <Text style={styles.retryBtnText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  const exemplos = challenge.exemplos;
  const textoDica = gerarDicaDesafio(challenge);

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
              <Text style={styles.energyNum}>{pontuacao}</Text>
            </View>
          </View>
        </View>

        <View style={styles.badgesRow}>
          <View style={styles.diffBadge}>
            <Text style={styles.diffBadgeText}>
              {labelDificuldade(challenge.dificuldade)}
            </Text>
          </View>
          <View style={styles.ptsPill}>
            <Text style={styles.ptsPillText}>{challenge.pontos} pts</Text>
          </View>
        </View>

        <Text style={styles.challengeTitle}>{challenge.titulo}</Text>
        <Text style={styles.challengeDesc}>{challenge.descricao}</Text>

        <View style={styles.langsBanner}>
          <Ionicons name="code-slash" size={18} color={colors.primary} />
          <Text style={styles.langsBannerText}>
            {textoAceitaMultiplasLinguagens()}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Exemplos</Text>
        <View style={styles.examplesCard}>
          {exemplos.map((ex, index) => (
            <View
              key={`${ex.entrada}-${ex.saida}-${index}`}
              style={[
                styles.exampleBlock,
                index < exemplos.length - 1 && styles.exampleBlockSep,
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
        <Text style={styles.respostaHint}>{textoRespostaMultiLinguagem()}</Text>
        <TextInput
          style={styles.input}
          multiline
          value={resposta}
          onChangeText={setResposta}
          placeholder="// C, Kotlin, Python, JavaScript..."
          placeholderTextColor={colors.textSecondary}
          textAlignVertical="top"
          editable={!submitting && !completou}
        />

        {feedbackText ? (
          <View
            style={[
              styles.feedbackBox,
              completou && styles.feedbackOk,
              errouUltima && styles.feedbackErr,
            ]}
          >
            <View style={styles.feedbackHeader}>
              <View
                style={[
                  styles.feedbackBadge,
                  completou
                    ? styles.feedbackBadgeOk
                    : styles.feedbackBadgeErr,
                ]}
              >
                <Ionicons
                  name={completou ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={completou ? '#4ADE80' : '#F87171'}
                />
                <Text
                  style={[
                    styles.feedbackBadgeText,
                    completou
                      ? styles.feedbackBadgeTextOk
                      : styles.feedbackBadgeTextErr,
                  ]}
                >
                  {completou
                    ? `Acertou +${feedbackPoints ?? 0} pts`
                    : `Incorreto — ${feedbackPoints ?? 0} pts`}
                </Text>
              </View>
            </View>
            <Text style={styles.feedbackText}>{feedbackText}</Text>
            {errouUltima ? (
              <Pressable
                style={styles.feedbackTryAgain}
                onPress={aoTentarNovamente}
              >
                <Text style={styles.feedbackTryAgainText}>Tentar novamente</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {completou ? (
          <View style={styles.completedHint}>
            <Text style={styles.completedHintText}>
              Você concluiu o desafio de hoje!
            </Text>
            <Text style={styles.completedHintSub}>
              Volte amanhã para um novo desafio.
            </Text>
          </View>
        ) : null}
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
          {completou ? (
            <Pressable
              style={[styles.btnEnviar, { flex: 1 }]}
              onPress={onVoltar}
            >
              <Ionicons name="home" size={16} color={colors.text} />
              <Text style={styles.btnEnviarText}>Voltar ao início</Text>
            </Pressable>
          ) : (
            <>
              <Pressable style={[styles.btnDica, { flex: 1 }]} onPress={abrirDica}>
                <Text style={styles.btnDicaText}>💡 Dica</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.btnEnviar,
                  { flex: 2 },
                  submitting && styles.btnDisabled,
                ]}
                onPress={aoEnviar}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <>
                    <Text style={styles.btnEnviarText}>Enviar resposta</Text>
                    <Text style={styles.btnEnviarChevron}> ›</Text>
                    <Ionicons name="send" size={16} color={colors.text} />
                  </>
                )}
              </Pressable>
            </>
          )}
        </View>
        {!completou ? (
          <Text style={styles.footerHint}>
            🔒 Você pode enviar quantas vezes quiser
          </Text>
        ) : null}
      </View>

      <Modal
        visible={dicaOpen}
        transparent
        animationType="fade"
        onRequestClose={fecharDica}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>💡 Dica</Text>
            <Text style={styles.modalText}>{textoDica}</Text>
            <Pressable style={styles.modalBtn} onPress={fecharDica}>
              <Text style={styles.modalBtnText}>Entendi</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={restricaoOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRestricaoOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Limite do plano gratuito</Text>
            <Text style={styles.modalText}>{restricaoReason}</Text>
            <Pressable style={styles.modalBtn} onPress={irParaPlanos}>
              <Text style={styles.modalBtnText}>Seja Pro</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
