import Constants from "expo-constants";
import { Platform } from "react-native";

export function getBaseApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }

  if (Platform.OS === "web") {
    return "";
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    return `http://${ip}:8081`;
  }

  return "http://localhost:8081";
}
