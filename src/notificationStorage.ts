import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'notifications_list';

export const getNotifications = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const addNotification = async (newNotif) => {
  console.log('new notif added ');
  const list = await getNotifications();
  const updatedList = [newNotif, ...list];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
};

export const deleteNotification = async (id:string) => {
  const list = await getNotifications();
  const updatedList = list.filter(n => n.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
};

export const markNotificationAsViewed = async (id:string) => {
  const list = await getNotifications();
  const updatedList = list.map(n => (
    n.id === id ? { ...n, viewed: true } : n
  ));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
};
export const markAllNotificationAsViewed = async () => {
  const list = await getNotifications();
  const updatedList = list.map(n=> ({ ...n, viewed: true }));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
};

export const clearAllNotifications = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
