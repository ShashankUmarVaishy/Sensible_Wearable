import { CameraView, useCameraPermissions } from "expo-camera";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import {
  AppState,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
export default function Home() {
  const [permission, requestPermission] = useCameraPermissions();
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const { type, returnTo } = useLocalSearchParams();
  useEffect(() => {
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
  }, [permission]);

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
            className="bg-green-200 px-6 py-3 rounded-lg"
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

  console.log("RENDER: Main camera view");

  return (
    <View style={{ flex: 1, backgroundColor: "red" }}>
      <Stack.Screen
        options={{
          title: "Overview",
          headerShown: false,
        }}
      />

      <CameraView
        style={{
          flex: 1,
          backgroundColor: "green",
          minHeight: 300,
        }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
        onBarcodeScanned={({ data }) => {
          if (qrLock.current) return;
          qrLock.current = true;

          console.log("Scanned Barcode (in scanner.tsx): ", data);
          if (data && returnTo === "addHandler") {
            router.replace({
              pathname: "/addHandler",
              params: {
                type: type,
                scannedData: data,
              },
            });
          }
        }}
        onCameraReady={() => {
          console.log("Camera is ready!");
        }}
        onMountError={(error) => {
          console.log("Camera mount error:", error);
        }}
      />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "green", // Different color to see if container is visible
  },
  camera: {
    flex: 1,
    backgroundColor: "red", // Temporary red background to see if camera area is visible
  },
  debugText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    padding: 10,
    backgroundColor: "blue",
  },
});
