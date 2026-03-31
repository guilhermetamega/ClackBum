import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  hasQuery: boolean;
  onResetSearch: () => void;
  contentWidth: number;
};

export default function FeedEmptyState({
  hasQuery,
  onResetSearch,
  contentWidth,
}: Props) {
  return (
    <View style={[styles.container, { width: contentWidth }]}>
      <Text style={styles.title}>
        {hasQuery ? "Nenhuma foto encontrada" : "Nenhuma foto publicada ainda"}
      </Text>

      <Text style={styles.description}>
        {hasQuery
          ? "A busca é local e instantânea. Limpe o termo ou carregue mais fotos descendo o feed."
          : "Quando novas fotos forem aprovadas, elas aparecerão aqui."}
      </Text>

      {hasQuery ? (
        <Pressable onPress={onResetSearch} style={styles.button}>
          <Text style={styles.buttonText}>Limpar busca</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
    marginTop: 18,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
    fontWeight: "700",
    color: "#F5F5F5",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    color: "#B8B8B8",
    maxWidth: 520,
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EE9734",
  },
});
