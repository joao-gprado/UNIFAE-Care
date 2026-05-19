// src/navigation/MainTabs.js
import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ExerciciosScreen from '../screens/ExerciciosScreen';
import RelatosScreen from '../screens/RelatosScreen';
import ProgressoScreen from '../screens/ProgressoScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Início:     { icon: '🏠', iconFocused: '🏠' },
  Exercícios: { icon: '🦾', iconFocused: '🦾' },
  Relatos:    { icon: '📋', iconFocused: '📋' },
  Progresso:  { icon: '📊', iconFocused: '📊' },
  Perfil:     { icon: '👤', iconFocused: '👤' },
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.4 }}>
            {ICONS[route.name]?.icon ?? '●'}
          </Text>
        ),
        tabBarActiveTintColor: '#2A7A3B',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          borderTopColor: '#E5E7EB',
          paddingBottom: 6,
          height: 62,
        },
      })}
    >
      <Tab.Screen name="Início"     component={HomeScreen} />
      <Tab.Screen name="Exercícios" component={ExerciciosScreen} />
      <Tab.Screen name="Relatos"    component={RelatosScreen} />
      <Tab.Screen name="Progresso"  component={ProgressoScreen} />
      <Tab.Screen name="Perfil"     component={ProfileScreen} />
    </Tab.Navigator>
  );
}
