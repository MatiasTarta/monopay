// Archivo: app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
// 1. IMPORTAMOS ESTO
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  // 2. OBTENEMOS LAS MEDIDAS SEGURAS DEL TELÉFONO
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#2ecc71',
        tabBarInactiveTintColor: '#95a5a6',
        
        tabBarStyle: {
          position: 'absolute',
          bottom: 20 + insets.bottom, 
          left: 20,
          right: 20,
          elevation: 5,
          zIndex: 50,
          backgroundColor: '#ffffff',
          borderRadius: 15,
          height: 60,
          ...styles.shadow,
        },
      }}
    >
      <Tabs.Screen
        name="saldo"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons 
                name={focused ? "wallet" : "wallet-outline"} 
                size={28} 
                color={color} 
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="transferWizard"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons 
                name={focused ? "paper-plane" : "paper-plane-outline"} 
                size={28} 
                color={color} 
              />
            </View>
          ),
        }}
      />

        <Tabs.Screen
        name="historial"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons 
                name={focused ? "time" : "time-outline"} 
                size={28} 
                color={color} 
              />
            </View>
          ),
        }}
      />

    </Tabs>
  );
}

const styles = {
  shadow: {
    shadowColor: '#7F5DF0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  }
};