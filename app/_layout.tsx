// Archivo: app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* Definimos 'index' (tu Login) como la primera pantalla.
        options={{ headerShown: false }} es para ocultar la barra de arriba en el login.
      */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      
      {/* Definimos '(tabs)' como la siguiente sección.
        También ocultamos el header porque las tabs tienen el suyo propio.
      */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}