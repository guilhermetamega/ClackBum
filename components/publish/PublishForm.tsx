import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  title: string;
  description: string;
  price: string;
  tagsText: string;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangePrice: (value: string) => void;
  onChangeTags: (value: string) => void;
};

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export default function PublishForm({
  title,
  description,
  price,
  tagsText,
  onChangeTitle,
  onChangeDescription,
  onChangePrice,
  onChangeTags,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.group}>
        <FieldLabel>Título</FieldLabel>
        <TextInput
          value={title}
          onChangeText={onChangeTitle}
          placeholder="Ex.: Vista da comunidade ao pôr do sol"
          placeholderTextColor="#7A7A7A"
          style={styles.input}
        />
      </View>

      <View style={styles.group}>
        <FieldLabel>Descrição</FieldLabel>
        <TextInput
          value={description}
          onChangeText={onChangeDescription}
          placeholder="Conte um pouco sobre a foto"
          placeholderTextColor="#7A7A7A"
          multiline
          textAlignVertical="top"
          style={[styles.input, styles.textarea]}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.group, styles.rowItem]}>
          <FieldLabel>Preço</FieldLabel>
          <TextInput
            value={price}
            onChangeText={onChangePrice}
            placeholder="0,00"
            placeholderTextColor="#7A7A7A"
            keyboardType="decimal-pad"
            style={styles.input}
          />
        </View>

        <View style={[styles.group, styles.rowItem]}>
          <FieldLabel>Tags</FieldLabel>
          <TextInput
            value={tagsText}
            onChangeText={onChangeTags}
            placeholder="favela, arte, rua"
            placeholderTextColor="#7A7A7A"
            style={styles.input}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 14,
  },
  group: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  label: {
    color: "#F5F5F5",
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: "#191919",
    color: "#F5F5F5",
    paddingHorizontal: 16,
    fontSize: 15,
  },
  textarea: {
    minHeight: 108,
    paddingTop: 16,
    paddingBottom: 16,
  },
});
