import PublishForm from "@/components/publish/PublishForm";
import PublishHeader from "@/components/publish/PublishHeader";
import PublishImagePicker from "@/components/publish/PublishImagePicker";
import PublishScreenSkeleton from "@/components/publish/PublishScreenSkeleton";
import StripeBlockedModal from "@/components/publish/StripeBlockedModal";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePublishController } from "@/hooks/usePublishController";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type PublishTheme = {
  screen: string;
  text: string;
  textSoft: string;
  primary: string;
  primaryText: string;
};

function getTheme(
  colorScheme: "light" | "dark" | null | undefined,
): PublishTheme {
  const isDark = colorScheme === "dark";

  return {
    screen: isDark ? "#121212" : "#F5F5F5",
    text: isDark ? "#F5F5F5" : "#121212",
    textSoft: isDark ? "#BDBDBD" : "#6B7280",
    primary: "#EE9734",
    primaryText: "#121212",
  };
}

export default function PublishScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);

  const {
    title,
    setTitle,
    description,
    setDescription,
    price,
    setPrice,
    tagsText,
    setTagsText,
    imageUri,
    checkingStripe,
    stripeBlocked,
    refreshingStripe,
    uploading,
    pickImage,
    handlePublish,
    checkStripeStatus,
  } = usePublishController();

  if (checkingStripe) {
    return <PublishScreenSkeleton />;
  }

  return (
    <>
      <KeyboardAvoidingView
        style={[styles.screen, { backgroundColor: theme.screen }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inner}>
            <PublishHeader />

            <PublishImagePicker imageUri={imageUri} onPress={pickImage} />

            <PublishForm
              title={title}
              description={description}
              price={price}
              tagsText={tagsText}
              onChangeTitle={setTitle}
              onChangeDescription={setDescription}
              onChangePrice={setPrice}
              onChangeTags={setTagsText}
            />

            <Pressable
              onPress={handlePublish}
              disabled={uploading || stripeBlocked}
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: theme.primary },
                pressed &&
                  !uploading &&
                  !stripeBlocked &&
                  styles.submitButtonPressed,
                (uploading || stripeBlocked) && styles.submitButtonDisabled,
              ]}
            >
              {uploading ? (
                <ActivityIndicator color={theme.primaryText} />
              ) : (
                <Text
                  style={[
                    styles.submitButtonText,
                    { color: theme.primaryText },
                  ]}
                >
                  Enviar para moderação
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <StripeBlockedModal
        visible={stripeBlocked}
        loading={refreshingStripe}
        onGoSettings={() => router.push("/settings")}
        onRefresh={() => void checkStripeStatus({ silent: true })}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
    alignItems: "center",
  },
  inner: {
    width: "100%",
    maxWidth: 760,
  },
  submitButton: {
    marginTop: 20,
    minHeight: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonPressed: {
    opacity: 0.95,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "800",
  },
});
