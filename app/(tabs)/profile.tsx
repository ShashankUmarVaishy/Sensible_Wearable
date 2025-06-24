import { Ionicons } from '@expo/vector-icons';
import { useCameraPermissions } from "expo-camera";
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from 'toastify-react-native';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);
  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //     Toast.success('Logged out successfully');
  //     router.replace('/login');
  //   } catch (error) {
  //     Toast.error('Failed to logout');
  //   }
  // };
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Toast.success('Logged out successfully');
            router.replace('/login');
          },
        },
      ]
    );
  };


  const handleAddCaretaker = () => {
    router.push({
      pathname: '/addHandler',
      params: { type: 'caretaker' }
    });
  };

  const handleAddPatient = () => {
    router.push({
      pathname: '/addHandler',
      params: { type: 'patient' }
    });
  };
  
  const handleAddDevice = () => {
    router.push({
      pathname: '/connect',
    });
  };

  const handlePersonalInfo = () => {
    router.push('/personalInfo');
  };

  const profileOptions = [
    {
      id: 1,
      title: 'Add Patient',
      icon: 'person-add-outline',
      onPress: handleAddPatient,
    },
    {
      id: 2,
      title: 'Add Caretaker',
      icon: 'people-outline',
      onPress: handleAddCaretaker,
    },
    {
      id: 3,
      title: 'Personal Information',
      icon: 'person-outline',
      onPress: handlePersonalInfo,
    },
    {
      id: 4,
      title: 'Add Sensible Device',
      icon: 'hardware-chip-outline',
      onPress: handleAddDevice
    },
    {
      id: 5,
      title: 'Emergency Contacts',
      icon: 'call-outline',
      onPress: () => Toast.info('Manage emergency contacts feature coming soon'),
    },
  ];

  return (
    <SafeAreaView className="flex-1 h-screen bg-white">
      <View className=" h-full  flex-col justify-between">
        <View>

       
        {/* Header */}
        <View className="flex-row justify-between  items-center px-5 pt-5 pb-4">
          <Text className="text-2xl font-bold text-black">Profile</Text>
          <TouchableOpacity className="w-11 h-11 rounded-full bg-gray-100 justify-center items-center">
            <Ionicons name="create-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View className="bg-white mx-5 mb-6 p-6  rounded-2xl border border-gray-200">
          <View className="flex-row items-center">
            <View className="w-20 h-20 rounded-full bg-gray-100 justify-center items-center mr-4">
              <Ionicons name="person" size={48} color="black" />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-black mb-1">{user?.name || 'User Name'}</Text>
              <Text className="text-base text-gray-700 mb-2">{user?.email || 'user@email.com'}</Text>
              <View className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-xl self-start">
                <Ionicons name="medical" size={16} color="black" />
                <Text className="text-xs font-semibold text-black ml-1">Healthcare Provider</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Options */}
        <View className="mb-6  ">
          <Text className="text-xl font-semibold text-black mb-4 px-5">Settings</Text>
          <View className="bg-white mx-5 rounded-xl border border-gray-200">
            {profileOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                className="flex-row justify-between items-center px-5 py-4 border-b border-gray-100"
                onPress={option.onPress}
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3">
                    <Ionicons name={option.icon as any} size={20} color="black" />
                  </View>
                  <Text className="text-base font-medium text-black">{option.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="black" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        </View>
        {/* Logout Button */}
        <View className="  flex-col justify-end px-5 pb-10   ">
          <TouchableOpacity 
            className="flex-row items-center w-fit  justify-center bg-red-500 py-4 rounded-xl border border-gray-200"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text className="text-xl font-bold text-white ml-2">Logout</Text>
          </TouchableOpacity>
        </View>
        
      </View>
    </SafeAreaView>
  );
}