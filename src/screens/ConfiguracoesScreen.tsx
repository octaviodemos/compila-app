import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { type Href, useRouter } from 'expo-router';
import { sendPasswordResetEmail, signOut } from 'firebase/auth';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily } from '@src/constants/typography';
import { useAppTheme } from '@src/hooks/useAppTheme';
import { useAuth } from '@src/hooks/useAuth';
import { useTestarNotificacao } from '@src/hooks/useTestarNotificacao';
import { useThemeColors } from '@src/hooks/useTheme';
import { getUserProfile } from '@src/services/challenges';
import { mensagemErroAuth } from '@src/services/firebaseAuthErrors';
import { auth } from '@src/services/firebase';
import type { UserPlano } from '@src/types';
import type { TemaPreferencia } from '@src/theme/ThemeContext';

const VERSAO_APP = '1.0.0';
const COR_PERIGO = '#EF4444';
const COR_SUCESSO = '#22C55E';

const OPCOES_TEMA: {
  id: TemaPreferencia;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'auto', label: 'Automático', icon: 'phone-portrait-outline' },
  { id: 'light', label: 'Claro', icon: 'sunny-outline' },
  { id: 'dark', label: 'Escuro', icon: 'moon-outline' },
];

function confirmarSaida(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || typeof window.confirm !== 'function') {
      return Promise.resolve(true);
    }
    return Promise.resolve(window.confirm('Tem certeza que deseja sair?'));
  }
  return new Promise((resolve) => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}

export function ConfiguracoesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const { tema, setTema } = useAppTheme();
  const { user } = useAuth();
  const { enviar, carregando, mensagem, erro } = useTestarNotificacao();
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [plano, setPlano] = useState<UserPlano>('free');

  const email = user?.email ?? '—';
  const planoLabel = plano === 'pro' ? 'Pro 👑' : 'Gratuito';

  const carregarPlano = useCallback(async () => {
    if (!user?.uid) {
      setPlano('free');
      return;
    }
    try {
      const perfil = await getUserProfile(user.uid);
      setPlano(perfil?.plano ?? 'free');
    } catch {
      setPlano('free');
    }
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      carregarPlano();
    }, [carregarPlano])
  );

  function onVoltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/' as Href);
    }
  }

  function irParaTermos() {
    router.push('/termos' as Href);
  }

  function irParaPlanos() {
    router.push('/planos' as Href);
  }

  async function aoAlterarSenha() {
    if (resetLoading) return;
    setResetMessage('');
    setResetError('');
    if (!auth || !user?.email) {
      setResetError('Não foi possível identificar seu e-mail.');
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetMessage('E-mail de redefinição enviado!');
    } catch (e: unknown) {
      const codigo =
        typeof e === 'object' &&
        e !== null &&
        'code' in e &&
        typeof (e as { code: unknown }).code === 'string'
          ? (e as { code: string }).code
          : '';
      setResetError(mensagemErroAuth(codigo));
    } finally {
      setResetLoading(false);
    }
  }

  async function aoSair() {
    if (signOutLoading) return;
    const confirmado = await confirmarSaida();
    if (!confirmado) return;
    if (!auth) {
      router.replace('/login' as Href);
      return;
    }
    setSignOutLoading(true);
    try {
      await signOut(auth);
      router.replace('/login' as Href);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Não foi possível sair agora.';
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.alert(msg);
        }
      } else {
        Alert.alert('Erro', msg);
      }
    } finally {
      setSignOutLoading(false);
    }
  }

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingBottom: 24,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      minHeight: 48,
      marginBottom: 20,
      backgroundColor: colors.background,
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
    sectionLabel: {
      paddingHorizontal: 20,
      marginTop: 16,
      marginBottom: 10,
      fontFamily: fontFamily.semibold,
      fontSize: 12,
      letterSpacing: 0.8,
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    sectionCard: {
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: 14,
      overflow: 'hidden',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderSubtle,
      minHeight: 56,
    },
    itemLast: {
      borderBottomWidth: 0,
    },
    itemPressed: {
      backgroundColor: colors.borderSubtle,
    },
    itemDisabled: {
      opacity: 0.6,
    },
    itemBody: {
      flex: 1,
      minWidth: 0,
    },
    itemLabel: {
      fontFamily: fontFamily.semibold,
      fontSize: 15,
      color: colors.text,
    },
    itemValue: {
      fontFamily: fontFamily.regular,
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    itemMessageOk: {
      fontFamily: fontFamily.regular,
      fontSize: 12,
      color: COR_SUCESSO,
      marginTop: 4,
    },
    itemMessageErr: {
      fontFamily: fontFamily.regular,
      fontSize: 12,
      color: COR_PERIGO,
      marginTop: 4,
    },
    itemLeading: {
      width: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chevron: {
      marginLeft: 4,
    },
    signOutCard: {
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: 14,
      overflow: 'hidden',
    },
    signOutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      minHeight: 52,
    },
    signOutBtnPressed: {
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
    },
    signOutBtnText: {
      fontFamily: fontFamily.semibold,
      fontSize: 15,
      color: COR_PERIGO,
    },
  });

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={onVoltar}
            hitSlop={12}
            style={styles.headerSide}
            accessibilityLabel="Voltar"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Configurações</Text>
          <View style={styles.headerSide} />
        </View>

        <Text style={styles.sectionLabel}>Conta</Text>
        <View style={styles.sectionCard}>
          <View style={styles.item}>
            <View style={styles.itemLeading}>
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemLabel}>E-mail</Text>
              <Text style={styles.itemValue} numberOfLines={1}>
                {email}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={irParaPlanos}
            style={({ pressed }) => [
              styles.item,
              pressed && styles.itemPressed,
            ]}
          >
            <View style={styles.itemLeading}>
              <Ionicons
                name="diamond-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemLabel}>Plano atual</Text>
              <Text style={styles.itemValue}>{planoLabel}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
              style={styles.chevron}
            />
          </Pressable>

          <Pressable
            onPress={aoAlterarSenha}
            disabled={resetLoading || !user?.email}
            style={({ pressed }) => [
              styles.item,
              styles.itemLast,
              pressed && styles.itemPressed,
              (resetLoading || !user?.email) && styles.itemDisabled,
            ]}
          >
            <View style={styles.itemLeading}>
              <Ionicons
                name="key-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemLabel}>Alterar senha</Text>
              <Text style={styles.itemValue}>
                Enviamos um link de redefinição para seu e-mail
              </Text>
              {resetMessage ? (
                <Text style={styles.itemMessageOk}>{resetMessage}</Text>
              ) : null}
              {resetError ? (
                <Text style={styles.itemMessageErr}>{resetError}</Text>
              ) : null}
            </View>
            {resetLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textSecondary}
                style={styles.chevron}
              />
            )}
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Aparência</Text>
        <View style={styles.sectionCard}>
          {OPCOES_TEMA.map((opcao, index) => {
            const ativo = tema === opcao.id;
            const ultimo = index === OPCOES_TEMA.length - 1;
            return (
              <Pressable
                key={opcao.id}
                onPress={() => setTema(opcao.id)}
                style={({ pressed }) => [
                  styles.item,
                  ultimo && styles.itemLast,
                  pressed && styles.itemPressed,
                ]}
              >
                <View style={styles.itemLeading}>
                  <Ionicons
                    name={opcao.icon}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.itemBody}>
                  <Text style={styles.itemLabel}>{opcao.label}</Text>
                </View>
                {ativo ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.primary}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Sobre</Text>
        <View style={styles.sectionCard}>
          <View style={styles.item}>
            <View style={styles.itemLeading}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemLabel}>Versão</Text>
              <Text style={styles.itemValue}>{VERSAO_APP}</Text>
            </View>
          </View>

          <Pressable
            onPress={irParaTermos}
            style={({ pressed }) => [
              styles.item,
              styles.itemLast,
              pressed && styles.itemPressed,
            ]}
          >
            <View style={styles.itemLeading}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemLabel}>Termos de uso</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
              style={styles.chevron}
            />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>🧪 Teste de Notificações</Text>
        <View style={styles.sectionCard}>
          <Pressable
            onPress={enviar}
            disabled={carregando}
            style={({ pressed }) => [
              styles.item,
              styles.itemLast,
              pressed && styles.itemPressed,
              carregando && styles.itemDisabled,
            ]}
          >
            <View style={styles.itemLeading}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemLabel}>Enviar Notificação de Teste</Text>
              <Text style={styles.itemValue}>
                Clique para receber uma notificação de teste
              </Text>
              {mensagem ? (
                <Text style={styles.itemMessageOk}>{mensagem}</Text>
              ) : null}
              {erro ? (
                <Text style={styles.itemMessageErr}>{erro}</Text>
              ) : null}
            </View>
            {carregando ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textSecondary}
                style={styles.chevron}
              />
            )}
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Sair</Text>
        <View style={styles.signOutCard}>
          <Pressable
            onPress={aoSair}
            disabled={signOutLoading}
            style={({ pressed }) => [
              styles.signOutBtn,
              pressed && styles.signOutBtnPressed,
              signOutLoading && styles.itemDisabled,
            ]}
            accessibilityLabel="Sair da conta"
          >
            {signOutLoading ? (
              <ActivityIndicator color={COR_PERIGO} />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color={COR_PERIGO} />
                <Text style={styles.signOutBtnText}>Sair da conta</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
