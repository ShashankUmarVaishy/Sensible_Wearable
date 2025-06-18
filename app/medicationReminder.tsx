import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from 'toastify-react-native';
import MedicationAlarmService from '../service/medicationAlarmService';

interface Medication {
  id: string;
  name: string;
  image?: string;
  intervals: string[];
  dosage: string;
  notes: string;
  createdAt: string;
  notificationIds?: string[]; // Store notification IDs for scheduled alarms
}

interface TimeSlot {
  id: string;
  label: string;
  time: string;
}

const MEDICATION_STORAGE_KEY = '@medications';

export default function MedicationReminderScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    image: '',
    intervals: [] as string[],
    dosage: '',
    notes: '',
  });

  const predefinedTimeSlots: TimeSlot[] = [
    { id: '1', label: 'Early Morning', time: '05:00' },
    { id: '9', label: 'Morning', time: '08:00' },
    { id: '2', label: 'Early Afternoon', time: '11:00' },
    { id: '5', label: 'Afternoon', time: '01:00' },
    { id: '3', label: 'Evening', time: '18:00' },
    { id: '4', label: 'Early Night', time: '20:00' },
    { id: '6', label: 'Night', time: '22:00' },
    
  ];

  useEffect(() => {
    loadMedications();
    initializeAlarmService();
  }, []);

  const initializeAlarmService = async () => {
    try {
      await MedicationAlarmService.requestPermissions();
      MedicationAlarmService.setupNotificationResponseHandler();
    } catch (error) {
      console.error('Error initializing alarm service:', error);
      Toast.error('Failed to initialize medication alarms');
    }
  };

  const testAlarm = async (medicationName: string, dosage: string) => {
    try {
      const testAlarmData = {
        medicationId: 'test-' + Date.now(),
        medicationName,
        time: '00:00', // Time doesn't matter for test alarms
        dosage,
      };
      
      const notificationId = await MedicationAlarmService.scheduleTestAlarm(testAlarmData, 5);
      if (notificationId) {
        Toast.success('Test alarm will sound in 5 seconds');
      } else {
        Toast.error('Failed to schedule test alarm');
      }
    } catch (error) {
      console.error('Error testing alarm:', error);
      Toast.error('Failed to test alarm');
    }
  };

  const loadMedications = async () => {
    try {
      setLoading(true);
      const storedMedications = await AsyncStorage.getItem(MEDICATION_STORAGE_KEY);
      if (storedMedications) {
        setMedications(JSON.parse(storedMedications));
      }
    } catch (error) {
      console.error('Error loading medications:', error);
      Toast.error('Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const saveMedications = async (medicationsToSave: Medication[]) => {
    try {
      await AsyncStorage.setItem(MEDICATION_STORAGE_KEY, JSON.stringify(medicationsToSave));
    } catch (error) {
      console.error('Error saving medications:', error);
      Toast.error('Failed to save medications');
    }
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.error('Permission to access media library is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setNewMedication(prev => ({
          ...prev,
          image: result.assets[0].uri
        }));
        Toast.success('Image selected successfully');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.error('Failed to select image');
    }
  };

  const handleCameraCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Toast.error('Permission to access camera is required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setNewMedication(prev => ({
          ...prev,
          image: result.assets[0].uri
        }));
        Toast.success('Photo captured successfully');
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Toast.error('Failed to capture photo');
    }
  };

  const toggleTimeSlot = (timeSlot: TimeSlot) => {
    setNewMedication(prev => ({
      ...prev,
      intervals: prev.intervals.includes(timeSlot.time)
        ? prev.intervals.filter(interval => interval !== timeSlot.time)
        : [...prev.intervals, timeSlot.time]
    }));
  };

  const handleAddMedication = async () => {
    if (!newMedication.name.trim()) {
      Toast.error('Please enter medication name');
      return;
    }

    if (newMedication.intervals.length === 0) {
      Toast.error('Please select at least one time interval');
      return;
    }

    try {
      const medicationId = Date.now().toString();
      
      // Schedule alarms for all selected time intervals
      const notificationIds = await MedicationAlarmService.scheduleMultipleAlarms(
        medicationId,
        newMedication.name.trim(),
        newMedication.dosage.trim(),
        newMedication.intervals
      );

      const medication: Medication = {
        id: medicationId,
        name: newMedication.name.trim(),
        image: newMedication.image,
        intervals: newMedication.intervals,
        dosage: newMedication.dosage.trim(),
        notes: newMedication.notes.trim(),
        createdAt: new Date().toISOString(),
        notificationIds: notificationIds,
      };

      const updatedMedications = [...medications, medication];
      setMedications(updatedMedications);
      await saveMedications(updatedMedications);

      // Reset form
      setNewMedication({
        name: '',
        image: '',
        intervals: [],
        dosage: '',
        notes: '',
      });

      setShowAddModal(false);
      Toast.success(`Medication added with ${notificationIds.length} alarms scheduled`);
    } catch (error) {
      console.error('Error adding medication:', error);
      Toast.error('Failed to add medication');
    }
  };

  const handleDeleteMedication = async (medicationId: string) => {
    try {
      // Cancel all alarms for this medication
      await MedicationAlarmService.cancelAllAlarmsForMedication(medicationId);
      
      const updatedMedications = medications.filter(med => med.id !== medicationId);
      setMedications(updatedMedications);
      await saveMedications(updatedMedications);
      Toast.success('Medication and alarms removed successfully');
    } catch (error) {
      console.error('Error deleting medication:', error);
      Toast.error('Failed to remove medication');
    }
  };

  const ImagePickerModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={false}
      onRequestClose={() => {}}
    >
      <View className="flex-1 justify-end bg-black bg-opacity-50">
        <View className="bg-white rounded-t-3xl p-6">
          <Text className="text-xl font-bold text-black text-center mb-6">Select Image</Text>
          <View className="space-y-4">
            <TouchableOpacity
              className="flex-row items-center p-4 bg-gray-50 rounded-xl"
              onPress={handleCameraCapture}
            >
              <Ionicons name="camera" size={24} color="black" />
              <Text className="text-lg font-medium text-black ml-4">Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center p-4 bg-gray-50 rounded-xl"
              onPress={handleImagePicker}
            >
              <Ionicons name="image" size={24} color="black" />
              <Text className="text-lg font-medium text-black ml-4">Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000000" />
          <Text className="text-base text-gray-600 mt-4">Loading medications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-5 pb-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-gray-100 justify-center items-center mr-3"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-black">Medication Reminders</Text>
        </View>
        <TouchableOpacity
          className="w-11 h-11 rounded-full bg-black justify-center items-center"
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View className="flex-row px-5 mb-5 gap-3">
        <View className="flex-1 bg-gray-50 p-4 rounded-xl items-center">
          <Text className="text-2xl font-bold text-black mb-1">{medications.length}</Text>
          <Text className="text-xs text-gray-600">Total Medications</Text>
        </View>
        <View className="flex-1 bg-gray-50 p-4 rounded-xl items-center">
          <Text className="text-2xl font-bold text-black mb-1">
            {medications.reduce((acc, med) => acc + med.intervals.length, 0)}
          </Text>
          <Text className="text-xs text-gray-600">Daily Reminders</Text>
        </View>
      </View>

      {/* Medications List */}
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {medications.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="medical" size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-400 mt-4">No Medications Added</Text>
            <Text className="text-base text-gray-400 mt-2 text-center">
              Tap the + button to add your first medication reminder
            </Text>
          </View>
        ) : (
          <View className="space-y-4 pb-5">
            {medications.map((medication) => (
              <View key={medication.id} className="bg-white rounded-xl p-5 border border-gray-200">
                <View className="flex-row items-start justify-between mb-4">
                  <View className="flex-row items-center flex-1">
                    <View className="w-16 h-16 rounded-xl bg-gray-100 justify-center items-center mr-4">
                      {medication.image ? (
                        <Image
                          source={{ uri: medication.image }}
                          className="w-full h-full rounded-xl"
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons name="medical" size={32} color="black" />
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-lg font-bold text-black mr-2">{medication.name}</Text>
                        {medication.notificationIds && medication.notificationIds.length > 0 && (
                          <View className="bg-green-100 px-2 py-1 rounded-full flex-row items-center">
                            <Ionicons name="alarm" size={12} color="green" />
                            <Text className="text-xs text-green-600 ml-1">Active</Text>
                          </View>
                        )}
                      </View>
                      {medication.dosage && (
                        <Text className="text-sm text-gray-600 mb-1">Dosage: {medication.dosage}</Text>
                      )}
                      <Text className="text-xs text-gray-500">
                        Added: {new Date(medication.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="w-8 h-8 rounded-full bg-blue-100 justify-center items-center"
                      onPress={() => testAlarm(medication.name, medication.dosage)}
                    >
                      <Ionicons name="alarm" size={16} color="blue" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="w-8 h-8 rounded-full bg-red-100 justify-center items-center"
                      onPress={() => handleDeleteMedication(medication.id)}
                    >
                      <Ionicons name="trash" size={16} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Time Intervals */}
                <View className="mb-3">
                  <Text className="text-sm font-semibold text-black mb-2">Reminder Times:</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {medication.intervals.map((interval, index) => (
                      <View key={index} className="bg-black px-3 py-1.5 rounded-full">
                        <Text className="text-xs font-medium text-white">{interval}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Notes */}
                {medication.notes && (
                  <View className="bg-gray-50 p-3 rounded-lg">
                    <Text className="text-sm font-medium text-black mb-1">Notes:</Text>
                    <Text className="text-sm text-gray-600">{medication.notes}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Medication Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="flex-row justify-between items-center px-5 pt-5 pb-4 border-b border-gray-200">
            <TouchableOpacity
              className="w-11 h-11 rounded-full bg-gray-100 justify-center items-center"
              onPress={() => setShowAddModal(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-black">Add Medication</Text>
            <TouchableOpacity
              className="bg-black px-4 py-2 rounded-xl"
              onPress={handleAddMedication}
            >
              <Text className="text-white font-semibold">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-5 py-5" showsVerticalScrollIndicator={false}>
            {/* Medication Name */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-black mb-2">Medication Name *</Text>
              <TextInput
                className="bg-gray-50 p-4 rounded-xl text-base text-black"
                placeholder="Enter medication name"
                value={newMedication.name}
                onChangeText={(text) => setNewMedication(prev => ({ ...prev, name: text }))}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Medication Image */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-black mb-2">Medication Image</Text>
              <TouchableOpacity
                className="w-32 h-32 rounded-xl bg-gray-100 justify-center items-center border-2 border-dashed border-gray-300"
                onPress={handleImagePicker}
              >
                {newMedication.image ? (
                  <Image
                    source={{ uri: newMedication.image }}
                    className="w-full h-full rounded-xl"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="items-center">
                    <Ionicons name="camera" size={32} color="#9CA3AF" />
                    <Text className="text-sm text-gray-400 mt-2">Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View className="flex-row mt-2 space-x-2">
                <TouchableOpacity
                  className="flex-1 bg-gray-50 p-3 rounded-lg flex-row items-center justify-center"
                  onPress={handleCameraCapture}
                >
                  <Ionicons name="camera" size={20} color="black" />
                  <Text className="text-sm font-medium text-black ml-2">Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-gray-50 p-3 rounded-lg flex-row items-center justify-center"
                  onPress={handleImagePicker}
                >
                  <Ionicons name="image" size={20} color="black" />
                  <Text className="text-sm font-medium text-black ml-2">Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Dosage */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-black mb-2">Dosage</Text>
              <TextInput
                className="bg-gray-50 p-4 rounded-xl text-base text-black"
                placeholder="e.g., 1 tablet, 5ml, etc."
                value={newMedication.dosage}
                onChangeText={(text) => setNewMedication(prev => ({ ...prev, dosage: text }))}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Time Intervals */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-black mb-2">Reminder Times *</Text>
              <View className="space-y-3">
                {predefinedTimeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    className={`p-4 rounded-xl border-2 ${
                      newMedication.intervals.includes(slot.time)
                        ? 'bg-black border-black'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                    onPress={() => toggleTimeSlot(slot)}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`text-base font-medium ${
                          newMedication.intervals.includes(slot.time) ? 'text-white' : 'text-black'
                        }`}
                      >
                        {slot.label}
                      </Text>
                      <View
                        className={`w-6 h-6 rounded-full border-2 ${
                          newMedication.intervals.includes(slot.time)
                            ? 'bg-white border-white'
                            : 'border-gray-400'
                        } justify-center items-center`}
                      >
                        {newMedication.intervals.includes(slot.time) && (
                          <Ionicons name="checkmark" size={16} color="black" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-black mb-2">Notes</Text>
              <TextInput
                className="bg-gray-50 p-4 rounded-xl text-base text-black"
                placeholder="Any additional notes or instructions"
                value={newMedication.notes}
                onChangeText={(text) => setNewMedication(prev => ({ ...prev, notes: text }))}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}