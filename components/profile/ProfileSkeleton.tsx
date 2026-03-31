import { ActivityIndicator, StyleSheet, View } from "react-native";

type Props = {
  isDark: boolean;
};

export default function ProfileSkeleton({ isDark }: Props) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#F5F5F5" },
      ]}
    >
      <ActivityIndicator size="large" color="#EE9734" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
