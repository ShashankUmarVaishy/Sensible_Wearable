import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import { useAuth } from '../context/AuthContext';
import { notificationToUser } from '@/service/notification/notificationToUser';
import { notificationToGroupFromPatient } from '@/service/notification/notificationToGroup';
import { getCaretakers } from '@/service/caretaker/getCareTakers';
interface Caretaker {
  id: string;
  name: string;
  email: string;
  age?: number;
  condition?: string;
  lastCheckup?: string;
  status: 'critical' | 'needs-attention' | 'stable';
  avatar?: string;
}

export default function PatientsScreen() {
  const { user, userToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [caretakers, setCaretakers] = useState<Caretaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCaretakers = async () => {
    try {
      setLoading(true);
      if (!userToken) {
        Toast.error('User not authenticated');
        return;
      }
      
      const response = await getCaretakers(userToken);
      if (response.success) {
        // Map API response to Patient interface with status priority
        console.log("data in caretaker.tsx ", response)
        const caretakerData = response.relations.map((caretaker: any) => ({
          id: caretaker.id || caretaker._id,
          name: caretaker.name || `${caretaker.firstName || ''} ${caretaker.lastName || ''}`.trim(),
          email: caretaker.email,
          age: caretaker.age,
          condition: caretaker.condition || caretaker.medicalCondition,
          lastCheckup: caretaker.lastCheckup || caretaker.lastVisit,
          status: caretaker.status || (caretaker.priority === 'high' ? 'critical' : 
                   caretaker.priority === 'medium' ? 'needs-attention' : 'stable'),
          avatar: 'person',
        }));
        setCaretakers(caretakerData);
      } else {
        Toast.error(response.message || 'Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      Toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCaretakers();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchCaretakers();
    }, [userToken])
  );

  // Sort patients by status priority: critical -> needs-attention -> stable
  const getSortPriority = (status: string) => {
    switch (status) {
      case 'critical': return 0;
      case 'needs-attention': return 1;
      case 'stable': return 2;
      default: return 3;
    }
  };


  const handleCaretakerPress = async(caretaker: Caretaker) => {
    const caretakerId = caretaker.id;
    const response = await notificationToUser(userToken, caretakerId,"I'm patient","This is notification Body");
  };

  const handleAddCaretaker = () => {
    router.push({
      pathname: './addHandler',
      params: { type: 'caretaker' }
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="text-base text-gray-600 mt-4">Loading patients...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-5 pb-4">
        <Text className="text-2xl font-bold text-black">My Caretakers</Text>
        <TouchableOpacity 
          className="w-11 h-11 rounded-full bg-black justify-center items-center"
          onPress={handleAddCaretaker}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white mx-5 mb-5 px-4 rounded-xl border border-gray-200">
        <Ionicons name="search" size={20} color="black" className="mr-3" />
        <TextInput
          className="flex-1 py-4 text-base text-black"
          placeholder="Search patients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Stats Cards
      <View className="flex-row px-5 mb-5 gap-3">
        <View className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-center">
          <Text className="text-2xl font-bold text-black mb-1">{caretakers.length}</Text>
          <Text className="text-xs text-gray-600">Total Patients</Text>
        </View>
        <View className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-center">
          <Text className="text-2xl font-bold text-red-600 mb-1">
            {patients.filter(p => p.status === 'critical').length}
          </Text>
          <Text className="text-xs text-gray-600">Critical</Text>
        </View>
        <View className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-center">
          <Text className="text-2xl font-bold text-yellow-600 mb-1">
            {patients.filter(p => p.status === 'needs-attention').length}
          </Text>
          <Text className="text-xs text-gray-600">Need Attention</Text>
        </View>
        <View className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-center">
          <Text className="text-2xl font-bold text-green-600 mb-1">
            {patients.filter(p => p.status === 'stable').length}
          </Text>
          <Text className="text-xs text-gray-600">Stable</Text>
        </View>
      </View> */}

      {/* Patients List */}
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-5 pb-5">
          {caretakers.map((caretaker) => {
            // const statusClass = getStatusClass(caretaker.status);
            return (
              <TouchableOpacity
                key={caretaker.id}
                className="bg-white rounded-xl p-5 mb-4 border border-gray-200"
                onPress={() => handleCaretakerPress(caretaker)}
              >
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 rounded-full bg-gray-100 justify-center items-center mr-3">
                    <Ionicons name="person" size={24} color="black" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-black mb-1">{caretaker.name}</Text>
                    <Text className="text-sm text-gray-600">{caretaker.email}</Text>
                  </View>
                  {/* <View className={`px-3 py-1.5 rounded-full ${statusClass.split(' ')[0]}`}>
                    <Text className={`text-xs font-semibold capitalize ${statusClass.split(' ')[1]}`}>
                      {caretaker.status.replace('-', ' ')}
                    </Text>
                  </View> */}
                </View>

                <View className="mb-4 space-y-2">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={16} color="black" />
                    <Text className="text-sm text-gray-600 ml-2">Age: {caretaker.age || 'N/A'}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="medical-outline" size={16} color="black" />
                    <Text className="text-sm text-gray-600 ml-2">{caretaker.condition || 'No condition specified'}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={16} color="black" />
                    <Text className="text-sm text-gray-600 ml-2">Last: {caretaker.lastCheckup || 'No checkup'}</Text>
                  </View>
                </View>

                <View className="flex-row justify-around border-t border-gray-100 pt-4">
                  <TouchableOpacity className="flex-row items-center py-2 px-3">
                    <Ionicons name="call-outline" size={16} color="black" />
                    <Text className="text-sm font-medium text-black ml-1.5">Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center py-2 px-3">
                    <Ionicons name="chatbubble-outline" size={16} color="black" />
                    <Text className="text-sm font-medium text-black ml-1.5">Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center py-2 px-3">
                    <Ionicons name="document-text-outline" size={16} color="black" />
                    <Text className="text-sm font-medium text-black ml-1.5">Records</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}