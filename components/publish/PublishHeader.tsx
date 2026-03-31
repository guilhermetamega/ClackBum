import { StyleSheet, Text, View } from "react-native";

export default function PublishHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Publicar foto</Text>
      <Text style={styles.subtitle}>
        Envie sua imagem, defina o valor e deixe o restante com a moderação.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F5F5F5",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#B8B8B8",
  },
});
