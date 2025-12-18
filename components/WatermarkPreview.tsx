import React, { forwardRef } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  uri: string;
};

const WatermarkPreview = forwardRef<View, Props>(({ uri }, ref) => {
  return (
    <View ref={ref} collapsable={false} style={styles.container}>
      <Image source={{ uri }} style={styles.image} />

      <Text style={styles.watermark}>© MeuApp</Text>
    </View>
  );
});

WatermarkPreview.displayName = "WatermarkPreview";

export default WatermarkPreview;

const styles = StyleSheet.create({
  container: {
    width: 1200,
    height: 800,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  watermark: {
    position: "absolute",
    bottom: 20,
    right: 20,
    color: "rgba(255,255,255,0.5)",
    fontSize: 32,
    fontWeight: "900",
  },
});
