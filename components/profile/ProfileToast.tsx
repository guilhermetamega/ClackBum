import { StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  message: string;
  isDark: boolean;
};

export default function ProfileToast({ visible, message, isDark }: Props) {
  if (!visible) return null;

  return (
    <View
      style={[
        styles.toast,
        { backgroundColor: isDark ? "#121212" : "#1E4563" },
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  toastText: {
    color: "#F5F5F5",
    fontSize: 14,
    fontWeight: "800",
  },
});
