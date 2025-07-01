import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  Linking,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import { useAuth } from "../../context/AuthContext";
import { getPatients } from "../../service/patient/getPatients";
import { notificationToUser } from "@/service/notification/notificationToUser";
interface Patient {
  id: string;
  name: string;
  email: string;
  age?: number;
  condition?: string;
  phoneNumber?: string;
  lastCheckup?: string;
  status: "critical" | "needs-attention" | "stable";
  avatar?: string;
}

export default function PatientsScreen() {
  const { user, userToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const sendNotification=async(id:string)=>{
    const res=await notificationToUser(userToken?userToken:'',user?.name?user.name:'user',id,8)
    console.log('response : ',res)
    if(res.success){
      Toast.success("Notification sent successfully");
    }else{
      Toast.error("Try contacting him as notification is not sent")
    }
  }

  const fetchPatients = async () => {
    try {
      setLoading(true);
      if (!userToken) {
        Toast.error("User not authenticated");
        return;
      }

      const response = await getPatients(userToken);
      if (response.success) {
        // Map API response to Patient interface with status priority
        console.log("data in patients.tsx ", response);
        const patientsData = response.relations.map((relation: any) => {
          const patient = relation.patient;
          console.log("patient in map ", patient);
          return {
            id: patient.id || patient._id,
            name:
              patient.name ||
              `${patient.firstName || ""} ${patient.lastName || ""}`.trim(),
            email: patient.email,
            age: patient.age,
            phoneNumber: patient.phoneNumber,
            condition: patient.condition || patient.medicalCondition,
            lastCheckup: patient.lastCheckup || patient.lastVisit,
            status:
              patient.status ||
              (patient.priority === "high"
                ? "critical"
                : patient.priority === "medium"
                  ? "needs-attention"
                  : "stable"),
            avatar: "person",
          };
        });
        setPatients(patientsData);
      } else {
        Toast.error(response.message || "Failed to fetch patients");
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      Toast.error("Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, [userToken])
  );

  const handlePatientPress = (patient: Patient) => {
    Toast.info(`Patient: ${patient.name}`);
  };

  const handleAddPatient = () => {
    router.push({
      pathname: "/addHandler",
      params: { type: "patient" },
    });
  };
  const dialScreen = async (number: string) => {
    if (number.length === 10) {
      const url = `tel:${number}`;
      Linking.openURL(url);
    } else {
      alert("Phone number is not provided");
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="text-base text-gray-600 mt-4">
            Loading patients...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-5 pb-4">
        <Text className="text-2xl font-bold text-black">My Patients</Text>
        <TouchableOpacity
          className="w-11 h-11 rounded-full bg-black justify-center items-center"
          onPress={handleAddPatient}
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

      {/* Stats Cards */}
      <View className="flex-row px-5 mb-5 gap-3">
        <View className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-center">
          <Text className="text-2xl font-bold text-black mb-1">
            {patients.length}
          </Text>
          <Text className="text-xs text-gray-600">Total Patients</Text>
        </View>
        <View className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-center">
          <Text className="text-2xl font-bold text-red-600 mb-1">
            {patients.filter((p) => p.status === "critical").length}
          </Text>
          <Text className="text-xs text-gray-600">Critical</Text>
        </View>
        <View className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-center">
          <Text className="text-2xl font-bold text-yellow-600 mb-1">
            {patients.filter((p) => p.status === "needs-attention").length}
          </Text>
          <Text className="text-xs text-gray-600">Need Attention</Text>
        </View>
        <View className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-center">
          <Text className="text-2xl font-bold text-green-600 mb-1">
            {patients.filter((p) => p.status === "stable").length}
          </Text>
          <Text className="text-xs text-gray-600">Stable</Text>
        </View>
      </View>

      {/* Patients List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-5 pb-5">
          {patients.map((patient) => {
            // const statusClass = getStatusClass(patient.status);
            return (
              <TouchableOpacity
                key={patient.id}
                className="bg-white rounded-xl p-5 mb-4 border border-gray-200"
                onPress={() => handlePatientPress(patient)}
              >
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 rounded-full bg-gray-100 justify-center items-center mr-3">
                    <Ionicons name="person" size={24} color="black" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-black mb-1">
                      {patient.name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {patient.email}
                    </Text>
                  </View>
                  {/* <View className={`px-3 py-1.5 rounded-full ${statusClass.split(' ')[0]}`}>
                    <Text className={`text-xs font-semibold capitalize ${statusClass.split(' ')[1]}`}>
                      {patient.status.replace('-', ' ')}
                    </Text>
                  </View> */}
                </View>

                <View className="mb-4 space-y-2">
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={16} color="black" />
                    <Text className="text-sm text-gray-600 ml-2">
                      Age: {patient.age || "N/A"}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="medical-outline" size={16} color="black" />
                    <Text className="text-sm text-gray-600 ml-2">
                      {patient.condition || "No condition specified"}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={16} color="black" />
                    <Text className="text-sm text-gray-600 ml-2">
                      Last: {patient.lastCheckup || "No checkup"}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-around border-t border-gray-100 pt-4">
                  <TouchableOpacity className="flex-row items-center py-2 px-3"
                  onPress={()=>{
                    console.log(patient);
                    if(patient.phoneNumber && patient.phoneNumber.length===10 ){
                      dialScreen(patient.phoneNumber)
                    }else{
                      Toast.error('Phone Number is Not provided, You can try to refrest the app')
                    }
                  }}
                  >
                    <Ionicons name="call-outline" size={16} color="black" />
                    <Text className="text-sm font-medium text-black ml-1.5">
                      Call
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center py-2 px-3"
                  onPress={()=>sendNotification(patient.id)}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={16}
                      color="black"
                    />
                    <Text className="text-sm font-medium text-black ml-1.5">
                      Message
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center py-2 px-3">
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color="black"
                    />
                    <Text className="text-sm font-medium text-black ml-1.5">
                      Records
                    </Text>
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
