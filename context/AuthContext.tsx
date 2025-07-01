import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { getUserInfo } from '../service/user/getUserInfo';
import { secureStorage } from '../src/storage';
import { removeToken } from '@/service/token/removeToken';
import { Toast } from 'toastify-react-native';
interface User {
  id: string;
  name: string;
  email: string;
  token: string;
  age: number;
  phoneNumber: string;
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

      const storedToken = await secureStorage.getString('userToken');
  
      
      if (storedToken) {
        // Verify token with backend

        const userData = await getUserInfo(storedToken);
       
        
        if (userData.success) {
        
          setUser(userData.user);
          await secureStorage.set('@username', userData.user.name);
          setUserToken(storedToken);
        } else {
          // Token is invalid, remove it
        
          await secureStorage.delete('userToken');
          await secureStorage.delete('@username');
        }
      } else {
       Toast.info('Please login again')
      }
    } catch (error) {
      Toast.error('Error checking auth state');
      // If there's an error, clear the token
      await secureStorage.delete('userToken');
      await secureStorage.delete('@username');
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
    await secureStorage.set('@username', userData.name);
    console.log('User logged in successfully');
  };

  const logout = async () => {
    console.log('Logging out user');
    setUser(null);
    setUserToken(null);
    await removeToken(userToken);
    await secureStorage.delete('userToken');
    await secureStorage.delete('@username');
    
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