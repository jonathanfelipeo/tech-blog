import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';

import { HomeScreen } from '../screens/HomeScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { PostFormScreen } from '../screens/PostFormScreen';
import { AdminPostsScreen } from '../screens/AdminPostsScreen';
import { TeacherListScreen } from '../screens/TeacherListScreen';
import { TeacherFormScreen } from '../screens/TeacherFormScreen';
import { StudentListScreen } from '../screens/StudentListScreen';
import { StudentFormScreen } from '../screens/StudentFormScreen';
import { LoginScreen } from '../screens/LoginScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { isTeacher, user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1E3A8A' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: { paddingBottom: 6, height: 58 },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Blog',
          tabBarLabel: 'Blog',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📰</Text>,
        }}
      />

      {isTeacher && (
        <>
          <Tab.Screen
            name="AdminPostsTab"
            component={AdminPostsScreen}
            options={{
              title: 'Gerenciar Posts',
              tabBarLabel: 'Gerenciar Posts',
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚙️</Text>,
            }}
          />
          <Tab.Screen
            name="TeachersTab"
            component={TeacherListScreen}
            options={{
              title: 'Gestão de Professores',
              tabBarLabel: 'Professores',
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👨‍🏫</Text>,
            }}
          />
          <Tab.Screen
            name="StudentsTab"
            component={StudentListScreen}
            options={{
              title: 'Gestão de Alunos',
              tabBarLabel: 'Alunos',
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🎓</Text>,
            }}
          />
        </>
      )}

      <Tab.Screen
        name="LoginTab"
        component={LoginScreen}
        options={{
          title: user ? 'Minha conta' : 'Entrar',
          tabBarLabel: user ? 'Minha conta' : 'Login',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>{user ? '👤' : '🔒'}</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { loading, isTeacher } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PostDetail"
          component={PostDetailScreen}
          options={{ title: 'Leitura do Post' }}
        />

        {isTeacher && (
          <>
            <Stack.Screen
              name="PostForm"
              component={PostFormScreen}
              options={{ title: 'Formulário de Postagem' }}
            />
            <Stack.Screen
              name="TeacherForm"
              component={TeacherFormScreen}
              options={{ title: 'Formulário de Professor' }}
            />
            <Stack.Screen
              name="StudentForm"
              component={StudentFormScreen}
              options={{ title: 'Formulário de Aluno' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};