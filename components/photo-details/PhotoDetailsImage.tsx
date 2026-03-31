import { Image, StyleSheet, View } from "react-native";

type Props = {
  imageUrl: string;
  isDark: boolean;
};

export default function PhotoDetailsImage({ imageUrl, isDark }: Props) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#474747" : "#D8D8D8" },
      ]}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 1.08,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
