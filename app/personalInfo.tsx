import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../service/user/updateProfile';

export default function PersonalInfoScreen() {
  const { user, userToken } = useAuth();
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleUpdateProfile = async () => {
    if (!age.trim() && !phoneNumber.trim()) {
      Toast.error('Please enter at least one field to update');
      return;
    }

    if (age && (isNaN(Number(age)) || Number(age) < 0 || Number(age) > 100)) {
      Toast.error('Please enter a valid age (0-100)');
      return;
    }

    if (phoneNumber && phoneNumber.length < 10) {
      Toast.error('Please enter a valid phone number');
      return;
    }

    Alert.alert(
      'Update Profile',
      'Are you sure you want to update your profile information?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Update',
          onPress: async () => {
            setLoading(true);
            try {
              if (!userToken) {
                Toast.error('User not authenticated');
                router.replace('/login');
                return;
              }

              const result = await updateProfile(
                age ? Number(age) : 0,
                phoneNumber || '',
                userToken
              );

              if (result.success) {
                Toast.success('Profile updated successfully!');
                setTimeout(() => router.back(), 1000);
              } else {
                Toast.error(result.message || 'Failed to update profile');
              }
            } catch (error) {
              console.error('Error updating profile:', error);
              Toast.error('Failed to update profile');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-5 pb-4">
        <TouchableOpacity 
          className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Personal Information</Text>
        <View className="w-11" />
      </View>

      {/* Content */}
      <View className="flex-1 px-5 pt-5">
        {/* User Info Card */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-gray-100 justify-center items-center mr-4">
              <Ionicons name="person" size={32} color="black" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-black mb-1">{user?.name || 'User Name'}</Text>
              <Text className="text-base text-gray-600">{user?.email || 'user@email.com'}</Text>
              <Text className="text-base text-gray-600">{user?.phoneNumber || 'XXXXX-XXXXX'}</Text>
              <Text className="text-base text-gray-600">{user?.age || ' age:N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Update Form */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-6">Update Information</Text>
          
          {/* Age Input */}
          <View className="mb-6">
            <Text className="text-base font-medium text-gray-700 mb-2">Age</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-800"
                placeholder='enter your age'
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>

          {/* Phone Number Input */}
          <View className="mb-8">
            <Text className="text-base font-medium text-gray-700 mb-2">Phone Number</Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-800"
                placeholder={user?.phoneNumber?`${user?.phoneNumber}`:'enter your age'}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            className={`rounded-xl py-4 flex-row justify-center items-center ${
              loading ? 'bg-gray-400' : 'bg-indigo-600'
            }`}
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                <Text className="text-white font-semibold text-base ml-2">Update Profile</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View className="bg-blue-50 rounded-xl p-4 flex-row items-start mt-6">
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text className="text-sm text-blue-800 leading-5 ml-3 flex-1">
            You can update your age and phone number here. This information helps us provide better healthcare services.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}