import PublishForm from "@/components/publish/PublishForm";
import PublishHeader from "@/components/publish/PublishHeader";
import PublishImagePicker from "@/components/publish/PublishImagePicker";
import PublishScreenSkeleton from "@/components/publish/PublishScreenSkeleton";
import StripeBlockedModal from "@/components/publish/StripeBlockedModal";
import { usePublishController } from "@/hooks/usePublishController";
import { useRouter } from "expo-router";
import React from "react";
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

export default function PublishScreen() {
  const router = useRouter();
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
        style={styles.screen}
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
                pressed &&
                  !uploading &&
                  !stripeBlocked &&
                  styles.submitButtonPressed,
                (uploading || stripeBlocked) && styles.submitButtonDisabled,
              ]}
            >
              {uploading ? (
                <ActivityIndicator color="#121212" />
              ) : (
                <Text style={styles.submitButtonText}>
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
    backgroundColor: "#121212",
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
    backgroundColor: "#EE9734",
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
    color: "#121212",
    fontSize: 15,
    fontWeight: "800",
  },
});
