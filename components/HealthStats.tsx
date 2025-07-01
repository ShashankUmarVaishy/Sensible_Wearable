import { View, Text } from 'react-native';
import React,{use, useEffect, useState} from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useBLEStore } from '@/service/ble/bleStore'; 
//import  useBLE from '@/service/ble/useBLE';
const HealthStats = () => {
  const data = useBLEStore((state) => state.data); 
  const connectedDevice=useBLEStore((state)=>state.connectedDevice)
  const [dataSet,setDataSet]=useState<number[]>([])
 //const { connectedDevice } = useBLE(); 
useEffect(() => {
  console.log('data in hs :',data)
setDataSet(data)
}, [data]);
  const healthStats = [
    { label: 'Heart Rate', value: dataSet?.[1] ? `${dataSet[1]} BPM` : '--', icon: 'heart' },
    { label: 'Oxygen Level', value: `${dataSet[2]} %`, icon: 'fitness' },
  ];

  return (
    <View>
      {dataSet.length > 0 ? (
        <View className="mb-6">
          <Text className="text-xl font-semibold text-black mb-4 px-5">
            Health Metrics
          </Text>
          <View className="px-5 space-y-3">
            {healthStats.map((stat, index) => (
              <View
                key={index}
                className="bg-white p-4 rounded-xl border border-gray-200"
              >
                <View className="flex-row items-center mb-2">
                  <Ionicons name={stat.icon as any} size={20} color="black" />
                  <Text className="text-sm text-gray-600 ml-2">
                    {stat.label}
                  </Text>
                </View>
                <Text className="text-xl font-semibold text-black">
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View className="px-5 py-4">
          <Text className="text-red-600 text-base">Not Connected To Any Device</Text>
        </View>
      )}
    </View>
  );
};

export default HealthStats;

