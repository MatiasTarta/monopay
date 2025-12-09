// Archivo: app/(tabs)/index.tsx
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Dashboard() {
  // Recibimos el nombre desde el Login
  const { userName } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      {/* Cabecera */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Hola, {userName || 'Jugador'}</Text>
        <Text style={styles.id}>ID: #{userName ? userName: '001'}</Text>
      </View>

      {/* Tarjeta de Saldo */}
      <View style={styles.saldoCard}>
        <Text style={styles.label}>TU SALDO</Text>
        <Text style={styles.saldo}>$ 1,500</Text>
      </View>

      {/* Botones de Acción */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnGreen}>
          <Text style={styles.btnText}>Cobrar Salida (+$200)</Text>
        </TouchableOpacity>
        
        <View style={{ height: 15 }} />

        <TouchableOpacity style={styles.btnOrange}>
          <Text style={styles.btnText}>Pedir Préstamo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { marginTop: 40, marginBottom: 20 },
  welcome: { fontSize: 28, fontWeight: 'bold' },
  id: { color: '#7f8c8d', fontSize: 14 },
  
  saldoCard: { backgroundColor: 'white', padding: 40, borderRadius: 20, alignItems: 'center', elevation: 3, marginBottom: 30 },
  label: { fontSize: 16, color: '#7f8c8d', letterSpacing: 1 },
  saldo: { fontSize: 50, fontWeight: 'bold', color: '#27ae60' },

  actions: { flex: 1 },
  btnGreen: { backgroundColor: '#27ae60', padding: 20, borderRadius: 12, alignItems: 'center' },
  btnOrange: { backgroundColor: '#e67e22', padding: 20, borderRadius: 12, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});