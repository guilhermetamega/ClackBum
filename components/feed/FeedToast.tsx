import type { FeedToast as FeedToastType } from "@/types/feed";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  toast: FeedToastType | null;
};

export default function FeedToast({ toast }: Props) {
  if (!toast) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: toast.type === "success" ? "#16A34A" : "#DC2626",
        },
      ]}
    >
      <Text style={styles.text}>{toast.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  text: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_700Bold",
  },
});
