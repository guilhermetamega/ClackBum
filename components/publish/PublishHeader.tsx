import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type PublishHeaderTheme = {
  text: string;
  textSoft: string;
};

function getTheme(
  colorScheme: "light" | "dark" | null | undefined,
): PublishHeaderTheme {
  const isDark = colorScheme === "dark";

  return {
    text: isDark ? "#F5F5F5" : "#121212",
    textSoft: isDark ? "#B8B8B8" : "#6B7280",
  };
}

export default function PublishHeader() {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Publicar foto</Text>
      <Text style={[styles.subtitle, { color: theme.textSoft }]}>
        Envie sua imagem, defina o valor e deixe o restante com a moderação.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
