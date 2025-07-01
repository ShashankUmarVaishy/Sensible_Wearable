import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import { Toast } from "toastify-react-native";
import NotificationPage from "../../components/NotificationPage";
import { useAuth } from "../../context/AuthContext";
import { usePushNotification } from "@/service/usePushNotifications";
import useBLE from "@/service/ble/useBLE";
import { setToken } from "@/service/token/setToken";
import { secureStorage } from "../../src/storage";
import HealthStats from "@/components/HealthStats";
import BackgroundJob from "react-native-background-actions";
import { useBLEStore } from "@/service/ble/bleStore";
export default function HomeScreen() {
  const { user, userToken } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const { expoPushToken, notification } = usePushNotification(); //top level of the app
  const data= useBLEStore((state)=>state.data)
  const connectedDevice=useBLEStore((state)=>state.connectedDevice)
  const stopForegroundTask = async () => {
    try {
      console.log("Stopping foreground task");
      await BackgroundJob.stop();
      Toast.error("Background service stopped");
    } catch (error) {
      Toast.error(`Task could not be stopped. Error: ${error}`);
    }
  };

  const quickActions = [
    {
      id: 1,
      title: "Your Caretakers",
      icon: "person",
      onPress: () => router.push("/caretakers"),
    },
    {
      id: 2,
      title: "Medication Reminder",
      icon: "medkit",
      onPress: () => router.push("/medicationReminder"),
    },
    {
      id: 3,
      title: "Health Check",
      icon: "heart",
      onPress: () => Toast.info("Health check feature coming soon"),
    },
    {
      id: 4,
      title: "Stop BG Tasks",
      icon: "stop",
      onPress: async () => {
        try {
          await stopForegroundTask();
          await disconnectFromDevice();
          Toast.success('BG tasks stopped');
        } catch (error) {
          Toast.error(error?.message ? error.message : 'unknown error');
        }
      },
    },
  ];

  const { disconnectFromDevice } = useBLE();

  const uploadToken = async () => {
    if (expoPushToken?.data && userToken) {
      const res = await setToken(userToken, expoPushToken?.data);
    }
  };
  useEffect(() => {
    uploadToken();
  }, [expoPushToken?.data, userToken]);
  useEffect(() => {
    console.log(connectedDevice);
    console.log("Connected device changed in index page : ", connectedDevice);
  }, [connectedDevice]);
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 pt-5 pb-4">
          <View className="max-w-[80%]">
            <Text className="text-base text-gray-600">Good Day To You </Text>
            <Text className="text-2xl font-bold text-black mt-1">
              {user?.name || "User"}
            </Text>
          </View>
          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-gray-100 justify-center items-center"
            onPress={() => setShowNotifications(true)}
          >
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Health Status Card */}
        <View className="bg-white mx-5 mb-6 p-5 rounded-xl border border-gray-200">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-semibold text-black">
              Today&apos;s Health Status
            </Text>
            <View className="bg-green-200 px-3 py-1 rounded-full border border-green-500 ">
              <Text className="text-xs font-semibold text-black">Good</Text>
            </View>
          </View>
          <Text className="text-sm text-gray-600">
            All vitals are within normal range
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-black mb-4 px-5">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap px-5 gap-3">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                className="bg-white w-[47%] p-4 rounded-xl border border-gray-200 items-center"
                onPress={action.onPress}
              >
                <View className="w-12 h-12 rounded-full bg-gray-100 justify-center items-center mb-2">
                  <Ionicons name={action.icon as any} size={24} color="black" />
                </View>
                <Text className="text-sm font-medium text-black text-center">
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Health Stats */}
        <HealthStats />

        {/* Recent Activity */}
        <View className="mb-10">
          <Text className="text-xl font-semibold text-black mb-4 px-5">
            Recent Activity
          </Text>
          <View className="bg-white mx-5 rounded-xl border border-gray-200">
            <View className="flex-row items-center p-4 border-b border-gray-100">
              <View className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center mr-3">
                <Ionicons name="medical" size={16} color="black" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-black">
                  Medication Taken
                </Text>
                <Text className="text-xs text-gray-500 mt-1">2 hours ago</Text>
              </View>
            </View>
            <View className="flex-row items-center p-4 border-b border-gray-100">
              <View className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center mr-3">
                <Ionicons name="heart" size={16} color="black" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-black">
                  Heart Rate Recorded
                </Text>
                <Text className="text-xs text-gray-500 mt-1">4 hours ago</Text>
              </View>
            </View>
            <View className="flex-row items-center p-4">
              <View className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center mr-3">
                <Ionicons name="calendar" size={16} color="black" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-black">
                  Appointment Scheduled
                </Text>
                <Text className="text-xs text-gray-500 mt-1">Yesterday</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Notification Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showNotifications}
        onRequestClose={() => setShowNotifications(false)}
      >
        <NotificationPage
          onClose={() => setShowNotifications(false)}
          notification
        />
      </Modal>
    </SafeAreaView>
  );
}
// This code is a React Native component for a home screen in a healthcare app.
