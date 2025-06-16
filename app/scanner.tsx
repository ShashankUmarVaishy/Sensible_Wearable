import { CameraView, useCameraPermissions } from "expo-camera";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import {
  AppState,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Overlay } from "../components/Overlay";

export default function Home() {
  const [permission, requestPermission] = useCameraPermissions();
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const { type, returnTo } = useLocalSearchParams();

  useEffect(() => {
    console.log('in scanner page')
    console.log('type:', type);
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!permission) {
    // Camera permissions are still loading
    return (
      <SafeAreaView className="absolute inset-0 flex-1 justify-center items-center">
        <Text>Loading camera permissions...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <SafeAreaView className="absolute inset-0 flex-1 justify-center items-center">
        <Stack.Screen
          options={{
            title: "Camera Permission",
            headerShown: false,
          }}
        />
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-lg text-center mb-6">
            We need your permission to show the camera for scanning QR codes
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-lg"
            onPress={requestPermission}
          >
            <Text className="text-white text-center font-semibold">
              Grant Camera Permission
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Overview",
          headerShown: false,
        }}
      />
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
        onBarcodeScanned={({ data }) => {
          if (qrLock.current) return;
          qrLock.current = true;
          
          console.log("Scanned Barcode (in scanner.tsx): ", data);
          if (data && returnTo === 'addHandler') {
            // Navigate back to addHandler with scanned data
            router.replace({
              pathname: '/addHandler',
              params: { 
                type: type,
                scannedData: data 
              }
            });
          }
        }}
      />
      <Overlay />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
});