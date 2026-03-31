import type { ProfileTab } from "@/types/profile";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  activeTab: ProfileTab;
  isDark: boolean;
  onChange: (tab: ProfileTab) => void;
};

export default function ProfileTabs({ activeTab, isDark, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onChange("own")}
        style={[
          styles.tab,
          activeTab === "own"
            ? styles.tabActive
            : { backgroundColor: isDark ? "#262626" : "#E7E7E7" },
        ]}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "own"
              ? styles.tabTextActive
              : { color: isDark ? "#EE9734" : "#1E4563" },
          ]}
        >
          Minhas fotos
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChange("purchases")}
        style={[
          styles.tab,
          activeTab === "purchases"
            ? styles.tabActive
            : { backgroundColor: isDark ? "#262626" : "#E7E7E7" },
        ]}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "purchases"
              ? styles.tabTextActive
              : { color: isDark ? "#EE9734" : "#1E4563" },
          ]}
        >
          Compras
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    minHeight: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: "#EE9734",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  tabTextActive: {
    color: "#121212",
  },
});
