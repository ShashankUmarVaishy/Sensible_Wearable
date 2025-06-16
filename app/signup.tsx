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
import { signup as signupService } from '../service/user/signup';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Toast.error('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Toast.error('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Toast.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await signupService(name, email, password);
      
      if (response.success) {
        await login(response.user, response.userToken);
        Toast.success('Account created successfully!');
        router.replace('/(tabs)');
      } else {
        Toast.error(response.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Toast.error('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white" 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1 px-6 py-10">
        <View className="items-center mb-10">
          <Ionicons name="medical" size={80} color="black" />
          <Text className="text-3xl font-bold text-black mt-4 mb-2">Join Sensible</Text>
          <Text className="text-base text-gray-600 text-center">
            Create your account to get started with healthcare management.
          </Text>
        </View>

        <View className="w-full">
          <View className="flex-row items-center bg-white rounded-xl mb-4 px-4 py-1 border border-gray-200">
            <Ionicons name="person-outline" size={20} color="black" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-black py-4"
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholderTextColor="#9CA3AF"
            />
          </View>

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

          <View className="flex-row items-center bg-white rounded-xl mb-4 px-4 py-1 border border-gray-200">
            <Ionicons name="lock-closed-outline" size={20} color="black" className="mr-3" />
            <TextInput
              className="flex-1 text-base text-black py-4"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              className="p-1"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="black"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className={`bg-black rounded-xl py-4 flex-row items-center justify-center mt-2 ${isLoading ? 'opacity-60' : ''}`}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white text-base font-semibold mr-2">Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-500 text-sm">or</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <TouchableOpacity className="items-center" onPress={navigateToLogin}>
            <Text className="text-base text-gray-600">
              Already have an account? <Text className="text-black font-semibold">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}