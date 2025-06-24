import { Ionicons } from '@expo/vector-icons';
import React ,{useState, useEffect, useRef} from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FlatList, SafeAreaView,RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { getNotifications, markAllNotificationAsViewed, clearAllNotifications } from '@/src/notificationStorage'

dayjs.extend(relativeTime);

const NotificationPage = ({ onClose, notification }:any) => {
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = async () => {
      setRefreshing(true);
      await loadData();
      setRefreshing(false);
    };
  const [changed, setChanged]= useState<boolean>(false)
 const [notifications, setNotifications] = useState([]);

  const loadData = async () => {
    const data = await getNotifications();
   console.log(data)
    setNotifications(data);
    
  };

  useEffect(() => {
    
    console.log('Loading data...');
    loadData();
  }, [notification,changed]);


  const renderNotificationItem = ({ item }:any) => (
    <TouchableOpacity 
      className={`flex-row items-center p-4 border-b border-gray-200 ${item.read ? 'bg-white' : 'bg-gray-50'}`}
    >
      <View className="flex-1">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-semibold text-black">{item.title}</Text>
          {!item.viewed && <View className="w-2 h-2 rounded-full bg-black" />}
        </View>
        <Text className="text-sm text-gray-700 mt-1">{item.body}</Text>
        <Text className="text-xs text-gray-500 mt-1"> {dayjs(item.timestamp).fromNow()} {item.viewed ? '(Viewed)' : '(New)'}</Text>
      </View>
    </TouchableOpacity>
  );



  return (
    <SafeAreaView className="flex-1 flex-col justify-between bg-white">
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-black">Notifications</Text>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
        <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        className="flex-1"
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-10">
            <Ionicons name="notifications-off-outline" size={48} color="gray" />
            <Text className="text-gray-500 text-center mt-4">No notifications yet</Text>
          </View>
        }
        refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          // Optional: Customize colors
          tintColor="#007bff" // iOS
          colors={['#007bff']} // Android
          progressBackgroundColor="#ffffff" // Android
        />
      }
      />
      
   
      <View className='flex-row justify-around'>

      
      <TouchableOpacity className="m-4 py-4 px-8 bg-black rounded-lg items-center"
       onPress={async()=>{
        await markAllNotificationAsViewed()
        setChanged(v=>!v)
      }}
      >
        <Text className="text-white font-semibold">All Read</Text>
      </TouchableOpacity>
      <TouchableOpacity className="m-4 py-4 px-8 bg-black rounded-lg items-center"
      onPress={async()=>{
        setChanged(v=>!v)
        await clearAllNotifications()
        
      }}
      >
        <Text className="text-white font-semibold">Delete All</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NotificationPage;