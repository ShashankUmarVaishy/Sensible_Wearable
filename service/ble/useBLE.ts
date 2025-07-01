import * as ExpoDevice from "expo-device";
import { useEffect, useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import BackgroundJob from "react-native-background-actions";
import { secureStorage } from "@/src/storage";
import { useBLEStore } from "./bleStore";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from "react-native-ble-plx";
import { Toast } from "toastify-react-native";
import { notificationToGroupFromPatient } from "../notification/notificationToGroup";

import base64 from "react-native-base64";
interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  allDevices: Device[];
  connectToDevice: (deviceId: Device) => Promise<void>;
  //connectedDevice?: Device | null;
  //data: number[];
  disconnectFromDevice(): void;
}
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHAR_HR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
let prevSignal: number = -2;
let count: number = 0;
let storedToken: string | null = null,
  storedUser: string | null = null;
//characteristic and service id is unique to device we'll have to check device manual OR firmware engineer
async function ensureLocationPermissions() {
  if (Platform.OS === "android") {
    // ACCESS_FINE_LOCATION covers ACCESS_COARSE as well
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error("Location permission not granted");
    }
  }
}

async function ensureBlePermissions() {
  if (Platform.OS === "android" && Platform.Version >= 31) {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      // if you advertise:
      // PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
    ]);

    const allGranted = Object.values(granted).every(
      (status) => status === PermissionsAndroid.RESULTS.GRANTED
    );
    if (!allGranted) {
      throw new Error("BLE permissions not granted");
    }
  }
}

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(() => resolve(), time));
BackgroundJob.on("expiration", () => {
  console.log("I'm now expired");
});
// Global variable to store current heart rate for background task
let currentDataValue: number[] = [];

const taskRandom = async (taskData: any) => {
  storedToken = await secureStorage.getString("userToken");
  if (storedToken) {
    // Verify token with backend
    console.log("Token exists in useBLE : ", storedToken);
  }

  storedUser = await secureStorage.getString("@username");
  if (storedUser) {
    // Verify token with backend
    console.log("User exists in useBLE : ", storedUser);
  }

  if (Platform.OS === "ios") {
    console.warn("Will not be alive by itself");
  }
  await new Promise(async (resolve) => {
    //for loop with a delay
    const { delay } = taskData;
    console.log(BackgroundJob.isRunning(), " ___ ", delay);
    while (BackgroundJob.isRunning()) {
      console.log("Connected . . . ");
      await BackgroundJob.updateNotification({
        taskDesc:
          currentDataValue.length > 0
            ? `Heart Rate: ${currentDataValue[1]} BPM, SPO2: ${currentDataValue[2]}%`
            : "Monitoring heart rate...",
        progressBar: {
          max: 180,
          value:
            currentDataValue.length > 0 && currentDataValue[1] > 2
              ? currentDataValue[1]
              : 0,
        },
      });
      await sleep(delay);
    }
  });
};

const options = {
  taskName: "Sensible",
  taskTitle: "Heart Rate Monitor",
  taskDesc: "Monitoring heart rate from Sensible Wearable ",
  taskIcon: {
    name: "ic_launcher",
    type: "mipmap",
  },
  color: "#ff4444",
  linkingURI: "yourSchemeHere://chat/jane",
  parameters: {
    delay: 4000,
  },
};
function useBLE(): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  //const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  // const [data, setData] = useState<number[]>([]);
  //  const { data, setData } = useBLEStore();
  const setData = useBLEStore.getState().setData;
  const setConnectedDevice = useBLEStore.getState().setConnectedDevice;
  const connectedDevice = useBLEStore.getState().connectedDevice;
  //for scanning for devices with android 31+

  // Start foreground task when device connects
  useEffect(() => {
    if (connectedDevice && !BackgroundJob.isRunning()) {
      console.log("in useBLE :", connectedDevice);
      console.log("Device connected, starting foreground task");
      //startForegroundTask();
    } else if (!connectedDevice && BackgroundJob.isRunning()) {
      console.log("in useBLE :", connectedDevice);
      console.log("Device disconnected, stopping foreground task");
      //stopForegroundTask();
    }
  }, [connectedDevice]);

  useEffect(() => {
    if (connectedDevice) {
      const subscription = bleManager.onDeviceDisconnected(
        connectedDevice.id,
        (error, device) => {
          if (error) {
            console.log("Device disconnection error:", error);
          } else {
            console.log("Device disconnected unexpectedly:", device?.name);
            setConnectedDevice(null);
            setData([]);
            currentDataValue = [];
          }
        }
      );

      return () => subscription.remove();
    }
  }, [connectedDevice]);
  const startForegroundTask = async () => {
    try {
      console.log("Starting foreground task for BLE monitoring");
      await ensureBlePermissions();
      await ensureLocationPermissions();

      await BackgroundJob.start(taskRandom, options);
      console.log("Foreground task started");
    } catch (error) {
      console.log("Error starting foreground task", error);
    }
  };

  const stopForegroundTask = async () => {
    try {
      console.log("Stopping foreground task");
      await BackgroundJob.stop();
      console.log("Foreground task stopped");
    } catch (error) {
      console.log("Error stopping foreground task", error);
    }
  };

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermissions = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Bluetooth Scan Permission",
        message: "This app needs access to Bluetooth scan to find devices.",
        buttonPositive: "OK",
        buttonNegative: "Cancel",
      }
    );
    const bluetoothConnectPermissions = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Bluetooth Connect Permission",
        message: "This app needs to connect to  devices.",
        buttonPositive: "OK",
        buttonNegative: "Cancel",
      }
    );
    const bluetoothFineLocationPermissions = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "This app needs fine location.",
        buttonPositive: "OK",
        buttonNegative: "Cancel",
      }
    );

    return (
      bluetoothScanPermissions === "granted" &&
      bluetoothConnectPermissions === "granted" &&
      bluetoothFineLocationPermissions === PermissionsAndroid.RESULTS.GRANTED
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs fine location.",
            buttonPositive: "OK",
            buttonNegative: "Cancel",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();
        return isAndroid31PermissionsGranted;
      }
    } else {
      //for ios
      return true;
    }
  };

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        Toast.error(error.message);
      }
      if (device && device.name) {
        //add your device name && device.name.includes("Heart Rate")
        setAllDevices((prevDevices) => {
          if (!isDuplicateDevice(prevDevices, device)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });
  };
  const connectToDevice = async (device: Device) => {
    try {
      console.log("Attempting to connect to device:", device.name);
      const deviceConnection = await bleManager.connectToDevice(device.id);
      console.log("Device connection established");

      await deviceConnection.discoverAllServicesAndCharacteristics();
      console.log("Services and characteristics discovered");

      bleManager.stopDeviceScan();
      setConnectedDevice(deviceConnection);
      console.log("Connected device state updated");
      console.log(
        "Connected device(deviceConnection -> setConnectedDevice) : ",
        deviceConnection
      );

      startStreamingData(deviceConnection);
      console.log("Data streaming started");
      startForegroundTask();
      Toast.success(`Connected to ${device.name}`);
      console.log("Device connected successfully");
    } catch (error) {
      console.log("Error connecting to device:", error);
      Toast.error("Failed to connect to device");
    }
  };
  const onDataUpdate = async (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log("Error reading characteristic:", error);
      return;
    } else if (!characteristic?.value) {
      console.log("No Data Recieved");
      return;
    }

    const rawData = base64.decode(characteristic.value);
    //console.log("raw data : ", rawData);
    const resultArray = rawData
      .split(",")
      .map((item: string) => Number(item.trim()));
    setData(resultArray);
    // console.log("result Array : ", resultArray);
    currentDataValue = resultArray; // Update global variable for background task
    if(currentDataValue[0]==8){
      prevSignal=currentDataValue[0];
      count=0;
    }
    else if (currentDataValue[0] === 2) {
      console.log("fall notification");
      notify(storedToken, storedUser, currentDataValue[0]);
    } else if (prevSignal == currentDataValue[0]) {
      console.log("count :", count, " ___ prevvSignal : ", prevSignal);
      count++;
      if (count >= 3) {
        notify(storedToken, storedUser, currentDataValue[0]);
        count = 0;
      }
    } else {
      console.log("changedSignal : prev :",prevSignal,"   ___   curr: ",currentDataValue[0]);
      prevSignal = currentDataValue[0];
      count = 1;
    }
  };
  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHAR_HR_UUID,
        onDataUpdate
      );
    } else {
      console.log("No device connected to start streaming data");
    }
  };
  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setData([]);
      currentDataValue = []; // Reset global heart rate value
      console.log("Device disconnected");
    }
  };
  const notify = async (
    userToken: string,
    userName: string,
    message: number
  ) => {
    console.log("notify called for : ", message);
    const res = await notificationToGroupFromPatient(
      userToken,
      userName,
      message
    );
    if (res.success) {
      Toast.success("Message sent");
    } else {
      Toast.error("Message failed");
    }
  };
  return {
    scanForPeripherals,
    requestPermissions,
    allDevices,
    connectToDevice,
    //connectedDevice,
    // data,
    disconnectFromDevice,
  };
}

export default useBLE;
