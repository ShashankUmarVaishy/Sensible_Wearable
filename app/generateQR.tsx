// import * as Sharing from 'expo-sharing';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';

// import { Ionicons } from '@expo/vector-icons';
// import * as FileSystem from 'expo-file-system';
// import { router, useLocalSearchParams } from 'expo-router';
// import QRCode from 'react-native-qrcode-svg';
// import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// import { useAuth } from '../context/AuthContext';
// export default function QRGeneratorScreen() {

//   const { type, userId, returnTo } = useLocalSearchParams();
//   const { user, userToken } = useAuth();
//   const [qrValue, setQRValue] = useState('');
//   const [isMounted, setIsMounted] = useState(false);
//   const qrRef = useRef<QRCode| null>(null);

//   useEffect(() => {
//     setIsMounted(true);
//     // Use the provided userId or fall back to current user's ID
//     console.log('in generateb QRScreen:', userId, returnTo);
//     const userIdToShare= userId || user?.id ;
//     const prefix = type === 'patient'? 'patientId :' : 'caretakerId :';
//     setQRValue(prefix+userIdToShare);

//     return () => {
//       setIsMounted(false);
//     };
//   }, [userId, user]);

//   // const handleShare = async () => {
//   //   try {
//   //     await Share.share({
//   //       message: `Here's my QR code for ${type === 'patient' ? 'adding me as a patient' : 'adding me as a caretaker'}: ${qrValue}`,
//   //       title: 'Share QR Code',
//   //     });
//   //   } catch (error) {
//   //     console.error('Error sharing:', error);
//   //   }
//   // };

//   const handleShare = async () => {
//     if (!qrRef.current) {
//       console.error('QR code reference not available');
//       return;
//     }

//     try {
//       qrRef.current.toDataURL(async (data) => {
//         try {
//           const fileUri = FileSystem.cacheDirectory + 'qr-code.png';

//           // Remove the data URL prefix if present
//           const base64Data = data.replace(/^data:image\/png;base64,/, '');

//           await FileSystem.writeAsStringAsync(fileUri, base64Data, {
//             encoding: FileSystem.EncodingType.Base64,
//           });

//           // Check if sharing is available
//           if (await Sharing.isAvailableAsync()) {
//             await Sharing.shareAsync(fileUri, {
//               mimeType: 'image/png',
//               dialogTitle: `Share ${type === 'patient' ? 'Patient' : 'Caretaker'} QR Code`,
//             });
//           } else {
//             console.log('Sharing is not available');
//           }
//         } catch (error) {
//           console.error('Error in sharing QR image:', error);
//         }
//       });
//     } catch (error) {
//       console.error('Error generating QR image:', error);
//     }
//   };
//   const handleBack = () => {
//     if (!isMounted) return;

//     try {
//       if (returnTo === 'addHandler') {
//         router.back();
//       } else {
//         router.replace('/(tabs)');
//       }
//     } catch (error) {
//       console.error('Navigation error:', error);
//       // Fallback navigation
//       router.replace('/(tabs)');
//     }
//   };

//   const getTitle = () => {
//     if (type === 'patient') {
//       return 'Share Patient QR Code';
//     } else if (type === 'caretaker') {
//       return 'Share Caretaker QR Code';
//     }
//     return 'Generate QR Code';
//   };

//   const getDescription = () => {
//     if (type === 'patient') {
//       return 'Share this QR code with your caretaker so they can add you as their patient.';
//     } else if (type === 'caretaker') {
//       return 'Share this QR code with your patient so they can add you as their caretaker.';
//     }
//     return 'Share this QR code with others.';
//   };

//   return (
//     <SafeAreaProvider>
//     <SafeAreaView className="flex-1 bg-gray-50">
//       {/* Header */}
//       <View className="flex-row items-center justify-between px-5 pt-5 pb-4">
//         <TouchableOpacity className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm" onPress={handleBack}>
//           <Ionicons name="arrow-back" size={24} color="#1F2937" />
//         </TouchableOpacity>
//         <Text className="text-lg font-bold text-gray-800">{getTitle()}</Text>
//         <TouchableOpacity className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm" onPress={handleShare}>
//           <Ionicons name="share-outline" size={24} color="#4F46E5" />
//         </TouchableOpacity>
//       </View>

//       {/* Content */}
//       <View className="flex-1 px-5">
//         <View className="items-center mb-8">
//           {qrValue ? (
//             <>
//               <View className="bg-white p-6 rounded-2xl shadow-lg mb-4">
//                 <QRCode
//                 value='21'
//                 size={200}
//                 />
//               </View>
//               <Text className="text-lg font-semibold text-gray-800 mb-2">Scan this QR code</Text>
//               <Text className="text-sm text-gray-600 text-center leading-5">{getDescription()}</Text>
//             </>
//           ) : (
//             <View className="items-center py-10">
//               <Ionicons name="qr-code" size={64} color="#9CA3AF" />
//               <Text className="text-base text-gray-400 mt-4">Generating QR code...</Text>
//             </View>
//           )}
//         </View>

//         {/* User Info */}
//         {qrValue && (
//           <View className="bg-white rounded-xl p-4 mb-5 shadow-sm">
//             <View className="flex-row items-center mb-3">
//               <Ionicons name="person-circle" size={24} color="#4F46E5" />
//               <Text className="text-base font-semibold text-gray-800 ml-2">Your Information</Text>
//             </View>
//             <View className="flex-row justify-between items-center py-1">
//               <Text className="text-sm text-gray-600">Name:</Text>
//               <Text className="text-sm text-gray-800 font-medium flex-1 text-right">{user?.name || 'User'}</Text>
//             </View>
//             <View className="flex-row justify-between items-center py-1">
//               <Text className="text-sm text-gray-600">Email:</Text>
//               <Text className="text-sm text-gray-800 font-medium flex-1 text-right">{user?.email || 'user@email.com'}</Text>
//             </View>
//           </View>
//         )}

//         {/* Action Buttons */}
//         {qrValue && (
//           <View className="mb-5">
//             <TouchableOpacity className="bg-indigo-600 rounded-xl py-4 px-6 flex-row items-center justify-center shadow-lg" onPress={handleShare}>
//               <Ionicons name="share" size={20} color="#FFFFFF" />
//               <Text className="text-base font-semibold text-white ml-2">Share QR Code</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Instructions */}
//         <View className="bg-indigo-50 rounded-xl p-4 flex-row items-start">
//           <Ionicons name="information-circle" size={20} color="#4F46E5" />
//           <View className="flex-1 ml-3">
//             <Text className="text-sm font-semibold text-indigo-700 mb-1">How to use:</Text>
//             <Text className="text-xs text-indigo-700 leading-4">
//               1. Show this QR code to the person you want to connect with{'\n'}
//               2. They should scan it using their app{'\n'}
//               3. You'll be automatically added to their list
//             </Text>
//           </View>
//         </View>
//       </View>
//     </SafeAreaView>
//     </SafeAreaProvider>
//   );
// }
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import { Image } from "react-native";
import { Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

export default function QRGeneratorScreen() {
  const { type, userId, returnTo } = useLocalSearchParams();
  const { user, userToken } = useAuth();
  const [qrValue, setQRValue] = useState("");
  const [qrURL, setqrURL] = useState("");
  const qrRef = useRef<QRCode | null>(null);

  useEffect(() => {
    const userIdToShare = userId || user?.id;
    const prefix = type === "patient" ? "patientId :" : "caretakerId :";
    setQRValue(prefix + userIdToShare);
    setqrURL(
      `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(
        qrValue
      )}`
    );
  }, [userId, user]);

  const handleShare = async () => {
    if (!qrRef.current) {
      console.error("QR code reference not available");
      return;
    }

    try {
      // Use toDataURL method which exists on the QRCode component
      (qrRef.current as any).toDataURL(async (data: string) => {
        try {
          const base64Data = data.replace(/^data:image\/png;base64,/, "");
          const fileUri = FileSystem.cacheDirectory + "qr-code.png";

          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType: "image/png",
              dialogTitle: `Share ${
                type === "patient" ? "Patient" : "Caretaker"
              } QR Code`,
            });
          } else {
            console.log("Sharing is not available");
          }
        } catch (error) {
          console.error("Error sharing QR code:", error);
        }
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleBack = () => {
    if (returnTo === "addHandler") {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const getTitle = () => {
    if (type === "patient") return "Share Patient QR Code";
    if (type === "caretaker") return "Share Caretaker QR Code";
    return "Generate QR Code";
  };

  const getDescription = () => {
    if (type === "patient")
      return "Share this QR code with your caretaker so they can add you as their patient.";
    if (type === "caretaker")
      return "Share this QR code with your patient so they can add you as their caretaker.";
    return "Share this QR code with others.";
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-5 pb-4">
          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-800">{getTitle()}</Text>
          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* QR Code */}
        <View className="flex-1 px-5">
          <View className="items-center mb-8">
            {qrValue ? (
              <>
                <View className="bg-white p-6 rounded-2xl shadow-lg mb-4">
                  {/* <QRCode
                    value='21'
                    size={200}
                    // getRef={(c) => (qrRef.current = c)}
                  />  */}
                </View>
                <Text className="text-lg font-semibold text-gray-800 mb-2">
                  Scan this QR code
                </Text>
                <Text className="text-sm text-gray-600 text-center leading-5">
                  {getDescription()}
                </Text>
              </>
            ) : (
              <View className="items-center py-10">
                <Ionicons name="qr-code" size={64} color="#9CA3AF" />
                <Text className="text-base text-gray-400 mt-4">
                  Generating QR code...
                </Text>
              </View>
            )}
          </View>

          {/* User Info */}
          {qrValue && (
            <View className="bg-white rounded-xl p-4 mb-5 shadow-sm">
              <View className="flex-row items-center mb-3">
                <Ionicons name="person-circle" size={24} color="#4F46E5" />
                <Text className="text-base font-semibold text-gray-800 ml-2">
                  Your Information
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-1">
                <Text className="text-sm text-gray-600">Name:</Text>
                <Text className="text-sm text-gray-800 font-medium flex-1 text-right">
                  {user?.name || "User"}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-1">
                <Text className="text-sm text-gray-600">Email:</Text>
                <Text className="text-sm text-gray-800 font-medium flex-1 text-right">
                  {user?.email || "user@email.com"}
                </Text>
              </View>
            </View>
          )}

          {/* Action Button */}
          {qrValue && (
            <View className="mb-5">
              <TouchableOpacity
                className="bg-indigo-600 rounded-xl py-4 px-6 flex-row items-center justify-center shadow-lg"
                onPress={handleShare}
              >
                <Ionicons name="share" size={20} color="#FFFFFF" />
                <Text className="text-base font-semibold text-white ml-2">
                  Share QR Code
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Instructions */}
          <View className="bg-indigo-50 rounded-xl p-4 flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#4F46E5" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-indigo-700 mb-1">
                How to use:
              </Text>
              <Text className="text-xs text-indigo-700 leading-4">
                1. Show this QR code to the person you want to connect with
                {"\n"}
                2. They should scan it using their app{"\n"}
                3. You&apos;ll be automatically added to their list
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
