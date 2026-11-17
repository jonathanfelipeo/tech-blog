import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginRole, User } from '../types';
import { login, api } from '../api/client';

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  isTeacher: boolean;
  signIn: (role: LoginRole, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@TechBlog:user');
        const storedToken = await AsyncStorage.getItem('@TechBlog:token');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (e) {
        console.error('Erro ao carregar sessão:', e);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const signIn = async (role: LoginRole, email: string, password: string) => {
    const response = await login(role, email, password);
    setUser(response.user);
    setToken(response.token);

    api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;

    await AsyncStorage.setItem('@TechBlog:user', JSON.stringify(response.user));
    await AsyncStorage.setItem('@TechBlog:token', response.token);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('@TechBlog:user');
    await AsyncStorage.removeItem('@TechBlog:token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isTeacher: !!user && user.role === 'teacher',
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);