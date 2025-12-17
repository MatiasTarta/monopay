import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { socket } from '../services/socket';

const COLORS = [
  '#e74c3c', 
  '#3498db', 
  '#2ecc71', 
  '#f1c40f', 
  '#9b59b6', 
  '#34495e',
];

export default function LoginScreen() {
  const [mode, setMode] = useState<'CREATE' | 'JOIN'>('CREATE');
  const [nombre, setNombre] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [initialBalance, setInitialBalance] = useState('25000'); 
  const [goReward, setGoReward] = useState('5000');

  const router = useRouter();

  useEffect(() => {
    socket.on('join_success', (room) => {
      setLoading(false);
      router.replace({
        pathname: '/(tabs)/saldo',
        params: { 
          userName: nombre,
          userColor: selectedColor 
        }
      });
    });

    socket.on('error_message', (msg) => {
      setLoading(false);
      Alert.alert("Error al ingresar", msg);
    });

    return () => {
      socket.off('join_success');
      socket.off('error_message');
    };
  }, [nombre, selectedColor]);

  const handleStart = () => {
    if (nombre.trim().length === 0) {
      Alert.alert("Falta información", "Por favor escribe tu nombre");
      return;
    }

    if (mode === 'JOIN' && roomCode.trim().length !== 4) {
      Alert.alert("Código inválido", "El código debe tener 4 letras");
      return;
    }

    setLoading(true);
    if (!socket.connected) socket.connect();

    socket.emit('join_game', { 
      playerName: nombre,
      roomCode: mode === 'JOIN' ? roomCode : undefined,
      action: mode,
      color: selectedColor,
      settings: mode === 'CREATE' ? {
        initialBalance: parseInt(initialBalance),
        goReward: parseInt(goReward)
      } : undefined
    });
  };

  return (
    <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="handled">
    <View style={styles.container}>
      <Text style={styles.emoji}>🎩</Text>
      <Text style={styles.title}>Monopay</Text>
      
      <View style={styles.card}>
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

        <Text style={styles.label}>Elige tu Color:</Text>
        <View style={styles.colorContainer}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorCircle, 
                { backgroundColor: c },
                selectedColor === c && styles.colorSelected
              ]}
              onPress={() => setSelectedColor(c)}
            />
          ))}
        </View>

        {mode === 'CREATE' && (
          <View style={styles.settingsContainer}>
            <View style={{flex: 1, marginRight: 10}}>
              <Text style={styles.labelSmall}>Saldo Inicial ($)</Text>
              <TextInput
                style={styles.inputSmall}
                value={initialBalance}
                onChangeText={setInitialBalance}
                keyboardType="numeric"
              />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.labelSmall}>Premio Salida ($)</Text>
              <TextInput
                style={styles.inputSmall}
                value={goReward}
                onChangeText={setGoReward}
                keyboardType="numeric"
              />
            </View>
          </View>
        )}

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
            style={[styles.button, loading && {opacity: 0.7}, {backgroundColor: selectedColor}]} 
            onPress={handleStart}
            disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
                {mode === 'CREATE' ? 'CREAR PARTIDA' : 'ENTRAR'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2c3e50', justifyContent: 'center', padding: 20 },
  emoji: { fontSize: 50, textAlign: 'center', marginBottom: 10, marginTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 20 },
  tabs: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#f0f0f0', borderRadius: 10, padding: 4 },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontWeight: '600', color: '#95a5a6' },
  activeTabText: { color: '#2c3e50', fontWeight: 'bold' },
  label: { fontSize: 14, marginBottom: 8, fontWeight: '600', color: '#34495e' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 12, fontSize: 18, marginBottom: 15, backgroundColor: '#f9f9f9' },
  
  colorContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  colorCircle: { width: 35, height: 35, borderRadius: 20, borderWidth: 2, borderColor: 'transparent' },
  colorSelected: { borderColor: '#2c3e50', transform: [{scale: 1.2}] },

  settingsContainer: { flexDirection: 'row', marginBottom: 15 },
  labelSmall: { fontSize: 12, marginBottom: 5, fontWeight: '600', color: '#7f8c8d' },
  inputSmall: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, fontSize: 16, backgroundColor: '#f9f9f9', width: '100%' },

  button: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});