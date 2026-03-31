import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

type SkeletonTheme = {
  background: string;
  loader: string;
};

function getTheme(
  colorScheme: "light" | "dark" | null | undefined,
): SkeletonTheme {
  const isDark = colorScheme === "dark";

  return {
    background: isDark ? "#121212" : "#F5F5F5",
    loader: "#EE9734",
  };
}

export default function PublishScreenSkeleton() {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
