

export type ThemeConfig = {
    colors: ThemeColors;
};

export type ThemeColors = { light: ThemeColorSet, dark: ThemeColorSet };

export type ThemeColorSet = {
    text: string;
    background: string;
    primary: string;
    tint: string;
    card: string;
    accent: string;
    textSecondary: string;
    tabIconDefault: string;
    tabIconSelected: string;
    surface: string;
    border: string;
    borderSubtle: string;
}
