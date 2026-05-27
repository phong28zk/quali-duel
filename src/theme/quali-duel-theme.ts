import { createTheme } from '@mui/material/styles';

export const qualiDuelPalette = {
  graphite: '#0b0f14',
  panelCharcoal: '#121821',
  quietLine: '#2a3442',
  textSmoke: '#d7dee7',
  telemetryBlue: '#6ec8ff',
  gainLime: '#b7ff2a',
  brakingAmber: '#ffb02e',
  alertRed: '#ff5a5f',
} as const;

export const qualiDuelTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: qualiDuelPalette.graphite,
      paper: qualiDuelPalette.panelCharcoal,
    },
    text: {
      primary: qualiDuelPalette.textSmoke,
      secondary: 'rgba(215, 222, 231, 0.72)',
    },
    primary: {
      main: qualiDuelPalette.telemetryBlue,
      contrastText: qualiDuelPalette.graphite,
    },
    secondary: {
      main: qualiDuelPalette.gainLime,
      contrastText: qualiDuelPalette.graphite,
    },
    warning: { main: qualiDuelPalette.brakingAmber },
    error: { main: qualiDuelPalette.alertRed },
    divider: qualiDuelPalette.quietLine,
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily:
      "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    h1: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05 },
    h2: { fontWeight: 700, letterSpacing: '-0.015em' },
    overline: { letterSpacing: '0.18em', fontWeight: 600 },
    body1: { fontSize: 15 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${qualiDuelPalette.quietLine}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
  },
});
