import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMemo } from "react";
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

type PublishFormTheme = {
  label: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
};

function getTheme(
  colorScheme: "light" | "dark" | null | undefined,
): PublishFormTheme {
  const isDark = colorScheme === "dark";

  return {
    label: isDark ? "#F5F5F5" : "#121212",
    inputBg: isDark ? "#191919" : "#FFFFFF",
    inputBorder: isDark ? "#2A2A2A" : "#E5E7EB",
    inputText: isDark ? "#F5F5F5" : "#121212",
    placeholder: isDark ? "#7A7A7A" : "#9CA3AF",
  };
}

function FieldLabel({ children, color }: { children: string; color: string }) {
  return <Text style={[styles.label, { color }]}>{children}</Text>;
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
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);

  return (
    <View style={styles.container}>
      <View style={styles.group}>
        <FieldLabel color={theme.label}>Título</FieldLabel>
        <TextInput
          value={title}
          onChangeText={onChangeTitle}
          placeholder="Ex.: Vista da comunidade ao pôr do sol"
          placeholderTextColor={theme.placeholder}
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder,
              color: theme.inputText,
            },
          ]}
        />
      </View>

      <View style={styles.group}>
        <FieldLabel color={theme.label}>Descrição</FieldLabel>
        <TextInput
          value={description}
          onChangeText={onChangeDescription}
          placeholder="Conte um pouco sobre a foto"
          placeholderTextColor={theme.placeholder}
          multiline
          textAlignVertical="top"
          style={[
            styles.input,
            styles.textarea,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder,
              color: theme.inputText,
            },
          ]}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.group, styles.rowItem]}>
          <FieldLabel color={theme.label}>Preço</FieldLabel>
          <TextInput
            value={price}
            onChangeText={onChangePrice}
            placeholder="0,00"
            placeholderTextColor={theme.placeholder}
            keyboardType="decimal-pad"
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              },
            ]}
          />
        </View>

        <View style={[styles.group, styles.rowItem]}>
          <FieldLabel color={theme.label}>Tags</FieldLabel>
          <TextInput
            value={tagsText}
            onChangeText={onChangeTags}
            placeholder="favela, arte, rua"
            placeholderTextColor={theme.placeholder}
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.inputText,
              },
            ]}
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
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  textarea: {
    minHeight: 108,
    paddingTop: 16,
    paddingBottom: 16,
  },
});
