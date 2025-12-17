import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { socket } from '../services/socket';

export default function LoginScreen() {
  const [mode, setMode] = useState<'CREATE' | 'JOIN'>('CREATE');
  const [nombre, setNombre] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false); // Para feedback visual
  const router = useRouter();

  // ESCUCHAMOS LA RESPUESTA DEL SERVIDOR
  useEffect(() => {
    // 1. Si el servidor dice "Éxito" -> Navegamos
    socket.on('join_success', (room) => {
      setLoading(false);
      router.replace({
        pathname: '/(tabs)/saldo',
        params: { userName: nombre }
      });
    });

    // 2. Si el servidor dice "Error" -> Mostramos alerta
    socket.on('error_message', (msg) => {
      setLoading(false);
      Alert.alert("Error al ingresar", msg);
    });

    // Limpieza
    return () => {
      socket.off('join_success');
      socket.off('error_message');
    };
  }, [nombre]); // Dependencia nombre para usarlo en router

  const handleStart = () => {
    if (nombre.trim().length === 0) {
      Alert.alert("Falta información", "Por favor escribe tu nombre");
      return;
    }

    if (mode === 'JOIN' && roomCode.trim().length !== 4) {
      Alert.alert("Código inválido", "El código debe tener 4 letras");
      return;
    }

    setLoading(true); // Bloqueamos botón y mostramos carga

    // Conectamos
    if (!socket.connected) socket.connect();

    // ENVIAMOS LA ACCIÓN EXPLÍCITA (CREATE o JOIN)
    socket.emit('join_game', { 
      playerName: nombre,
      roomCode: mode === 'JOIN' ? roomCode : undefined,
      action: mode // <--- ESTO ES LO NUEVO IMPORTANTE
    });
    
    // NOTA: Ya no hay router.replace aquí. Esperamos al useEffect.
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎩</Text>
      <Text style={styles.title}>Monopoly Bank</Text>
      
      <View style={styles.card}>
        {/* PESTAÑAS */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, mode === 'CREATE' && styles.activeTab]} 
            onPress={() => setMode('CREATE')}>
            <Text style={[styles.tabText, mode === 'CREATE' && styles.activeTabText]}>Crear Sala</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, mode === 'JOIN' && styles.activeTab]} 
            onPress={() => setMode('JOIN')}>
            <Text style={[styles.tabText, mode === 'JOIN' && styles.activeTabText]}>Unirse</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Tu Nombre:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Juan"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
          editable={!loading}
        />

        {mode === 'JOIN' && (
          <>
            <Text style={styles.label}>Código de Sala:</Text>
            <TextInput
              style={[styles.input, { letterSpacing: 5, fontWeight: 'bold', textAlign: 'center' }]}
              placeholder="ABCD"
              maxLength={4}
              value={roomCode}
              onChangeText={(t) => setRoomCode(t.toUpperCase())}
              autoCapitalize="characters"
              editable={!loading}
            />
          </>
        )}

        <TouchableOpacity 
            style={[styles.button, loading && {opacity: 0.7}]} 
            onPress={handleStart}
            disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
                {mode === 'CREATE' ? 'INICIAR NUEVA PARTIDA' : 'ENTRAR A LA SALA'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2c3e50', justifyContent: 'center', padding: 20 },
  emoji: { fontSize: 60, textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 20 },
  tabs: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#f0f0f0', borderRadius: 10, padding: 4 },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontWeight: '600', color: '#95a5a6' },
  activeTabText: { color: '#2c3e50', fontWeight: 'bold' },
  label: { fontSize: 14, marginBottom: 8, fontWeight: '600', color: '#34495e' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 12, fontSize: 18, marginBottom: 20, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#27ae60', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});