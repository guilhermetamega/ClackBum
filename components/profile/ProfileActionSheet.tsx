import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
  onMakePublic: () => void;
  onMakeUnlisted: () => void;
  onMakePrivate: () => void;
  onDelete: () => void;
};

function ActionRow({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={20} color={danger ? "#EF4444" : "#F5F5F5"} />
      <Text style={[styles.rowText, danger && styles.rowTextDanger]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function ProfileActionSheet({
  visible,
  isDark,
  onClose,
  onMakePublic,
  onMakeUnlisted,
  onMakePrivate,
  onDelete,
}: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: isDark ? "#171717" : "#FFFFFF" },
          ]}
          onPress={() => undefined}
        >
          <ActionRow
            icon="globe-outline"
            label="Tornar pública"
            onPress={onMakePublic}
          />
          <ActionRow
            icon="link-outline"
            label="Tornar não listada"
            onPress={onMakeUnlisted}
          />
          <ActionRow
            icon="lock-closed-outline"
            label="Tornar privada"
            onPress={onMakePrivate}
          />

          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? "#2F2F2F" : "#E7E7E7" },
            ]}
          />

          <ActionRow
            icon="trash-outline"
            label="Excluir foto"
            onPress={onDelete}
            danger
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.66)",
    justifyContent: "flex-end",
  },
  sheet: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 26,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowText: {
    color: "#F5F5F5",
    fontSize: 16,
    fontWeight: "700",
  },
  rowTextDanger: {
    color: "#EF4444",
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
});
