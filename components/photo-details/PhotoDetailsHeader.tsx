import { ArrowLeft } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  isDark: boolean;
  onBack: () => void;
};

export default function PhotoDetailsHeader({ title, isDark, onBack }: Props) {
  const textColor = isDark ? "#F5F5F5" : "#121212";
  const bg = isDark ? "#0A0A0A" : "#FFFFFF";

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <ArrowLeft size={22} color="#EE9734" strokeWidth={2.3} />
      </Pressable>

      <Text numberOfLines={1} style={[styles.title, { color: textColor }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#EE9734",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});
