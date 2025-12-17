import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { socket } from '../services/socket'; // <--- Importamos el socket

export default function LoginScreen() {
  const [nombre, setNombre] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (nombre.trim().length === 0) {
      Alert.alert("Error", "Por favor escribe tu nombre");
      return;
    }

    console.log(`🔌 Conectando como ${nombre}...`);
    
    // 1. Conectar físicamente
    if (!socket.connected) {
      socket.connect();
    }

    // 2. Enviar mensaje al servidor (Backend)
    // Nota: Si no mandamos roomCode, el server crea una sala nueva (Host)
    socket.emit('join_game', { 
      playerName: nombre 
      // roomCode: 'ABCD' // Si quisieras unirte a una específica
    });

    // 3. Navegar a la pantalla de saldo
    router.replace({
      pathname: '/(tabs)/saldo',
      params: { userName: nombre }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🏦</Text>
      <Text style={styles.title}>Monopoly Bank</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Nombre del Jugador:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Juan"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>CREAR PARTIDA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2c3e50', justifyContent: 'center', padding: 20 },
  emoji: { fontSize: 80, textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 40 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 15 },
  label: { fontSize: 16, marginBottom: 10, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, fontSize: 18, marginBottom: 20 },
  button: { backgroundColor: '#27ae60', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});