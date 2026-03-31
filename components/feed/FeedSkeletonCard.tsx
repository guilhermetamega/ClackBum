import { StyleSheet, View } from "react-native";

export default function FeedSkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header} />
      <View style={styles.image} />
      <View style={styles.footer} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#1A1A1A",
  },
  header: {
    height: 64,
    backgroundColor: "#242424",
  },
  image: {
    width: "100%",
    aspectRatio: 1.02,
    backgroundColor: "#2A2A2A",
  },
  footer: {
    height: 62,
    backgroundColor: "#242424",
  },
});
