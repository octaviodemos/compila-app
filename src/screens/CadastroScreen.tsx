import { Link, type Href } from 'expo-router';
import {
    createUserWithEmailAndPassword,
    updateProfile,
} from 'firebase/auth';
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

import { fontFamily } from '@src/constants/typography';
import { useThemeColors } from '@src/hooks/useTheme';
import { createUser } from '@src/services/challenges';
import { auth, db } from '@src/services/firebase';
import { mensagemErroAuth } from '@src/services/firebaseAuthErrors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ErrosCadastro = {
  username?: string;
  email?: string;
  senha?: string;
  confirmar?: string;
};

function validarCamposCadastro(data: {
  username: string;
  email: string;
  senha: string;
  confirmar: string;
}): ErrosCadastro {
  const erros: ErrosCadastro = {};
  const nome = data.username.trim();
  if (!nome) {
    erros.username = 'Nome é obrigatório.';
  } else if (nome.length < 3) {
    erros.username = 'Mínimo 3 caracteres.';
  }

  const em = data.email.trim();
  if (!em) {
    erros.email = 'E-mail é obrigatório.';
  } else if (!EMAIL_REGEX.test(em)) {
    erros.email = 'Informe um e-mail válido.';
  }

  if (data.senha.length < 6) {
    erros.senha = 'Mínimo 6 caracteres.';
  }

  if (data.confirmar !== data.senha) {
    erros.confirmar = 'As senhas não conferem.';
  }

  return erros;
}

export function CadastroScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erros, setErros] = useState<ErrosCadastro>({});
  const [erroMsg, setErroMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function aoCriarConta() {
    setErroMsg('');
    const errosLocal = validarCamposCadastro({
      username,
      email,
      senha,
      confirmar,
    });
    setErros(errosLocal);
    if (Object.keys(errosLocal).length > 0) {
      return;
    }
    if (!auth || !db) {
      setErroMsg('Serviço indisponível. Configure o Firebase.');
      return;
    }

    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        senha
      );
      await updateProfile(cred.user, {
        displayName: username.trim(),
      });
      await createUser(cred.user.uid, {
        username: username.trim(),
        email: cred.user.email ?? email.trim(),
      });
    } catch (e: unknown) {
      const codigo =
        typeof e === 'object' &&
        e !== null &&
        'code' in e &&
        typeof (e as { code: unknown }).code === 'string'
          ? (e as { code: string }).code
          : '';
      if (codigo === 'permission-denied') {
        setErroMsg(
          'Não foi possível salvar o perfil. Verifique as regras do Firestore.'
        );
      } else {
        setErroMsg(mensagemErroAuth(codigo));
      }
    } finally {
      setSubmitting(false);
    }
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
    titulo: {
      fontFamily: fontFamily.bold,
      fontSize: 24,
      color: colors.text,
      marginBottom: 28,
      textAlign: 'center',
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
    dicaSenha: {
      fontFamily: fontFamily.regular,
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 6,
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

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 32,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titulo}>Criar conta</Text>

        <View style={styles.grupoCampo}>
          <TextInput
            style={[
              styles.input,
              erros.username ? styles.inputErro : null,
            ]}
            value={username}
            onChangeText={setUsername}
            placeholder="Nome de usuário"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
          />
          {erros.username ? (
            <Text style={styles.erroCampo}>{erros.username}</Text>
          ) : null}
        </View>

        <View style={styles.grupoCampo}>
          <TextInput
            style={[styles.input, erros.email ? styles.inputErro : null]}
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
          />
          {erros.email ? (
            <Text style={styles.erroCampo}>{erros.email}</Text>
          ) : null}
        </View>

        <View style={styles.grupoCampo}>
          <TextInput
            style={[styles.input, erros.senha ? styles.inputErro : null]}
            value={senha}
            onChangeText={setSenha}
            placeholder="Senha"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            autoCapitalize="none"
            editable={!submitting}
          />
          <Text style={styles.dicaSenha}>Mínimo 6 caracteres</Text>
          {erros.senha ? (
            <Text style={styles.erroCampo}>{erros.senha}</Text>
          ) : null}
        </View>

        <View style={styles.grupoCampo}>
          <TextInput
            style={[styles.input, erros.confirmar ? styles.inputErro : null]}
            value={confirmar}
            onChangeText={setConfirmar}
            placeholder="Confirmar senha"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            autoCapitalize="none"
            editable={!submitting}
          />
          {erros.confirmar ? (
            <Text style={styles.erroCampo}>{erros.confirmar}</Text>
          ) : null}
        </View>

        {erroMsg ? <Text style={styles.erroGeral}>{erroMsg}</Text> : null}

        <Pressable
          style={[styles.botaoPrimario, submitting && styles.botaoDisabled]}
          onPress={aoCriarConta}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.botaoPrimarioTexto}>Criar conta</Text>
          )}
        </Pressable>

        <Link href={'/login' as Href} asChild>
          <Pressable style={styles.linkWrap}>
            <Text style={styles.linkText}>
              Já tem conta?{' '}
              <Text style={styles.linkAccent}>Entrar</Text>
            </Text>
          </Pressable>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
