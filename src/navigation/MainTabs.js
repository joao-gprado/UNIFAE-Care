// src/navigation/MainTabs.js
import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Início:     '🏠',
  Exercícios: '🦾',
  Relatos:    '📋',
  Progresso:  '📊',
  Perfil:     '👤',
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 19, opacity: focused ? 1 : 0.4 }}>
            {ICONS[route.name]}
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
      <Tab.Screen name="Exercícios" component={HomeScreen} />
      <Tab.Screen name="Relatos"    component={HomeScreen} />
      <Tab.Screen name="Progresso"  component={HomeScreen} />
      <Tab.Screen name="Perfil"     component={ProfileScreen} />
    </Tab.Navigator>
  );
}