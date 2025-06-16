import { Stack } from "expo-router";
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import ToastManager from 'toastify-react-native';
import { AuthProvider } from "../context/AuthContext";
import '../global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <ToastManager />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
