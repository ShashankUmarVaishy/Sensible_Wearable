import { storage, secureStorage } from './storage';

// Generic helper for normal storage
export const saveToStorage = async <T>(key: string, value: T) => {
  await storage.set(key, JSON.stringify(value));
};
    
export const loadFromStorage = async <T>(key: string): Promise<T | null> => {
  const value = await storage.getString(key);
  return value ? JSON.parse(value) as T : null;
};

export const deleteFromStorage = async (key: string) => {
  await storage.delete(key);
};

// Generic helper for secure storage
export const saveToSecureStorage = async <T>(key: string, value: T) => {
  console.log(`Saving to secure storage: ${value} :  ${key}`);
  await secureStorage.set(key, JSON.stringify(value));
};

export const loadFromSecureStorage = async <T>(key: string): Promise<T | null> => {
  const value = await secureStorage.getString(key);
  return value ? JSON.parse(value) as T : null;
};

export const deleteFromSecureStorage = async (key: string) => {
  await secureStorage.delete(key);
};