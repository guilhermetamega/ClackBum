import type { ProfilePhoto } from "@/types/profile";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  item: ProfilePhoto;
  isDark: boolean;
  onDownload: (photo: ProfilePhoto) => void;
};

export default function ProfilePurchaseCard({
  item,
  isDark,
  onDownload,
}: Props) {
  return (
    <View
      style={[styles.card, { backgroundColor: isDark ? "#E9E9E9" : "#FFFFFF" }]}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.footer}>
        <Text numberOfLines={1} style={styles.title}>
          {item.title}
        </Text>

        <Pressable
          style={styles.downloadButton}
          onPress={() => onDownload(item)}
        >
          <Ionicons name="download-outline" size={18} color="#121212" />
          <Text style={styles.downloadText}>Download</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 260,
    backgroundColor: "#D7D7D7",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  downloadButton: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: "#EE9734",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  downloadText: {
    color: "#121212",
    fontSize: 14,
    fontWeight: "900",
  },
});
