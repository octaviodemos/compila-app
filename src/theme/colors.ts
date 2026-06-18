import { lightColors } from './lightColors';

export type AppColors = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  accent: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
  surface: string;
  border: string;
  borderSubtle: string;
};

export const darkColors: AppColors = {
  text: '#FFFFFF',
  background: '#0F0F14',
  card: '#1A1A24',
  primary: '#7C3AED',
  accent: '#F59E0B',
  textSecondary: '#6B7280',
  tint: '#7C3AED',
  tabIconDefault: '#6B7280',
  tabIconSelected: '#7C3AED',
  surface: '#2D2D3A',
  border: 'rgba(255, 255, 255, 0.08)',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
};

export function getColors(tema: 'light' | 'dark'): AppColors {
  return tema === 'light' ? lightColors : darkColors;
}
