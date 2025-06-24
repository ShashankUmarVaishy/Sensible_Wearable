import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  Linking,
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
  phoneNumber?: string;
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
        
        const caretakerData = response.relations.map((relation:any) => {
          const caretaker=relation.caretaker;
          return({
          id: caretaker.id || caretaker._id,
          name: caretaker.name || `${caretaker.firstName || ''} ${caretaker.lastName || ''}`.trim(),
          email: caretaker.email,
          age: caretaker.age,
          phoneNumber: caretaker.phoneNumber,
          condition: caretaker.condition || caretaker.medicalCondition,
          lastCheckup: caretaker.lastCheckup || caretaker.lastVisit,
          status: caretaker.status || (caretaker.priority === 'high' ? 'critical' : 
                   caretaker.priority === 'medium' ? 'needs-attention' : 'stable'),
          avatar: 'person',
        })});
        setCaretakers(caretakerData);
      } else {
        Toast.error(response.message || 'Failed to fetch patients');
      }
    } catch (error) {
      Toast.error(error.message || 'An error occurred while fetching patients.');
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

  // Sort patients by status priority: critical -> needs-attention -> stabl

  const handleCaretakerPress = async(caretakerId: string) => {
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
   const dialScreen = async (number: string) => {
    if (number.length === 10) {
      const url = `tel:${number}`;
      Linking.openURL(url);
    } else {
      alert("Phone number is not provided");
    }
  };

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


      {/* caretakers List */}
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

                <View className="flex-row justify-around border-t border-gray-100 pt-4">
                  <TouchableOpacity className="flex-row items-center py-2 px-3"
                  onPress={()=>{
                   if(caretaker.phoneNumber){
                     dialScreen(caretaker.phoneNumber);
                   }else{
                    Toast.error("Phone number is not provided")
                   }
                  }}
                  >
                    <Ionicons name="call-outline" size={16} color="black" />
                    <Text className="text-sm font-medium text-black ml-1.5">Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center py-2 px-3"
                  onPress={()=>handleCaretakerPress(caretaker.id)}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color="black" />
                    <Text className="text-sm font-medium text-black ml-1.5">Message</Text>
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