import { Image, StyleSheet, View } from "react-native";

type Props = {
  contentWidth: number;
};

export default function FeedHeader({ contentWidth }: Props) {
  return (
    <View style={[styles.wrapper, { width: contentWidth }]}>
      <Image
        source={require("@/assets/images/icon.png")}
        resizeMode="contain"
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 10,
  },
  logo: {
    width: 210,
    height: 72,
  },
});
