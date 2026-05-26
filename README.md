# Compila

Aplicativo de desafios diários de programação. O usuário recebe um desafio por dia,
envia a resposta (código ou texto) e tem o resultado avaliado por um LLM, com
feedback em português e atribuição de pontos. Histórico, ranking e perfil ficam
sincronizados no Firestore.

Construído com **Expo (React Native + Web)**, **TypeScript**, **Firebase
Auth/Firestore** e **AI SDK da Vercel** integrado ao **Google Gemini**.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Pré-requisitos](#pré-requisitos)
- [Configuração](#configuração)
  - [Variáveis de ambiente](#variáveis-de-ambiente)
  - [Firebase](#firebase)
  - [Chave do Gemini](#chave-do-gemini)
- [Executando](#executando)
- [Modelo de dados (Firestore)](#modelo-de-dados-firestore)
- [Padrões do projeto](#padrões-do-projeto)
- [Aliases de import](#aliases-de-import)
- [Scripts](#scripts)

---

## Funcionalidades

- **Autenticação** com e-mail/senha (Firebase Auth).
- **Desafio do dia** carregado do Firestore (`getTodayChallenge`).
- **Avaliação automática** da resposta via Gemini (`evaluateAnswer`), retornando
  `correct`, `feedback` e `points`.
- **Persistência de tentativas** por usuário (subcoleção `users/{uid}/attempts`).
- **Pontuação acumulada** no documento do usuário (`pontuacao` somada com
  `increment`).
- **Histórico** de tentativas com data, pontos e acerto.
- **Perfil** com nome de exibição e pontuação total.
- **Tema escuro** com fonte Inter (`@expo-google-fonts/inter`).
- **Roteamento** com `expo-router` (file-based, tipado).
- Suporte a **Android**, **iOS** e **Web** pelo mesmo bundler (Metro).

---

## Stack

| Camada            | Tecnologia                                       |
| ----------------- | ------------------------------------------------ |
| App               | Expo SDK 54, React Native 0.81, React 19         |
| Linguagem         | TypeScript (strict)                              |
| Rotas             | expo-router 6                                    |
| Auth + DB         | Firebase Auth + Cloud Firestore                  |
| LLM               | AI SDK (`ai`) + `@ai-sdk/google` (`gemini-2.0-flash-lite`) |
| Estilo            | StyleSheet do React Native, fonte Inter          |
| Aliases           | `babel-plugin-module-resolver` + `tsconfig.paths` |

---

## Estrutura de pastas

```
compila-app/
├─ app/                   # Rotas (expo-router)
│  ├─ _layout.tsx         # Stack raiz + auth gate
│  ├─ login.tsx
│  ├─ cadastro.tsx
│  └─ (tabs)/             # Tab navigator
│     ├─ _layout.tsx
│     ├─ index.tsx        # Início
│     ├─ desafio.tsx
│     ├─ historico.tsx
│     └─ perfil.tsx
├─ src/
│  ├─ components/         # AppText, Text, View, ExternalLink
│  ├─ constants/          # theme, typography
│  ├─ contexts/           # ThemeConfigContext
│  ├─ hooks/              # useAuth, useTheme, useThemeColor
│  ├─ screens/            # Telas reais (consumidas pelas rotas)
│  ├─ services/
│  │  ├─ firebase.ts      # Inicialização do Firebase
│  │  ├─ firebaseAuthErrors.ts
│  │  ├─ challenges.ts    # getTodayChallenge, saveAttempt, etc.
│  │  └─ gemini.ts        # evaluateAnswer (AI SDK + Gemini)
│  ├─ types/              # Tipos compartilhados
│  └─ utils/              # Helpers de UI
├─ assets/                # Ícones, splash, imagens
├─ app.json               # Config Expo
├─ babel.config.js        # Presets + aliases
├─ tsconfig.json          # Paths e strict
└─ .env(.example)
```

---

## Pré-requisitos

- **Node.js** 20 LTS ou superior.
- **npm** (vem com o Node).
- **Expo CLI**: usado via `npx expo …` (não precisa instalar global).
- Para rodar nativo:
  - **Android**: Android Studio + emulador, ou Expo Go no dispositivo físico.
  - **iOS** (apenas em macOS): Xcode + simulador, ou Expo Go.
- Conta no **Firebase** (gratuita).
- Conta no **Google AI Studio** para gerar a chave do Gemini (gratuita).

---

## Configuração

### Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
EXPO_PUBLIC_LLM_API_KEY=
```

Observações importantes:

- O Expo só injeta variáveis `EXPO_PUBLIC_*` no bundle do cliente — outras
  variáveis ficam invisíveis em runtime no app.
- Mudanças no `.env` só entram em vigor após **reiniciar o Metro**
  (`Ctrl+C` no terminal do `npm start` e rodar de novo).
- Nunca comite `.env` com chaves reais. Confirme que está no `.gitignore`.

### Firebase

1. Crie um projeto em https://console.firebase.google.com.
2. Habilite **Authentication → Sign-in method → Email/Password**.
3. Crie um **Firestore Database** (modo de produção ou teste).
4. Em **Project settings → General → Your apps**, registre um **Web app**
   e copie as credenciais para o `.env`.
5. Defina regras de segurança mínimas no Firestore (exemplo permissivo apenas
   para desenvolvimento — ajuste antes de publicar):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /challenges/{id} {
         allow read: if request.auth != null;
       }
       match /users/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
         match /attempts/{attemptId} {
           allow read, write: if request.auth != null && request.auth.uid == uid;
         }
       }
     }
   }
   ```

### Chave do Gemini

1. Acesse https://aistudio.google.com/apikey.
2. Faça login e clique em **Create API key** (pode criar em um projeto novo).
3. Copie a chave (`AIzaSy…`) para `EXPO_PUBLIC_LLM_API_KEY` no `.env`.
4. O modelo padrão é `gemini-2.0-flash-lite` (cota mais generosa no free tier).
   Para trocar, edite `src/services/gemini.ts`.

---

## Executando

Instale as dependências:

```bash
npm install
```

Suba o Metro / Expo Dev Server:

```bash
npm start
```

Atalhos diretos:

```bash
npm run android   # abre no emulador/dispositivo Android
npm run ios       # abre no simulador iOS (macOS)
npm run web       # abre no navegador
```

Com o Metro rodando, pressione `a`, `i` ou `w` no terminal para abrir as
plataformas correspondentes; ou escaneie o QR code com o app **Expo Go**.

---

## Modelo de dados (Firestore)

### `challenges/{id}`

| Campo         | Tipo                                         | Descrição                                    |
| ------------- | -------------------------------------------- | -------------------------------------------- |
| `titulo`      | string                                       | Título do desafio                            |
| `descricao`   | string                                       | Enunciado                                    |
| `exemplos`    | array `{ entrada, saida }` ou string         | Pares de exemplo (ver formato abaixo)        |
| `dificuldade` | `'facil' \| 'medio' \| 'dificil'`            | —                                            |
| `pontos`      | number                                       | Pontuação máxima ao acertar                  |
| `language`    | `'javascript' \| 'python'`                   | Linguagem alvo                               |
| `ativo`       | boolean                                      | Apenas `true` aparece em `getTodayChallenge` |
| `criadoEm`    | timestamp                                    | Usado para ordenar                           |

O campo `exemplos` aceita duas formas (mantém compatibilidade com documentos
antigos):

- **Array de objetos**: `[ { entrada: '123', saida: '6' } ]`.
- **String** no formato: `"Entrada: 123 → Saída: 6 | Entrada: 9999 → Saída: 36"`
  (pares separados por ` | ` e campos por ` → `).

### `users/{uid}`

| Campo          | Tipo   | Descrição                       |
| -------------- | ------ | ------------------------------- |
| `nomeExibicao` | string | Nome mostrado no perfil/ranking |
| `email`        | string | E-mail do usuário               |
| `pontuacao`    | number | Soma das tentativas corretas    |

### `users/{uid}/attempts/{id}`

| Campo         | Tipo      | Descrição                              |
| ------------- | --------- | -------------------------------------- |
| `challengeId` | string    | Id do desafio respondido               |
| `titulo`      | string    | Snapshot do título no momento          |
| `acertou`     | boolean   | Resultado de `evaluateAnswer.correct`  |
| `pontos`      | number    | Pontos ganhos                          |
| `feedback`    | string    | Texto do feedback do LLM               |
| `resposta`    | string    | Conteúdo enviado pelo usuário          |
| `criadoEm`    | timestamp | `serverTimestamp()`                    |

---

## Padrões do projeto

- **Nomenclatura**
  - `PascalCase` para componentes, métodos públicos e propriedades de models.
  - `camelCase` para variáveis locais e funções utilitárias.
- **Sem comentários**: o código deve se explicar pelos nomes. Use constantes
  com nome semântico em vez de notas no código.
- **Tipagem estrita**: `tsconfig.strict = true`. Evite `any`; prefira
  `unknown` + narrowing.
- **Services**: toda integração externa (Firebase, Gemini, etc.) fica em
  `src/services`. Telas não chamam SDKs diretamente.
- **Estilos**: `StyleSheet.create` próximos ao componente; cores via
  `useThemeColors()`.

---

## Aliases de import

Configurados no `babel.config.js` e replicados em `tsconfig.json`:

| Alias          | Aponta para         |
| -------------- | ------------------- |
| `@src/*`       | `./src/*`           |
| `@components/*`| `./src/components/*`|
| `@hooks/*`     | `./src/hooks/*`     |
| `@services/*`  | `./src/services/*`  |
| `@constants/*` | `./src/constants/*` |
| `@types/*`     | `./src/types/*`     |
| `@/*`          | `./*` (raiz)        |

Exemplo:

```ts
import type { Challenge } from '@src/types';
import { evaluateAnswer } from '@src/services/gemini';
```

---

## Scripts

| Comando         | O que faz                                    |
| --------------- | -------------------------------------------- |
| `npm start`     | `expo start` (Metro Dev Server)              |
| `npm run android` | Abre no Android                            |
| `npm run ios`   | Abre no iOS (apenas macOS)                   |
| `npm run web`   | Abre no navegador                            |
| `npx tsc --noEmit` | Type-check sem gerar saída                |

---

## Licença

Projeto privado de uso interno. Defina a licença antes de publicar.
