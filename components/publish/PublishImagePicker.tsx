import { useColorScheme } from "@/hooks/use-color-scheme";
import { Image as ImageIcon, ImagePlus } from "lucide-react-native";
import { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  imageUri: string | null;
  onPress: () => void;
};

type PublishImagePickerTheme = {
  container: string;
  border: string;
  title: string;
  subtitle: string;
  iconBg: string;
  pillBg: string;
  pillText: string;
};

function getTheme(
  colorScheme: "light" | "dark" | null | undefined,
): PublishImagePickerTheme {
  const isDark = colorScheme === "dark";

  return {
    container: isDark ? "#191919" : "#FFFFFF",
    border: isDark ? "#2A2A2A" : "#E5E7EB",
    title: isDark ? "#F5F5F5" : "#121212",
    subtitle: isDark ? "#A1A1AA" : "#6B7280",
    iconBg: isDark ? "rgba(238,151,52,0.12)" : "#FFF2E2",
    pillBg: "#EE9734",
    pillText: "#121212",
  };
}

export default function PublishImagePicker({ imageUri, onPress }: Props) {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.container,
          borderColor: theme.border,
        },
        pressed && styles.pressed,
      ]}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <View style={[styles.iconWrap, { backgroundColor: theme.iconBg }]}>
            <ImagePlus size={24} color="#EE9734" strokeWidth={2.2} />
          </View>
          <Text style={[styles.title, { color: theme.title }]}>
            Selecionar imagem
          </Text>
          <Text style={[styles.subtitle, { color: theme.subtitle }]}>
            Escolha a foto que será enviada para moderação.
          </Text>
        </View>
      )}

      {imageUri ? (
        <View style={[styles.changePill, { backgroundColor: theme.pillBg }]}>
          <ImageIcon size={16} color={theme.pillText} strokeWidth={2.2} />
          <Text style={[styles.changeText, { color: theme.pillText }]}>
            Trocar imagem
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 260,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 18,
  },
  pressed: {
    opacity: 0.96,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  changePill: {
    position: "absolute",
    left: 16,
    bottom: 16,
    height: 38,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
  },
  changeText: {
    fontSize: 13,
    fontWeight: "800",
  },
});
