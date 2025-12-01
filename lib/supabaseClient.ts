import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const isBrowser = typeof window !== "undefined";

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// Web → localStorage
// Mobile → SecureStore
const storage =
  Platform.OS === "web"
    ? isBrowser
      ? localStorage
      : undefined
    : ExpoSecureStoreAdapter;

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: isBrowser,
    },
  }
);
