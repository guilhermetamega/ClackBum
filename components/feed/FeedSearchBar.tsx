import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
  contentWidth: number;
  placeholderTextColor?: string;
  inputTextColor?: string;
  iconColor?: string;
} & Pick<TextInputProps, "onSubmitEditing">;

const FeedSearchBar = forwardRef<TextInput, Props>(
  (
    {
      value,
      onChangeText,
      onClear,
      contentWidth,
      placeholderTextColor = "#33516E",
      inputTextColor = "#1E4563",
      iconColor = "#33516E",
      onSubmitEditing,
    },
    ref,
  ) => {
    return (
      <View style={[styles.wrapper, { width: contentWidth }]}>
        <View style={styles.container}>
          <Ionicons name="search-outline" size={24} color={iconColor} />

          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmitEditing}
            placeholder="Busque por título, autor ou tags"
            placeholderTextColor={placeholderTextColor}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            selectionColor="#1E4563"
            clearButtonMode="never"
            style={[styles.input, { color: inputTextColor }]}
          />

          {value.length > 0 ? (
            <Pressable
              onPress={onClear}
              hitSlop={10}
              style={({ pressed }) => [
                styles.clearButton,
                pressed && styles.clearButtonPressed,
              ]}
            >
              <Ionicons name="close-circle" size={20} color={iconColor} />
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  },
);

FeedSearchBar.displayName = "FeedSearchBar";

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "center",
  },
  container: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: "#F2F2F2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    includeFontPadding: false,
  },
  clearButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonPressed: {
    opacity: 0.7,
  },
});

export default FeedSearchBar;
