import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import useBLE from '../service/ble/useBLE'
import DeviceModal from './DeviceConnectionModal'
import { useBLEStore } from '@/service/ble/bleStore'; // ✅ Zustand store
const Connect = () => {
      const data = useBLEStore((state) => state.data);
      const connectedDevice = useBLEStore((state) => state.connectedDevice);
    const {
        requestPermissions,
        scanForPeripherals,
        allDevices,
        connectToDevice,
        //connectedDevice,
        disconnectFromDevice,
    } = useBLE()
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    
    const scanForDevices = async () => {
        const isPerissionEnabled = await requestPermissions();
        if (isPerissionEnabled) {
            scanForPeripherals();
        }
    }
    useEffect(() => {
        console.log('Connected device changed in connect.tsx :', connectedDevice);
        if (connectedDevice) {
            console.log('Device connected :', connectedDevice.name);
            // Close the modal when device connects
            setIsModalVisible(false);
        } else {
            console.log('No device connected');
        }
    }, [connectedDevice])
    const hideModal = () => {
        setIsModalVisible(false);
    }
    
    const openModal = async () => {
        scanForDevices();
        setIsModalVisible(true);
    }
    
    const handleGoBack = () => {
        router.back();
    }
    
    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header with back button */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
                <TouchableOpacity onPress={handleGoBack} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-black ml-2">Connect Device</Text>
            </View>
            
            <View className="flex-1 justify-center items-center px-4">
                {/* Debug info */}
                <Text className="text-xs text-gray-500 mb-2">
                    Debug: Connected Device: {connectedDevice ? 'YES' : 'NO'} | Heart Rate: {data[1]}
                </Text>
                
                {connectedDevice ? (
                    <View className="bg-gray-100 p-6 rounded-lg w-full items-center mb-6">
                        <Ionicons name="checkmark-circle" size={48} color="black" />
                        <Text className="text-lg font-bold text-black mt-2">Connected to device</Text>
                        <Text className="text-sm text-gray-700 mt-1">{connectedDevice.name}</Text>
                        {data.length>0 && data[1] && (
                            <Text className="text-lg font-bold text-red-600 mt-2">
                                Heart Rate: {data[1]} BPM
                            </Text>
                        )}
                        
                        <TouchableOpacity 
                            className="bg-black py-3 px-6 rounded-lg mt-4"
                            onPress={() => disconnectFromDevice()}>
                            <Text className="text-white font-bold">Disconnect</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="bg-gray-100 p-6 rounded-lg w-full items-center mb-6">
                        <Ionicons name="bluetooth-outline" size={48} color="black" />
                        <Text className="text-lg font-bold text-black mt-2">No device connected</Text>
                        <Text className="text-sm text-gray-700 mt-1 text-center">
                            Connect to your Sensible device to start monitoring your health data
                        </Text>
                    </View>
                )}
                
                <View className="w-full">
                    <Text className="text-lg font-bold text-black mb-4 text-center">
                        Connect to a Bluetooth device
                    </Text>
                    
                    <TouchableOpacity 
                        className="bg-black py-4 rounded-lg items-center"
                        onPress={openModal}>
                        <Text className="text-white font-bold text-base">
                            Scan for Devices
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <DeviceModal
                    visible={isModalVisible}
                    closeModal={hideModal}
                    connectToPeripheral={connectToDevice}
                    devices={allDevices}
                />
            </View>
        </SafeAreaView>
    )
}

export default Connect