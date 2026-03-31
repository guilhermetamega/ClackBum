import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function PublishScreenSkeleton() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#EE9734" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
  },
});
