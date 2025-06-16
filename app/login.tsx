import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Toast } from 'toastify-react-native';
import { useAuth } from '../context/AuthContext';
import { login as loginService } from '../service/user/login';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.error('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginService(email, password);
      
      if (response.success) {
        await login(response.user, response.userToken);
        Toast.success('Login successful!');
        router.replace('/(tabs)');
      } else {
        Toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      Toast.error('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignup = () => {
    router.push('/signup');
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1 pt-20 px-6">
        <View className="items-center mb-10">
          <Ionicons name="medical" size={80} color="black" />
          <Text className="text-3xl font-bold text-black mt-4 mb-2">Sensible</Text>
          <Text className="text-base text-gray-700 text-center">Welcome back! Please sign in to continue.</Text>
        </View>

        <View className="w-full">
          <View className="flex-row items-center bg-white rounded-xl mb-4 px-4 py-1 border border-gray-200">
            <Ionicons name="mail-outline" size={20} color="black" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-black py-4"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="flex-row items-center bg-white rounded-xl mb-4 px-4 py-1 border border-gray-200">
            <Ionicons name="lock-closed-outline" size={20} color="black" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-black py-4"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              className="p-1"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="black"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className={`bg-black rounded-xl py-4 flex-row items-center justify-center mt-2 ${isLoading ? 'opacity-60' : ''}`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white text-base font-semibold mr-2">Sign In</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-500 text-sm">or</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <TouchableOpacity className="items-center" onPress={navigateToSignup}>
            <Text className="text-base text-gray-500">
              Don&apos;t have an account? <Text className="text-black font-semibold">Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}