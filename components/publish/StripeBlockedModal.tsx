import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  loading: boolean;
  onGoSettings: () => void;
  onRefresh: () => void;
};

export default function StripeBlockedModal({
  visible,
  loading,
  onGoSettings,
  onRefresh,
}: Props) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>Ative seus recebimentos</Text>
        <Text style={styles.description}>
          Para publicar fotos, sua conta Stripe precisa estar conectada e com
          recebimentos habilitados.
        </Text>

        <Pressable
          onPress={onGoSettings}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Ir para configurações</Text>
        </Pressable>

        <Pressable
          onPress={onRefresh}
          disabled={loading}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && !loading && styles.pressed,
            loading && styles.disabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#121212" />
          ) : (
            <Text style={styles.secondaryButtonText}>Atualizar status</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.86)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 100,
  },
  modal: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    backgroundColor: "#171717",
    padding: 22,
    alignItems: "center",
  },
  title: {
    color: "#F5F5F5",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    color: "#B8B8B8",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 20,
  },
  primaryButton: {
    width: "100%",
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#EE9734",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#121212",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    width: "100%",
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#121212",
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.8,
  },
});
