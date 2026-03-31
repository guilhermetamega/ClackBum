import { Platform } from "react-native";

const tintColorLight = "#0F172A";
const tintColorDark = "#F8FAFC";

export const Colors = {
  light: {
    text: "#101828",
    textMuted: "#667085",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceAlt: "#F2F4F7",
    border: "#E4E7EC",
    tint: tintColorLight,
    icon: "#667085",
    tabIconDefault: "#98A2B3",
    tabIconSelected: "#EE9734",
    primary: "#EE9734",
    primaryText: "#1C1917",
    success: "#16A34A",
    onSuccess: "#FFFFFF",
    danger: "#DC2626",
    onDanger: "#FFFFFF",
  },
  dark: {
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    background: "#020617",
    surface: "#0F172A",
    surfaceAlt: "#111C31",
    border: "#1E293B",
    tint: tintColorDark,
    icon: "#94A3B8",
    tabIconDefault: "#64748B",
    tabIconSelected: "#EE9734",
    primary: "#EE9734",
    primaryText: "#1C1917",
    success: "#22C55E",
    onSuccess: "#04130A",
    danger: "#EF4444",
    onDanger: "#200909",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
