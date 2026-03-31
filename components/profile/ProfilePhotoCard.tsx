import { getVisibilityConfig } from "@/services/profile";
import type { ProfilePhoto } from "@/types/profile";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  item: ProfilePhoto;
  isDark: boolean;
  onShare: (photo: ProfilePhoto) => void;
  onOpenMenu: (photo: ProfilePhoto) => void;
};

export default function ProfilePhotoCard({
  item,
  isDark,
  onShare,
  onOpenMenu,
}: Props) {
  const visibility = getVisibilityConfig(item.visibility ?? "private");
  const shareDisabled = item.visibility === "private";

  return (
    <View
      style={[styles.card, { backgroundColor: isDark ? "#E9E9E9" : "#FFFFFF" }]}
    >
      <View style={styles.topActions}>
        <Pressable
          disabled={shareDisabled}
          style={[
            styles.iconButton,
            shareDisabled && styles.iconButtonDisabled,
          ]}
          onPress={() => onShare(item)}
        >
          <Ionicons name="share-social-outline" size={20} color="#121212" />
        </Pressable>

        <Pressable style={styles.iconButton} onPress={() => onOpenMenu(item)}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#121212" />
        </Pressable>
      </View>

      <View
        style={[styles.visibilityBadge, { backgroundColor: visibility.color }]}
      >
        <Ionicons name={visibility.icon} size={13} color="#121212" />
        <Text style={styles.visibilityText}>{visibility.label}</Text>
      </View>

      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.footer}>
        <Text numberOfLines={1} style={styles.title}>
          {item.title}
        </Text>
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
  topActions: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 3,
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonDisabled: {
    opacity: 0.45,
  },
  visibilityBadge: {
    position: "absolute",
    bottom: 74,
    left: 12,
    zIndex: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  visibilityText: {
    color: "#121212",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  image: {
    width: "100%",
    height: 260,
    backgroundColor: "#D7D7D7",
  },
  footer: {
    minHeight: 62,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  title: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
