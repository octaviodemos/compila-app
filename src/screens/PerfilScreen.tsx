import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { type Href, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
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
  updateUserProfile,
  type UserPublicProfile,
} from '@src/services/challenges';

const GRID_H_PAD = 20;
const GRID_GAPS_TOTAL = 32;
const BIO_PADRAO = 'Bora compilar o futuro! 🚀';
const COR_CIRCULO_BLOQUEADO = '#2D2D3A';

export function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const colors = useThemeColors();
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [totalAcertos, setTotalAcertos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

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

  const conqItemWidth = (screenWidth - 40 - GRID_GAPS_TOTAL) / 3;

  function irParaConfiguracoes() {
    router.push('/configuracoes' as Href);
  }

  function abrirEdicao() {
    if (!profile) return;
    setEditUsername(profile.username);
    setEditBio(profile.bio);
    setSaveError('');
    setEditOpen(true);
  }

  function cancelarEdicao() {
    if (saving) return;
    setEditOpen(false);
    setSaveError('');
  }

  async function salvarEdicao() {
    if (!user?.uid || !profile) return;
    const nome = editUsername.trim();
    if (nome.length < 3) {
      setSaveError('O nome de usuário precisa de pelo menos 3 caracteres.');
      return;
    }
    setSaveError('');
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { username: nome, bio: editBio });
      setProfile({ ...profile, username: nome, bio: editBio.trim() });
      setEditOpen(false);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Não foi possível salvar agora.';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function aoCompartilhar() {
    const pts = profile?.pontuacao ?? 0;
    const seq = profile?.sequencia ?? 0;
    try {
      await Share.share({
        message: `Estou no Compila com ${pts} pontos e sequência de ${seq} dias! 🔥 Bora aprender programação juntos?`,
        title: 'Compila - Desafios de Programação',
      });
    } catch {
      // ignora cancelamento ou falta de suporte ao share
    }
  }

  const styles = StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: GRID_H_PAD,
    },
    centeredFill: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
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
    modalLabel: {
      fontFamily: fontFamily.semibold,
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 6,
    },
    modalInput: {
      backgroundColor: colors.background,
      color: colors.text,
      fontFamily: fontFamily.regular,
      fontSize: 15,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    modalInputBio: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    modalError: {
      fontFamily: fontFamily.regular,
      fontSize: 13,
      color: '#F87171',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 6,
    },
    modalBtn: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    modalBtnCancel: {
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    modalBtnSave: {
      backgroundColor: colors.primary,
    },
    modalBtnDisabled: {
      opacity: 0.6,
    },
    modalBtnText: {
      fontFamily: fontFamily.semibold,
      fontSize: 14,
      color: colors.text,
    },
    modalBtnTextCancel: {
      color: colors.textSecondary,
    },
  });

  if (loading) {
    return (
      <View style={styles.centeredFill}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const usernameMostrado = profile?.username || 'usuário';
  const bioMostrada = profile?.bio?.trim() || BIO_PADRAO;
  const pontuacao = profile?.pontuacao ?? 0;
  const sequencia = profile?.sequencia ?? 0;

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable
            hitSlop={12}
            onPress={irParaConfiguracoes}
            accessibilityLabel="Abrir configurações"
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </Pressable>
          <Pressable
            hitSlop={12}
            onPress={aoCompartilhar}
            accessibilityLabel="Compartilhar perfil"
          >
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Ionicons name="code-slash" size={40} color={colors.text} />
          </View>
          <View style={styles.usernameRow}>
            <Text style={styles.username}>{usernameMostrado}</Text>
            <Pressable
              hitSlop={8}
              style={styles.pencilBtn}
              onPress={abrirEdicao}
              disabled={!profile}
            >
              <Ionicons name="pencil" size={16} color={colors.primary} />
            </Pressable>
          </View>
          <Text style={styles.bio}>{bioMostrada}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pontuação total</Text>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statValue}>
              {pontuacao.toLocaleString('pt-BR')}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Sequência atual</Text>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>
              {sequencia} {sequencia === 1 ? 'dia' : 'dias'}
            </Text>
          </View>
        </View>

        <View style={styles.conqHeader}>
          <Text style={styles.conqTitle}>Conquistas</Text>
          <Pressable>
            <Text style={styles.conqVerTudo}>Ver todas ›</Text>
          </Pressable>
        </View>

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
              <Text style={styles.conqDesc} numberOfLines={2}>
                {c.descricao}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={editOpen}
        transparent
        animationType="fade"
        onRequestClose={cancelarEdicao}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar perfil</Text>

            <View>
              <Text style={styles.modalLabel}>Nome de usuário</Text>
              <TextInput
                style={styles.modalInput}
                value={editUsername}
                onChangeText={setEditUsername}
                placeholder="seu_usuario"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!saving}
                maxLength={32}
              />
            </View>

            <View>
              <Text style={styles.modalLabel}>Bio</Text>
              <TextInput
                style={[styles.modalInput, styles.modalInputBio]}
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Conte um pouco sobre você"
                placeholderTextColor={colors.textSecondary}
                multiline
                editable={!saving}
                maxLength={140}
              />
            </View>

            {saveError ? (
              <Text style={styles.modalError}>{saveError}</Text>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable
                style={[
                  styles.modalBtn,
                  styles.modalBtnCancel,
                  saving && styles.modalBtnDisabled,
                ]}
                onPress={cancelarEdicao}
                disabled={saving}
              >
                <Text style={[styles.modalBtnText, styles.modalBtnTextCancel]}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalBtn,
                  styles.modalBtnSave,
                  saving && styles.modalBtnDisabled,
                ]}
                onPress={salvarEdicao}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={styles.modalBtnText}>Salvar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
