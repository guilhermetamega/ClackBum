import { Image, StyleSheet, View } from "react-native";

type Props = {
  imageUrl: string;
  isDark: boolean;
  isDesktop: boolean;
};

export default function PhotoDetailsHero({
  imageUrl,
  isDark,
  isDesktop,
}: Props) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#D9D9D9" : "#E5E7EB",
          borderRadius: isDesktop ? 26 : 24,
        },
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
    overflow: "hidden",
    width: "100%",
    flex: 1,
    minHeight: 280,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
