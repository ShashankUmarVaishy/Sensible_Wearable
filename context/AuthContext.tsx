import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { getUserInfo } from '../service/user/getUserInfo';
import { secureStorage } from '../src/storage';

interface User {
  id: string;
  name: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  userToken: string | null;
  isLoading: boolean;
  login: (userData: User, userToken : string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('Checking auth state...');
      const storedToken = await secureStorage.getString('userToken');
      console.log('Stored token:', storedToken ? 'exists' : 'not found');
      
      if (storedToken) {
        // Verify token with backend
        console.log('Verifying token with backend...');
        const userData = await getUserInfo(storedToken);
        console.log('User data:', userData);
        
        if (userData.success) {
          console.log('Token is valid, setting user data');
          setUser(userData.user);
          setUserToken(storedToken);
        } else {
          // Token is invalid, remove it
          console.log('Token is invalid, removing it');
          await secureStorage.delete('userToken');
        }
      } else {
        console.log('No token found');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // If there's an error, clear the token
      await secureStorage.delete('userToken');
    } finally {
      console.log('Auth check complete, setting isLoading to false');
      setIsLoading(false);
    }
  };

  const login = async (userData: User, userToken:string) => {
    console.log('Logging in user:', userData.email);
    console.log('Setting user data and token : ', userData);
    setUser(userData);
    setUserToken(userToken);
    await secureStorage.set('userToken', userToken);
    console.log('User logged in successfully');
  };

  const logout = async () => {
    console.log('Logging out user');
    setUser(null);
    setUserToken(null);
    await secureStorage.delete('userToken');
    
    // Clear medication data from AsyncStorage
    try {
      await AsyncStorage.removeItem('@medications');
      console.log('Medication data cleared from storage');
    } catch (error) {
      console.error('Error clearing medication data:', error);
    }
    
    console.log('User logged out successfully');
  };

  const isAuthenticated = !!user && !!userToken;

  const value: AuthContextType = {
    user,
    userToken,
    isLoading,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};