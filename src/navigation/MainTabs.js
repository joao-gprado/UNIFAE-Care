import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const ICONS = { Início: '🏠', Agenda: '📅', Progresso: '📈', Perfil: '👤' };

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>
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
      <Tab.Screen name="Início" component={ProfileScreen} />
      <Tab.Screen name="Agenda" component={ProfileScreen} />
      <Tab.Screen name="Progresso" component={ProfileScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
