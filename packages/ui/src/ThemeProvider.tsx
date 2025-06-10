import {
  ThemeProvider as MUIThemeProvider,
  type ThemeProviderProps as _ThemeProviderProps,
} from "@mui/material/styles";
import theme from "./theme";

type ThemeProviderProps = Omit<_ThemeProviderProps, "theme">;

export const ThemeProvider = (props: ThemeProviderProps) => {
  return <MUIThemeProvider theme={theme} {...props} />;
};
