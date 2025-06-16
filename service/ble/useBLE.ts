/* eslint-disable no-bitwise */
import { BlendMode } from "@shopify/react-native-skia";
import * as ExpoDevice from "expo-device";
import { useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleError, BleManager, Characteristic, Device } from "react-native-ble-plx";
import base64 from "react-native-base64";
interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  allDevices: Device[];
  connectToDevice: (deviceId:Device)=>Promise<void>
  connectedDevice?: Device | null  ;
  heartRate: number;
  disconnectFromDevice():void;
}
const HEART_RATE_UUID="0000002A37-0000-1000-8000-00805f9b34fb"; //this is the heart rate characteristic id
const HEART_RATE_CHARACTERISTIC="0000180D-0000-1000-8000-00805f9b34fb"; //this is the heart rate service id
//characteristic and service id is unique to devvice we'll have to check device manual OR firmware engineer

function useBLE(): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

    const [heartRate, setHeartRate] =useState<number>(-1);
  //for scanning for devices with android 31+
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

  const isDuplicateDevice=(devices:Device[], nextDevice: Device)=>
    devices.findIndex((device)=>nextDevice.id === device.id)>-1;

  const scanForPeripherals = () => {
    bleManager.startDeviceScan(null,null, (error,device)=>{
        if(error){
            console.log('Error scanning:', error)
        }
        if(device && device.name ) {
            //add your device name && device.name.includes("Heart Rate")
            setAllDevices((prevDevices)=>{
                if( !isDuplicateDevice(prevDevices, device)){
                    return [...prevDevices, device];
                }
                return prevDevices;
            })
        }
    })
  };
  const connectToDevice = async (device:Device) => {
    try {
        const deviceConnection = await bleManager.connectToDevice(device.id);
        await deviceConnection.discoverAllServicesAndCharacteristics();
        bleManager.stopDeviceScan();
        startStreamingData(deviceConnection);
    } catch (error) {
        console.log('Error connecting to device:', error);

    }
  }
  const onHeartRateUpdate = (
    error  : BleError | null,
    characteristic: Characteristic | null,

  )=>{
    if (error) {
        console.log('Error reading characteristic:', error);
        return;
    }
    else if (!characteristic?.value) {
        console.log("No Data Recieved")
        return
    }

    const rawData= base64.decode(characteristic.value);
    let innerheartRate: number= -1;
    const firstBiValue : number = Number(rawData) && 0x01
    if(firstBiValue === 0){
        innerheartRate = rawData[1].charCodeAt(0)
    }else{
        innerheartRate =
        Number(rawData[1].charCodeAt(0)<<8)+
        Number(rawData[2].charCodeAt(2));
    }
    setHeartRate(innerheartRate);
  }
  const startStreamingData=async (device:Device)=>{
    if(device){
        device.monitorCharacteristicForService(
            HEART_RATE_UUID,
            HEART_RATE_CHARACTERISTIC,
            onHeartRateUpdate
        )
    }else{
        console.log('No device connected to start streaming data');
    }
  }
  const disconnectFromDevice= ()=>{
    if(connectedDevice){
        bleManager.cancelDeviceConnection(connectedDevice.id);
        setConnectedDevice(null);
        setHeartRate(0);
    }
  }
  return {
    scanForPeripherals,
    requestPermissions,
    allDevices,
    connectToDevice,
    connectedDevice,
    heartRate,
    disconnectFromDevice,
  };
}
export default useBLE;
