import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  contentWidth: number;
};

export default function FeedHeader({ contentWidth }: Props) {
  const brand = "#F5F5F5";
  return (
    <View style={styles.logoWrap}>
      <Image
        source={require("@/assets/images/icon.png")}
        resizeMode="contain"
        style={styles.logo}
      />
      <Text style={[styles.logoText, { color: brand }]}>CLACKBUM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 72,
    height: 72,
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
    fontSize: 48,
    fontWeight: "500",
    fontFamily: "Koulen-Regular",
    marginTop: 16,
  },
});
