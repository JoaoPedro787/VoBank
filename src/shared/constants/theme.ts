import { DarkTheme, DefaultTheme, type Theme } from "expo-router";

export const NAV_THEME = {
  light: {
    background: "hsl(240 20% 96%)",
    border: "hsl(240 6% 90%)",
    card: "hsl(0 0% 100%)",
    notification: "hsl(3 100% 59%)",
    primary: "hsl(211 100% 50%)",
    text: "hsl(240 10% 4%)",
  },
  dark: {
    background: "hsl(240 10% 4%)",
    border: "hsl(240 4% 18%)",
    card: "hsl(240 5% 10%)",
    notification: "hsl(3 100% 59%)",
    primary: "hsl(211 100% 50%)",
    text: "hsl(0 0% 98%)",
  },
} as const;

export const LightNavTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...NAV_THEME.light,
  },
};

export const DarkNavTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    ...NAV_THEME.dark,
  },
};
