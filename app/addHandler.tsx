import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import { useAuth } from "../context/AuthContext";
import { addCaretaker } from "../service/caretaker/addCareTaker";
import { addCaretakerByEmail } from "../service/caretaker/addCaretakerByEmail";
import { addPatient } from "../service/patient/addPatient";
import { addPatientByEmail } from "../service/patient/addPatientByEmail";
export default function AddHandler() {
  // const { type, scannedData } = useLocalSearchParams();
  const params = useLocalSearchParams() as {
    type: string;
    scannedData: string;
  };
  const { type, scannedData } = params;

  const { user, userToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  useEffect(() => {
    if (scannedData) {
      handleScannedData(scannedData as string);
    }
  }, [scannedData]);

  const handleScannedData = async (data: string) => {
    setLoading(true);
    try {
      // Parse the scanned QR data (assuming it contains userId)

      console.log(
        "Scanned data in addHandler:",
        scannedData,
        "of Type : ",
        type
      ); // Console log the scanned data

      if (type === "patient" && scannedData.startsWith("patientId :")) {
        await handleAddPatient(scannedData.slice(11));
      } else if (
        type === "caretaker" &&
        scannedData.startsWith("caretakerId :")
      ) {
        await handleAddCaretaker(scannedData.slice(13));
      }
    } catch (error) {
      console.error("Error processing scanned data:", error);
      Toast.error("Failed to process scanned data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (patientId: string) => {
    try {
      if (!userToken) {
        Toast.error("User not authenticated");
        router.replace("/login");
        return;
      }

      const result = await addPatient(userToken, patientId);

      if (result.success) {
        Toast.success("Patient added successfully!");
        setTimeout(() => router.back(), 1000);
      } else {
        Toast.error(result.message || "Failed to add patient");
      }
    } catch (error) {
      console.error("Error adding patient:", error);
      Toast.error("Failed to add patient");
    }
  };

  const handleAddCaretaker = async (caretakerId: string) => {
    try {
      if (!userToken) {
        Toast.error("User not authenticated");
        return;
      }

      const result = await addCaretaker(userToken, caretakerId);

      if (result.success) {
        Toast.success("Caretaker added successfully!");
        setTimeout(() => router.back(), 1000);
      } else {
        Toast.error(result.message || "Failed to add caretaker");
      }
    } catch (error) {
      console.error("Error adding caretaker:", error);
      Toast.error("Failed to add caretaker");
    }
  };

  const handleAddPatientByEmail = async (patientEmail: string) => {
    try {
      if (!userToken) {
        Toast.error("User not authenticated");
        router.replace("/login");
        return;
      }

      const result = await addPatientByEmail(userToken, patientEmail);

      if (result.success) {
        Toast.success("Patient added successfully!");
        setTimeout(() => router.back(), 1000);
      } else {
        Toast.error(result.message || "Failed to add patient");
      }
    } catch (error) {
      console.error("Error adding patient by email:", error);
      Toast.error("Failed to add patient");
    }
  };

  const handleAddCaretakerByEmail = async (caretakerEmail: string) => {
    try {
      if (!userToken) {
        Toast.error("User not authenticated");
        router.replace("/login");
        return;
      }

      const result = await addCaretakerByEmail(userToken, caretakerEmail);

      if (result.success) {
        Toast.success("Caretaker added successfully!");
        setTimeout(() => router.back(), 1000);
      } else {
        Toast.error(result.message || "Failed to add caretaker");
      }
    } catch (error) {
      console.error("Error adding caretaker by email:", error);
      Toast.error("Failed to add caretaker");
    }
  };

  const handleEmailSubmit = () => {
    if (!email.trim()) {
      Toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.error("Please enter a valid email address");
      return;
    }

    Alert.alert(
      `Add ${type === "patient" ? "Patient" : "Caretaker"}`,
      `Are you sure you want to add ${email} as a ${type}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Add",
          onPress: async () => {
            setLoading(true);
            try {
              if (type === "patient") {
                await handleAddPatientByEmail(email);
              } else {
                await handleAddCaretakerByEmail(email);
              }
            } finally {
              setLoading(false);
              setEmail("");
              setShowEmailInput(false);
            }
          },
        },
      ]
    );
  };

  const handleShareQR = () => {
    router.push({
      pathname: "/generateQR",
      params: {
        type: type,
        userId: user?.id || "",
        returnTo: "addHandler",
      },
    });
  };

  const handleScanQR = () => {
    router.push({
      pathname: "/scanner",
      params: {
        type: type,
        returnTo: "addHandler",
      },
    });
  };

  const getTitle = () => {
    return type === "patient" ? "Add Patient" : "Add Caretaker";
  };

  const getDescription = () => {
    if (type === "patient") {
      return "Add a patient to your care list by sharing your QR code or scanning their QR code.";
    } else {
      return "Add a caretaker to your care team by sharing your QR code or scanning their QR code.";
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="text-base text-gray-600 mt-4">Processing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    // <SafeAreaView className="flex-1 bg-gray-50">
    //   <KeyboardAvoidingView
    //     className="flex-1"
    //     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    //     keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    //   >
    //     {/* Header */}
    //     <View className="flex-row items-center justify-between px-5 pt-5 pb-4">
    //       <TouchableOpacity
    //         className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
    //         onPress={() => router.back()}
    //       >
    //         <Ionicons name="arrow-back" size={24} color="#1F2937" />
    //       </TouchableOpacity>
    //       <Text className="text-xl font-bold text-gray-800">{getTitle()}</Text>
    //       <View className="w-11" />
    //     </View>

    //     {/* Scrollable Content */}
    //     <ScrollView
    //       className="flex-1"
    //       contentContainerStyle={{ flexGrow: 1 }}
    //       keyboardShouldPersistTaps="handled"
    //       showsVerticalScrollIndicator={false}
    //     >
    //       <View className="px-5 pt-5 pb-6">
    //         <View className="items-center mb-6">
    //           <Ionicons
    //             name={type === 'patient' ? 'person-add' : 'people'}
    //             size={64}
    //             color="#000000"
    //           />
    //         </View>

    //         <Text className="text-base text-gray-600 text-center leading-6 mb-10">{getDescription()}</Text>

    //         {/* Action Buttons */}
    //         <View className="gap-4 mb-8">
    //           <TouchableOpacity className="bg-white rounded-2xl p-5 flex-row items-center shadow-sm" onPress={handleShareQR}>
    //             <View className="w-12 h-12 rounded-full bg-indigo-50 justify-center items-center mr-4">
    //               <Ionicons name="qr-code" size={24} color="#4F46E5" />
    //             </View>
    //             <View className="flex-1">
    //               <Text className="text-base font-semibold text-gray-800 mb-1">Share My QR Code</Text>
    //               <Text className="text-sm text-gray-600 leading-5">
    //                 Generate a QR code with your user ID for others to scan
    //               </Text>
    //             </View>
    //             <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    //           </TouchableOpacity>

    //           <TouchableOpacity className="bg-white rounded-2xl p-5 flex-row items-center shadow-sm" onPress={handleScanQR}>
    //             <View className="w-12 h-12 rounded-full bg-indigo-50 justify-center items-center mr-4">
    //               <Ionicons name="scan" size={24} color="#000000" />
    //             </View>
    //             <View className="flex-1">
    //               <Text className="text-base font-semibold text-gray-800 mb-1">Scan QR Code</Text>
    //               <Text className="text-sm text-gray-600 leading-5">
    //                 Scan someone else&apos;s QR code to add them
    //               </Text>
    //             </View>
    //             <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    //           </TouchableOpacity>

    //           <TouchableOpacity
    //             className="bg-white rounded-2xl p-5 flex-row items-center shadow-sm"
    //             onPress={() => setShowEmailInput(!showEmailInput)}
    //           >
    //             <View className="w-12 h-12 rounded-full bg-green-50 justify-center items-center mr-4">
    //               <Ionicons name="mail" size={24} color="#10B981" />
    //             </View>
    //             <View className="flex-1">
    //               <Text className="text-base font-semibold text-gray-800 mb-1">Add by Email</Text>
    //               <Text className="text-sm text-gray-600 leading-5">
    //                 Add {type === 'patient' ? 'a patient' : 'a caretaker'} using their email address
    //               </Text>
    //             </View>
    //             <Ionicons
    //               name={showEmailInput ? "chevron-up" : "chevron-forward"}
    //               size={20}
    //               color="#9CA3AF"
    //             />
    //           </TouchableOpacity>

    //           {/* Email Input Section */}
    //           {showEmailInput && (
    //             <View className="bg-white rounded-2xl p-5 shadow-sm border-2 border-green-100">
    //               <Text className="text-base font-semibold text-gray-800 mb-3">
    //                 Enter {type === 'patient' ? 'Patient' : 'Caretaker'} Email
    //               </Text>
    //               <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 mb-4">
    //                 <Ionicons name="mail-outline" size={20} color="#6B7280" />
    //                 <TextInput
    //                   className="flex-1 ml-3 text-base text-gray-800"
    //                   placeholder="Enter email address"
    //                   value={email}
    //                   onChangeText={setEmail}
    //                   keyboardType="email-address"
    //                   autoCapitalize="none"
    //                   autoCorrect={false}
    //                 />
    //               </View>
    //               <View className="flex-row gap-3">
    //                 <TouchableOpacity
    //                   className="flex-1 bg-gray-200 rounded-xl py-3 flex-row justify-center items-center"
    //                   onPress={() => {
    //                     setShowEmailInput(false);
    //                     setEmail('');
    //                   }}
    //                 >
    //                   <Text className="text-gray-700 font-semibold">Cancel</Text>
    //                 </TouchableOpacity>
    //                 <TouchableOpacity
    //                   className={`flex-1 rounded-xl py-3 flex-row justify-center items-center ${
    //                     loading ? 'bg-gray-400' : 'bg-green-600'
    //                   }`}
    //                   onPress={handleEmailSubmit}
    //                   disabled={loading}
    //                 >
    //                   {loading ? (
    //                     <ActivityIndicator size="small" color="white" />
    //                   ) : (
    //                     <>
    //                       <Ionicons name="add-circle-outline" size={16} color="white" />
    //                       <Text className="text-white font-semibold ml-1">Add</Text>
    //                     </>
    //                   )}
    //                 </TouchableOpacity>
    //               </View>
    //             </View>
    //           )}
    //         </View>

    //         {/* Info Card */}
    //         <View className="bg-gray-600 rounded-xl p-4 flex-row items-start">
    //           <Ionicons name="information-circle" size={20} color="#4F46E5" />
    //           <Text className="text-sm text-white leading-5 ml-3 flex-1">
    //             {type === 'patient'
    //               ? 'When you add a patient, they will be able to see you as their caretaker.'
    //               : 'When you add a caretaker, they will be able to monitor your health data.'
    //             }
    //           </Text>
    //         </View>
    //       </View>
    //     </ScrollView>
    //   </KeyboardAvoidingView>
    // </SafeAreaView>
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100} // Try 80–100 depending on your header
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-5 pt-5 pb-6">
            <View className="items-center mb-6">
              <Ionicons
                name={type === "patient" ? "person-add" : "people"}
                size={64}
                color="#000000"
              />
            </View>

            <Text className="text-base text-gray-600 text-center leading-6 mb-10">
              {getDescription()}
            </Text>

            {/* Action Buttons */}
            <View className="gap-4 mb-8">
              <TouchableOpacity
                className="bg-white rounded-2xl p-5 flex-row items-center shadow-sm"
                onPress={() => setShowEmailInput(!showEmailInput)}
              >
                <View className="w-12 h-12 rounded-full bg-green-50 justify-center items-center mr-4">
                  <Ionicons name="mail" size={24} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-800 mb-1">
                    Add by Email
                  </Text>
                  <Text className="text-sm text-gray-600 leading-5">
                    Add {type === "patient" ? "a patient" : "a caretaker"} using
                    their email address
                  </Text>
                </View>
                <Ionicons
                  name={showEmailInput ? "chevron-up" : "chevron-forward"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>

              {/* Email Input Section */}
              {showEmailInput && (
                <View className="bg-white rounded-2xl p-5 shadow-sm border-2 border-green-100">
                  <Text className="text-base font-semibold text-gray-800 mb-3">
                    Enter {type === "patient" ? "Patient" : "Caretaker"} Email
                  </Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 mb-4">
                    <Ionicons name="mail-outline" size={20} color="#6B7280" />
                    <TextInput
                      className="flex-1 ml-3 text-base text-gray-800"
                      placeholder="Enter email address"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 bg-gray-200 rounded-xl py-3 flex-row justify-center items-center"
                      onPress={() => {
                        setShowEmailInput(false);
                        setEmail("");
                      }}
                    >
                      <Text className="text-gray-700 font-semibold">
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 rounded-xl py-3 flex-row justify-center items-center ${
                        loading ? "bg-gray-400" : "bg-green-600"
                      }`}
                      onPress={handleEmailSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Ionicons
                            name="add-circle-outline"
                            size={16}
                            color="white"
                          />
                          <Text className="text-white font-semibold ml-1">
                            Add
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              <TouchableOpacity
                className="bg-white rounded-2xl p-5 flex-row items-center shadow-sm"
                onPress={handleShareQR}
              >
                <View className="w-12 h-12 rounded-full bg-indigo-50 justify-center items-center mr-4">
                  <Ionicons name="qr-code" size={24} color="#4F46E5" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-800 mb-1">
                    Share My QR Code
                  </Text>
                  <Text className="text-sm text-gray-600 leading-5">
                    Generate a QR code with your user ID for others to scan
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-white rounded-2xl p-5 flex-row items-center shadow-sm"
                onPress={handleScanQR}
              >
                <View className="w-12 h-12 rounded-full bg-indigo-50 justify-center items-center mr-4">
                  <Ionicons name="scan" size={24} color="#000000" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-800 mb-1">
                    Scan QR Code
                  </Text>
                  <Text className="text-sm text-gray-600 leading-5">
                    Scan someone else&apos;s QR code to add them
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Info Card */}
            <View className="bg-gray-600 rounded-xl p-4 flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#4F46E5" />
              <Text className="text-sm text-white leading-5 ml-3 flex-1">
                {type === "patient"
                  ? "When you add a patient, they will be able to see you as their caretaker."
                  : "When you add a caretaker, they will be able to monitor your health data."}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
