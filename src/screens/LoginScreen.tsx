import { Link, type Href } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { auth } from '@/src/services/firebase';
import { mensagemErroAuth } from '@/src/services/firebaseAuthErrors';
import { colors } from '@/src/theme/colors';
import { fontFamily } from '@/src/theme/typography';

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroMsg, setErroMsg] = useState('');
  const [erroEmail, setErroEmail] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function aoEntrar() {
    setErroMsg('');
    setErroEmail('');
    setErroSenha('');
    if (!email.trim()) {
      setErroEmail('Informe seu e-mail');
      return;
    }
    if (!senha) {
      setErroSenha('Informe sua senha');
      return;
    }
    if (!auth) {
      setErroMsg('Serviço de login indisponível. Configure o Firebase.');
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha);
    } catch (e: unknown) {
      const codigo =
        typeof e === 'object' &&
        e !== null &&
        'code' in e &&
        typeof (e as { code: unknown }).code === 'string'
          ? (e as { code: string }).code
          : '';
      setErroMsg(mensagemErroAuth(codigo));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 32,
            paddingBottom: insets.bottom + 32,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.logo}>Compila</Text>

        <View style={styles.grupoCampo}>
          <TextInput
            style={[styles.input, erroEmail ? styles.inputErro : null]}
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
          />
          {erroEmail ? (
            <Text style={styles.erroCampo}>{erroEmail}</Text>
          ) : null}
        </View>

        <View style={styles.grupoCampo}>
          <TextInput
            style={[styles.input, erroSenha ? styles.inputErro : null]}
            value={senha}
            onChangeText={setSenha}
            placeholder="Senha"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            autoCapitalize="none"
            editable={!submitting}
          />
          {erroSenha ? (
            <Text style={styles.erroCampo}>{erroSenha}</Text>
          ) : null}
        </View>

        {erroMsg ? <Text style={styles.erroGeral}>{erroMsg}</Text> : null}

        <Pressable
          style={[styles.botaoPrimario, submitting && styles.botaoDisabled]}
          onPress={aoEntrar}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.botaoPrimarioTexto}>Entrar</Text>
          )}
        </Pressable>

        <Link href={'/cadastro' as Href} asChild>
          <Pressable style={styles.linkWrap}>
            <Text style={styles.linkText}>
              Não tem conta? <Text style={styles.linkAccent}>Cadastrar-se</Text>
            </Text>
          </Pressable>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  logo: {
    fontFamily: fontFamily.bold,
    fontSize: 36,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  grupoCampo: {
    marginBottom: 14,
  },
  input: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  inputErro: {
    borderColor: '#F87171',
  },
  erroCampo: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: '#F87171',
    marginTop: 6,
  },
  erroGeral: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: '#F87171',
    marginBottom: 14,
    textAlign: 'center',
    marginTop: 2,
  },
  botaoPrimario: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
    minHeight: 52,
  },
  botaoDisabled: {
    opacity: 0.55,
  },
  botaoPrimarioTexto: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    color: colors.text,
  },
  linkWrap: {
    alignItems: 'center',
    marginTop: 24,
    padding: 12,
  },
  linkText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textSecondary,
  },
  linkAccent: {
    color: colors.primary,
    fontFamily: fontFamily.semibold,
  },
});
