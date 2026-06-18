import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform, useColorScheme } from 'react-native';

export type TemaPreferencia = 'auto' | 'light' | 'dark';
export type TemaEfetivo = 'light' | 'dark';

const STORAGE_KEY = 'tema';

type ThemeContextValue = {
  tema: TemaPreferencia;
  setTema: (tema: TemaPreferencia) => void;
  temaEfetivo: TemaEfetivo;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  tema: 'auto',
  setTema: () => {},
  temaEfetivo: 'light',
  ready: false,
});

function parseTema(valor: string | null): TemaPreferencia | null {
  if (valor === 'auto' || valor === 'light' || valor === 'dark') {
    return valor;
  }
  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [tema, setTemaState] = useState<TemaPreferencia>('auto');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((valor) => {
        const salvo = parseTema(valor);
        if (salvo) {
          setTemaState(salvo);
          return;
        }
        return AsyncStorage.getItem('@compila/color-scheme').then((legado) => {
          if (legado === 'light' || legado === 'dark') {
            setTemaState(legado);
          }
        });
      })
      .finally(() => setReady(true));
  }, []);

  const setTema = useCallback((novoTema: TemaPreferencia) => {
    setTemaState(novoTema);
    AsyncStorage.setItem(STORAGE_KEY, novoTema).catch(() => {});
  }, []);

  const temaEfetivo: TemaEfetivo = useMemo(() => {
    if (tema === 'auto') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return tema;
  }, [tema, systemScheme]);

  const value = useMemo(
    () => ({ tema, setTema, temaEfetivo, ready }),
    [tema, setTema, temaEfetivo, ready]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useWebBodyBackground(backgroundColor: string) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.body.style.backgroundColor = backgroundColor;
  }, [backgroundColor]);
}
