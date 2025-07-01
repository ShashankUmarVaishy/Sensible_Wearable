import { create } from 'zustand';
import { StateCreator } from 'zustand';
import { Device } from 'react-native-ble-plx';
type BLEState = {
  data: number[];
  setData: (data: number[]) => void;
  connectedDevice: Device | null;
  setConnectedDevice: (device: Device|null) => void;
};

const BLEStore: StateCreator<BLEState> = (set) => ({
  data: [],
  connectedDevice:null ,
  setData: (data) => set({ data }),
  setConnectedDevice:(device)=>set({connectedDevice: device})
});

// Create the store
export const useBLEStore = create<BLEState>(BLEStore);
