import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('Checking authentication...', { isAuthenticated, isLoading });
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('User is authenticated, redirecting to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('User is not authenticated, redirecting to login');
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading]);

  // Show loading screen while checking authentication
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="black" />
      <Text className="mt-4 text-gray-600">Loading...</Text>
    </View>
  );
}