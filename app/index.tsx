// Archivo: app/index.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [nombre, setNombre] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (nombre.length === 0) {
      Alert.alert("Error", "Por favor escribe tu nombre");
      return;
    }

    // Navegar a la carpeta (tabs) pasando el nombre
    router.replace({
      pathname: '/(tabs)/saldo',
      params: { userName: nombre }
    });
  };




  const handleTransaction = (targetId, amount, actionType) => {
  // AQUI IRÁ TU CÓDIGO DE SERVIDOR LUEGO:
  // socket.emit('new_transaction', { targetId, amount, actionType });
  
  console.log("Enviando al servidor:", { targetId, amount, actionType });
  
  // Por ahora, solo cerramos el modal visualmente
  //setIsWizardOpen(false); 
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
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>ENTRAR AL JUEGO</Text>
        </TouchableOpacity>
      </View>

      <TransferWizard
  isVisible={isWizardOpen}
  onClose={() => setIsWizardOpen(false)}
  otherPlayers={INITIAL_PLAYERS}
  
  // ¡ESTA LÍNEA ES LA QUE FALTA O ESTÁ MAL!
  // Conectamos el evento del hijo con la función del padre
  onConfirmTransaction={handleTransaction} 
/>

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