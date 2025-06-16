import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

// Dummy notification data
const dummyNotifications = [
  {
    id: '1',
    title: 'Medication Reminder',
    message: 'Time to take your daily medication',
    time: '10 minutes ago',
    read: false,
    type: 'medication'
  },
  {
    id: '2',
    title: 'Appointment Scheduled',
    message: 'Your doctor appointment is confirmed for tomorrow at 2:00 PM',
    time: '2 hours ago',
    read: true,
    type: 'appointment'
  },
  {
    id: '3',
    title: 'Health Alert',
    message: 'Your heart rate was above normal for 30 minutes today',
    time: 'Yesterday',
    read: false,
    type: 'alert'
  },
  {
    id: '4',
    title: 'Device Update',
    message: 'Your Sensible device has a new firmware update available',
    time: '2 days ago',
    read: true,
    type: 'device'
  },
  {
    id: '5',
    title: 'New Caretaker Added',
    message: 'John Doe has been added as your caretaker',
    time: '3 days ago',
    read: true,
    type: 'caretaker'
  }
];

// Icon mapping for notification types
const getNotificationIcon = (type:any) => {
  switch (type) {
    case 'medication':
      return 'medical-outline';
    case 'appointment':
      return 'calendar-outline';
    case 'alert':
      return 'warning-outline';
    case 'device':
      return 'hardware-chip-outline';
    case 'caretaker':
      return 'person-add-outline';
    default:
      return 'notifications-outline';
  }
};

const NotificationPage = ({ onClose }:any) => {
  const renderNotificationItem = ({ item }:any) => (
    <TouchableOpacity 
      className={`flex-row items-center p-4 border-b border-gray-200 ${item.read ? 'bg-white' : 'bg-gray-50'}`}
    >
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
        <Ionicons name={getNotificationIcon(item.type)} size={20} color="black" />
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-semibold text-black">{item.title}</Text>
          {!item.read && <View className="w-2 h-2 rounded-full bg-black" />}
        </View>
        <Text className="text-sm text-gray-700 mt-1">{item.message}</Text>
        <Text className="text-xs text-gray-500 mt-1">{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-black">Notifications</Text>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={dummyNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        className="flex-1"
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-10">
            <Ionicons name="notifications-off-outline" size={48} color="gray" />
            <Text className="text-gray-500 text-center mt-4">No notifications yet</Text>
          </View>
        }
      />
      
      <TouchableOpacity className="m-4 p-4 bg-black rounded-lg items-center">
        <Text className="text-white font-semibold">Mark All as Read</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default NotificationPage;