import { UserRound } from "lucide-react-native";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  userName: string | null;
  userAvatarUrl: string | null;
  tags: string[];
  description: string;
  isDark: boolean;
  maxDescriptionHeight: number;
};

export default function PhotoDetailsInfo({
  title,
  userName,
  userAvatarUrl,
  tags,
  description,
  isDark,
  maxDescriptionHeight,
}: Props) {
  const titleColor = isDark ? "#F5F5F5" : "#121212";
  const textColor = isDark ? "#E5E7EB" : "#374151";
  const muted = isDark ? "#B8B8B8" : "#6B7280";
  const tagColor = "#06B6D4";
  const surface = isDark ? "#181818" : "#FFFFFF";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: surface,
        },
      ]}
    >
      <Text numberOfLines={2} style={[styles.title, { color: titleColor }]}>
        {title}
      </Text>

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
          style={[styles.authorName, { color: titleColor }]}
        >
          {userName || "Autor desconhecido"}
        </Text>
      </View>

      {tags.length > 0 ? (
        <Text numberOfLines={2} style={[styles.tags, { color: tagColor }]}>
          {tags.join(" ")}
        </Text>
      ) : null}

      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: maxDescriptionHeight }}
        contentContainerStyle={styles.descriptionScroll}
      >
        <Text style={[styles.description, { color: textColor || muted }]}>
          {description || "Sem descrição."}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    width: "100%",
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 14,
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
  tags: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: "600",
  },
  descriptionScroll: {
    paddingBottom: 2,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
  },
});
