import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  balance: number;
  balancePending: number;
  balanceLoading: boolean;
  isDark: boolean;
  onRefreshBalance: () => void;
  onOpenSettings: () => void;
  onWithdrawPress: () => void;
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProfileHeader({
  balance,
  balancePending,
  balanceLoading,
  isDark,
  onRefreshBalance,
  onOpenSettings,
  onWithdrawPress,
}: Props) {
  const bg = isDark ? "#121212" : "#F5F5F5";
  const brand = isDark ? "#F5F5F5" : "#121212";
  const settingsBg = isDark ? "#111111" : "#FFFFFF";
  const blue = "#1E4563";
  const orange = "#EE9734";

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={styles.brandRow}>
        <View style={styles.logoWrap}>
          <Image
            source={require("@/assets/images/icon.png")}
            resizeMode="contain"
            style={styles.logo}
          />
          <Text style={[styles.logoText, { color: brand }]}>CLACKBUM</Text>
        </View>

        <Pressable
          onPress={onOpenSettings}
          style={[styles.settingsButton, { backgroundColor: settingsBg }]}
        >
          <Ionicons name="settings-outline" size={24} color={orange} />
        </Pressable>
      </View>

      <View style={styles.metricsRow}>
        <Pressable onPress={onWithdrawPress} style={styles.earningsCard}>
          <Ionicons name="wallet-outline" size={26} color="#F5F5F5" />
          <Text style={styles.earningsLabel}>Sacar ganhos</Text>
        </Pressable>

        <View style={styles.balanceCard}>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceHeading}>Disponível</Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={styles.balanceValue}
            >
              {formatCurrency(balance)}
            </Text>
          </View>

          <View style={styles.balanceInfo}>
            <Text style={styles.balanceHeading}>Pendente</Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={styles.balanceValue}
            >
              {formatCurrency(balancePending)}
            </Text>
          </View>

          <Pressable
            onPress={onRefreshBalance}
            disabled={balanceLoading}
            style={styles.refreshButton}
          >
            <Ionicons
              name="refresh-outline"
              size={40}
              color={blue}
              style={balanceLoading ? styles.dimmed : undefined}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    gap: 14,
  },
  logo: {
    width: 48,
    height: 48,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoWrap: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "500",
    fontFamily: "Koulen-Regular",
    marginTop: 6,
  },
  settingsButton: {
    width: 54,
    height: 54,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#EE9734",
    alignItems: "center",
    justifyContent: "center",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  earningsCard: {
    width: 82,
    borderRadius: 20,
    backgroundColor: "#1E4563",
    paddingHorizontal: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  earningsLabel: {
    color: "#F5F5F5",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    textTransform: "uppercase",
  },
  balanceCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: "#EE9734",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    fontFamily: "Koulen-Regular",
  },
  balanceInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceHeading: {
    color: "#F5F5F5",
    fontSize: 16,
    fontWeight: "300",
    textTransform: "uppercase",
    fontFamily: "Koulen-Regular",
  },
  balanceValue: {
    color: "#1E4563",
    fontSize: 26,
    fontWeight: "900",
    fontFamily: "Koulen-Regular",
  },
  refreshButton: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  dimmed: {
    opacity: 0.6,
  },
});
