import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Toast } from 'toastify-react-native';
import { useAuth } from '../context/AuthContext';

export default function LogoutScreen() {
  const { logout } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        Toast.success('Logged out successfully');
        router.replace('/login');
      } catch (error) {
        console.error('Logout error:', error);
        Toast.error('Error during logout');
        router.replace('/login');
      }
    };

    performLogout();
  }, [logout]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4F46E5" />
      <Text style={styles.text}>Logging out...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});