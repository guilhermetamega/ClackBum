import { Image as ImageIcon, ImagePlus } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  imageUri: string | null;
  onPress: () => void;
};

export default function PublishImagePicker({ imageUri, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <View style={styles.iconWrap}>
            <ImagePlus size={24} color="#EE9734" strokeWidth={2.2} />
          </View>
          <Text style={styles.title}>Selecionar imagem</Text>
          <Text style={styles.subtitle}>
            Escolha a foto que será enviada para moderação.
          </Text>
        </View>
      )}

      {imageUri ? (
        <View style={styles.changePill}>
          <ImageIcon size={16} color="#121212" strokeWidth={2.2} />
          <Text style={styles.changeText}>Trocar imagem</Text>
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
    backgroundColor: "#191919",
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
    backgroundColor: "rgba(238,151,52,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    color: "#F5F5F5",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#A1A1AA",
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
    backgroundColor: "#EE9734",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
  },
  changeText: {
    color: "#121212",
    fontSize: 13,
    fontWeight: "800",
  },
});
