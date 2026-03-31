import { Download, ShoppingCart } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  actionMode: "buy" | "download" | "owner";
  priceLabel: string;
  buying: boolean;
  isDark: boolean;
  onBuy: () => void;
  onDownload: () => void;
};

export default function PhotoDetailsActions({
  actionMode,
  priceLabel,
  buying,
  isDark,
  onBuy,
  onDownload,
}: Props) {
  if (actionMode === "owner") {
    return null;
  }

  const isDownload = actionMode === "download";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0A0A0A" : "#FFFFFF" },
      ]}
    >
      <Pressable
        disabled={buying}
        onPress={isDownload ? onDownload : onBuy}
        style={({ pressed }) => [
          styles.button,
          isDownload ? styles.downloadButton : styles.buyButton,
          pressed && !buying && styles.pressed,
          buying && styles.disabled,
        ]}
      >
        {buying ? (
          <ActivityIndicator color="#121212" />
        ) : isDownload ? (
          <>
            <Download size={22} color="#121212" strokeWidth={2.3} />
            <Text style={styles.buttonText}>Download</Text>
          </>
        ) : (
          <>
            <ShoppingCart size={22} color="#121212" strokeWidth={2.3} />
            <Text style={styles.buttonText}>Comprar por {priceLabel}</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 22,
  },
  button: {
    minHeight: 54,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buyButton: {
    backgroundColor: "#EE9734",
  },
  downloadButton: {
    backgroundColor: "#22C55E",
  },
  buttonText: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  pressed: {
    opacity: 0.95,
  },
  disabled: {
    opacity: 0.7,
  },
});
