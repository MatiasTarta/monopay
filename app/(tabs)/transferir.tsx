// Archivo: app/(tabs)/transferir.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TransferirScreen() {
  // Estado para controlar en qué paso estamos: 'formulario' o 'confirmacion'
  const [paso, setPaso] = useState('formulario'); 
  
  const [monto, setMonto] = useState('');
  const [destinatario, setDestinatario] = useState('');
  const router = useRouter();

  // DATOS FALSOS (MOCKS)
  const miSaldoActual = 1500; 
  const jugadores = [
    { id: 'juan', nombre: 'Juan' },
    { id: 'ana', nombre: 'Ana' },
    { id: 'pedro', nombre: 'Pedro' }
  ];

  // PASO 1: Validar y pasar a la pantalla de confirmación
  const irAConfirmar = () => {
    if (!monto || !destinatario) {
      Alert.alert("Faltan datos", "Por favor escribe un monto y elige un jugador.");
      return;
    }
    // Pequeña validación de números
    if (isNaN(parseInt(monto)) || parseInt(monto) <= 0) {
      Alert.alert("Error", "Ingresa un monto válido mayor a 0.");
      return;
    }
    
    setPaso('confirmacion'); // <--- AQUÍ CAMBIAMOS DE PANTALLA
  };

  // PASO 2: Confirmar y realizar la "transacción"
  const confirmarTransferencia = () => {
    // Aquí iría la llamada al servidor (API)
    
    Alert.alert("¡Éxito! ✅", `Transferencia de $${monto} enviada a ${destinatario}.`, [
      { text: "Genial", onPress: () => {
          // Reiniciamos todo
          setMonto('');
          setDestinatario('');
          setPaso('formulario');
          router.push('/(tabs)/saldo'); 
      }}
    ]);
  };

  // Función auxiliar para cancelar y volver a editar
  const cancelar = () => {
    setPaso('formulario');
  };

  // --- VISTA: MODO CONFIRMACIÓN ---
  if (paso === 'confirmacion') {
    const montoNum = parseInt(monto);
    const saldoFinal = miSaldoActual - montoNum;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Revisa tu Operación 🧐</Text>
        
        <View style={styles.confirmCard}>
          <Text style={styles.label}>VAS A ENVIAR:</Text>
          <Text style={styles.bigAmount}>- ${monto}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.label}>DESTINATARIO:</Text>
          <Text style={styles.infoText}>{destinatario}</Text>

          <View style={styles.divider} />

          {/* Aquí mostramos el impacto en el saldo */}
          <View style={styles.row}>
            <Text style={styles.smallLabel}>Saldo Actual:</Text>
            <Text style={styles.smallValue}>${miSaldoActual}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.smallLabel}>Nuevo Saldo:</Text>
            {/* Si el saldo queda negativo, se pone rojo */}
            <Text style={[styles.smallValue, { color: saldoFinal < 0 ? 'red' : 'green' }]}>
              ${saldoFinal}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={confirmarTransferencia}>
          <Text style={styles.confirmButtonText}>CONFIRMAR PAGO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={cancelar}>
          <Text style={styles.cancelButtonText}>Cancelar / Editar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- VISTA: MODO FORMULARIO (La original) ---
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Realizar Pago 💸</Text>

      <View style={styles.card}>
        <Text style={styles.label}>¿Cuánto vas a pagar?</Text>
        <TextInput
          style={styles.inputGiant}
          placeholder="$0"
          keyboardType="numeric"
          value={monto}
          onChangeText={setMonto}
        />

        <Text style={styles.label}>¿A quién?</Text>
        <View style={styles.playerList}>
          {jugadores.map((j) => (
            <TouchableOpacity 
              key={j.id} 
              style={[
                styles.playerButton, 
                destinatario === j.nombre && styles.playerSelected 
              ]}
              onPress={() => setDestinatario(j.nombre)}
            >
              <Text style={[
                styles.playerText,
                destinatario === j.nombre && styles.playerTextSelected
              ]}>{j.nombre}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={irAConfirmar}>
          <Text style={styles.continueButtonText}>CONTINUAR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, marginTop: 40, textAlign: 'center' },
  
  // Estilos del Formulario
  card: { backgroundColor: 'white', padding: 20, borderRadius: 15, elevation: 3 },
  label: { fontSize: 14, color: '#666', marginBottom: 10, marginTop: 10, textTransform: 'uppercase' },
  inputGiant: { fontSize: 40, fontWeight: 'bold', borderBottomWidth: 1, borderColor: '#ddd', marginBottom: 30, color: '#333', textAlign: 'center' },
  playerList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  playerButton: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 20 },
  playerSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  playerText: { fontSize: 16, color: '#333' },
  playerTextSelected: { color: 'white', fontWeight: 'bold' },
  continueButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  continueButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // Estilos de la Confirmación
  confirmCard: { backgroundColor: 'white', padding: 25, borderRadius: 15, elevation: 3, marginBottom: 20 },
  bigAmount: { fontSize: 36, fontWeight: 'bold', color: '#e74c3c', textAlign: 'center', marginBottom: 10 },
  infoText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#2c3e50' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  smallLabel: { fontSize: 16, color: '#666' },
  smallValue: { fontSize: 16, fontWeight: 'bold' },
  
  confirmButton: { backgroundColor: '#27ae60', padding: 18, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  confirmButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  cancelButton: { padding: 15, alignItems: 'center' },
  cancelButtonText: { color: '#e74c3c', fontSize: 16 }
});