import { useApp } from "@/components/appContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabaseClient";

type StripeStatus = {
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean;
  stripe_details_submitted: boolean;
};

type SettingsTheme = {
  background: string;
  card: string;
  cardSecondary: string;
  border: string;
  title: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  warning: string;
  success: string;
  danger: string;
  dangerSoft: string;
  dangerText: string;
  blue: string;
  inputBg: string;
  overlay: string;
  loader: string;
};

const FUNCTIONS_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`;
const PRIVACY_POLICY_URL = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? "";
const TERMS_POLICY_URL = process.env.EXPO_PUBLIC_TERMS_URL ?? "";

function getTheme(
  colorScheme: "light" | "dark" | null | undefined,
): SettingsTheme {
  const isDark = colorScheme === "dark";

  return {
    background: isDark ? "#121212" : "#F5F5F5",
    card: isDark ? "#1A1A1A" : "#FFFFFF",
    cardSecondary: isDark ? "#161616" : "#FAFAFA",
    border: isDark ? "#2A2A2A" : "#E7E7E7",
    title: isDark ? "#EE9734" : "#C97718",
    text: isDark ? "#F5F5F5" : "#121212",
    textMuted: isDark ? "#BDBDBD" : "#6B7280",
    primary: "#EE9734",
    primaryText: "#121212",
    warning: "#F1C40F",
    success: "#22C55E",
    danger: isDark ? "#EF4444" : "#DC2626",
    dangerSoft: isDark ? "#2A1414" : "#FFF1F1",
    dangerText: "#FFFFFF",
    blue: "#1E4563",
    inputBg: isDark ? "#101010" : "#FFFFFF",
    overlay: "rgba(0,0,0,0.55)",
    loader: "#EE9734",
  };
}

async function openExternalUrl(url: string) {
  if (!url) {
    throw new Error("URL inválida.");
  }

  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    throw new Error("Não foi possível abrir a URL.");
  }

  const supported = await Linking.canOpenURL(url);

  if (!supported) {
    throw new Error("Não foi possível abrir o navegador.");
  }

  await Linking.openURL(url);
}

async function deleteMyAccount() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error("Sessão inválida.");
  }

  const response = await fetch(`${FUNCTIONS_URL}/delete-account`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
  });

  let payload: { error?: string } | null = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || "Não foi possível excluir a conta.");
  }

  await supabase.auth.signOut();
}

export default function Settings() {
  const router = useRouter();
  const { platform } = useApp();
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);

  const [loading, setLoading] = useState(true);
  const [stripe, setStripe] = useState<StripeStatus | null>(null);
  const [processing, setProcessing] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    void syncStripeStatus();
  }, []);

  async function syncStripeStatus() {
    setLoading(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
    }

    if (!session) {
      setLoading(false);
      return;
    }

    await fetch(`${FUNCTIONS_URL}/stripe-check-account-status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }).catch(() => {});

    const { data, error } = await supabase
      .from("users")
      .select(
        "stripe_account_id, stripe_charges_enabled, stripe_details_submitted",
      )
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("DB error:", error);
    }

    if (data) {
      setStripe(data);
    }

    setLoading(false);
  }

  async function handleStripeConnect() {
    try {
      setProcessing(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }

      const res = await fetch(`${FUNCTIONS_URL}/create-connect-account`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error("Erro ao iniciar Stripe Connect.");
      }

      if (platform === "web") {
        window.location.href = data.url;
      } else {
        await WebBrowser.openAuthSessionAsync(data.url, "clackbum://");
      }
    } catch (error) {
      console.error("Stripe connect error:", error);
      Alert.alert("Erro", "Falha ao conectar com o Stripe.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleOpenPrivacyPolicy() {
    try {
      if (!PRIVACY_POLICY_URL) {
        Alert.alert(
          "Configuração pendente",
          "Defina EXPO_PUBLIC_PRIVACY_POLICY_URL no ambiente.",
        );
        return;
      }

      await openExternalUrl(PRIVACY_POLICY_URL);
    } catch (error) {
      console.error("Erro ao abrir política:", error);
      Alert.alert("Erro", "Não foi possível abrir a política de privacidade.");
    }
  }

  async function handleOpenTerms() {
    try {
      if (!TERMS_POLICY_URL) {
        Alert.alert(
          "Configuração pendente",
          "Defina EXPO_PUBLIC_TERMS_URL no ambiente.",
        );
        return;
      }

      await openExternalUrl(TERMS_POLICY_URL);
    } catch (error) {
      console.error("Erro ao abrir termos:", error);
      Alert.alert("Erro", "Não foi possível abrir os termos e políticas.");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/auth");
  }

  function openDeleteModal() {
    setDeleteConfirmation("");
    setDeleteModalVisible(true);
  }

  function closeDeleteModal() {
    if (deleteLoading) return;
    setDeleteModalVisible(false);
    setDeleteConfirmation("");
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation.trim() !== "CONFIRMAR") {
      Alert.alert("Confirmação inválida", 'Digite exatamente "CONFIRMAR".');
      return;
    }

    try {
      setDeleteLoading(true);
      await deleteMyAccount();
      setDeleteModalVisible(false);
      router.replace("/auth");
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      Alert.alert(
        "Erro",
        "Não foi possível excluir sua conta agora. Tente novamente.",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.loader} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.title }]}>
            Recebimentos
          </Text>

          {!stripe?.stripe_account_id && (
            <>
              <Text style={[styles.bodyText, { color: theme.textMuted }]}>
                Ative os recebimentos para vender suas fotos.
              </Text>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={handleStripeConnect}
                disabled={processing}
                activeOpacity={0.9}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: theme.primaryText },
                  ]}
                >
                  {processing ? "Abrindo Stripe..." : "Ativar recebimentos"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {stripe?.stripe_account_id && !stripe.stripe_details_submitted && (
            <>
              <Text style={[styles.warningText, { color: theme.warning }]}>
                ⚠️ Cadastro incompleto no Stripe
              </Text>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={handleStripeConnect}
                disabled={processing}
                activeOpacity={0.9}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: theme.primaryText },
                  ]}
                >
                  Continuar verificação
                </Text>
              </TouchableOpacity>
            </>
          )}

          {stripe?.stripe_charges_enabled && (
            <Text style={[styles.successText, { color: theme.success }]}>
              ✅ Recebimentos ativos
            </Text>
          )}
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Privacidade e políticas
          </Text>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: theme.border,
              },
            ]}
            onPress={handleOpenPrivacyPolicy}
            activeOpacity={0.9}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
              Abrir política de privacidade
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: theme.cardSecondary,
                borderColor: theme.border,
              },
            ]}
            onPress={handleOpenTerms}
            activeOpacity={0.9}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
              Abrir termos e políticas
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.danger }]}>
            Excluir conta
          </Text>

          <Text style={[styles.bodyText, { color: theme.textMuted }]}>
            Excluir sua conta remove seu acesso e apaga TODOS os seus dados
            vinculados ao aplicativo.
          </Text>

          <TouchableOpacity
            style={[
              styles.dangerButton,
              {
                backgroundColor: theme.dangerSoft,
                borderColor: theme.danger,
              },
            ]}
            onPress={openDeleteModal}
            activeOpacity={0.9}
          >
            <Text style={[styles.dangerButtonText, { color: theme.danger }]}>
              Excluir minha conta
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.danger }]}
          onPress={handleLogout}
          activeOpacity={0.9}
        >
          <Text style={styles.logoutText}>Desconectar conta</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteModal}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.danger }]}>
              Confirmar exclusão
            </Text>

            <Text style={[styles.modalDescription, { color: theme.textMuted }]}>
              Esta ação é permanente. Para continuar, digite{" "}
              <Text style={{ color: theme.text, fontWeight: "900" }}>
                CONFIRMAR
              </Text>{" "}
              no campo abaixo.
            </Text>

            <TextInput
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              placeholder="Digite CONFIRMAR"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!deleteLoading}
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />

            <View style={styles.modalActions}>
              <Pressable
                onPress={closeDeleteModal}
                disabled={deleteLoading}
                style={[
                  styles.modalSecondaryButton,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.cardSecondary,
                  },
                ]}
              >
                <Text
                  style={[styles.modalSecondaryText, { color: theme.text }]}
                >
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={handleDeleteAccount}
                disabled={deleteLoading}
                style={[
                  styles.modalDangerButton,
                  { backgroundColor: theme.danger },
                ]}
              >
                <Text style={styles.modalDangerText}>
                  {deleteLoading ? "Excluindo..." : "Excluir conta"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  helpText: {
    fontSize: 13,
    lineHeight: 20,
  },
  warningText: {
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 22,
  },
  successText: {
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 22,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
  },
  dangerButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: "900",
  },
  logoutButton: {
    minHeight: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 460,
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    gap: 14,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  modalSecondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSecondaryText: {
    fontSize: 15,
    fontWeight: "800",
  },
  modalDangerButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDangerText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});
