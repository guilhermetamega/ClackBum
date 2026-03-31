import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  loading: boolean;
  onGoSettings: () => void;
  onRefresh: () => void;
};

type StripeBlockedModalTheme = {
  overlay: string;
  modal: string;
  border: string;
  title: string;
  description: string;
  primaryBg: string;
  primaryText: string;
  secondaryBg: string;
  secondaryBorder: string;
  secondaryText: string;
};

function getTheme(
  colorScheme: "light" | "dark" | null | undefined,
): StripeBlockedModalTheme {
  const isDark = colorScheme === "dark";

  return {
    overlay: isDark ? "rgba(0,0,0,0.86)" : "rgba(18,18,18,0.38)",
    modal: isDark ? "#171717" : "#FFFFFF",
    border: isDark ? "#2A2A2A" : "#E5E7EB",
    title: isDark ? "#F5F5F5" : "#121212",
    description: isDark ? "#B8B8B8" : "#6B7280",
    primaryBg: "#EE9734",
    primaryText: "#121212",
    secondaryBg: isDark ? "#E5E7EB" : "#F3F4F6",
    secondaryBorder: isDark ? "#E5E7EB" : "#D1D5DB",
    secondaryText: "#121212",
  };
}

export default function StripeBlockedModal({
  visible,
  loading,
  onGoSettings,
  onRefresh,
}: Props) {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
      <View
        style={[
          styles.modal,
          {
            backgroundColor: theme.modal,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.title }]}>
          Ative seus recebimentos
        </Text>
        <Text style={[styles.description, { color: theme.description }]}>
          Para publicar fotos, sua conta Stripe precisa estar conectada e com
          recebimentos habilitados.
        </Text>

        <Pressable
          onPress={onGoSettings}
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: theme.primaryBg },
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[styles.primaryButtonText, { color: theme.primaryText }]}
          >
            Ir para configurações
          </Text>
        </Pressable>

        <Pressable
          onPress={onRefresh}
          disabled={loading}
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              backgroundColor: theme.secondaryBg,
              borderColor: theme.secondaryBorder,
            },
            pressed && !loading && styles.pressed,
            loading && styles.disabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={theme.secondaryText} />
          ) : (
            <Text
              style={[
                styles.secondaryButtonText,
                { color: theme.secondaryText },
              ]}
            >
              Atualizar status
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 100,
  },
  modal: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 20,
  },
  primaryButton: {
    width: "100%",
    minHeight: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    width: "100%",
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.8,
  },
});
