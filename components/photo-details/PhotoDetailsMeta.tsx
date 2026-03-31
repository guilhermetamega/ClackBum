import { UserRound } from "lucide-react-native";
import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  userName: string | null;
  userAvatarUrl: string | null;
  tags: string[];
  description: string;
  isDark: boolean;
};

export default function PhotoDetailsMeta({
  userName,
  userAvatarUrl,
  tags,
  description,
  isDark,
}: Props) {
  const textColor = isDark ? "#F5F5F5" : "#121212";
  const muted = isDark ? "#B8B8B8" : "#4B5563";
  const cardBg = isDark ? "#0A0A0A" : "#FFFFFF";

  const fallbackAvatar =
    "https://ui-avatars.com/api/?background=EE9734&color=121212&name=" +
    encodeURIComponent(userName || "ClackBum");

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      <View style={styles.authorRow}>
        {userAvatarUrl ? (
          <Image source={{ uri: userAvatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <UserRound size={20} color="#EE9734" strokeWidth={2.2} />
          </View>
        )}

        <Text
          numberOfLines={1}
          style={[styles.authorName, { color: textColor }]}
        >
          {userName || "Autor desconhecido"}
        </Text>
      </View>

      {tags.length > 0 ? (
        <Text style={styles.tagsText}>{tags.join(" ")}</Text>
      ) : null}

      {description ? (
        <Text style={[styles.description, { color: muted }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#EE9734",
  },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#EE9734",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
  },
  authorName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  tagsText: {
    color: "#06B6D4",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
  },
});
