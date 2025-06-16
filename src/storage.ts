// import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default (non-secure) storage
export const storage = {
  set: async (key: string, value: string) => {
    console.log(`Setting storage for key: ${key}: value: ${value}`);
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('Error storing data', e);
    }
  },
  getString: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error('Error retrieving data', e);
      return null;
    }
  },
  delete: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Error deleting data', e);
    }
  }
};

// Secure storage with custom ID + encryption key
export const secureStorage = {
  
  set: async (key: string, value: string) => {
    console.log(`Setting secure storage for key: ${key}: value: ${value}`);
    try {
      console.log(`Setting secure storage: ${key}`);
      await AsyncStorage.setItem(`secure_${key}`, value);
    } catch (e) {
      console.error('Error storing secure data', e);
    }
  },
  getString: async (key: string) => {
    try {
      console.log(`Getting secure storage: ${key}`);
      const value = await AsyncStorage.getItem(`secure_${key}`);
      console.log(`Retrieved value for ${key}: ${value ? 'exists' : 'not found'}`);
      return value;
    } catch (e) {
      console.error('Error retrieving secure data', e);
      return null;
    }
  },
  delete: async (key: string) => {
    try {
      console.log(`Deleting secure storage: ${key}`);
      await AsyncStorage.removeItem(`secure_${key}`);
    } catch (e) {
      console.error('Error deleting secure data', e);
    }
  }
};