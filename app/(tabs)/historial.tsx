// Archivo: app/(tabs)/historial.tsx
import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function HistorialScreen() {
  
  // DATOS DE PRUEBA (Mocks)
  // Cuando conectemos el backend, esto vendrá del servidor.
  const movimientos = [
    { id: '1', titulo: 'Cobro Salida', detalle: 'Banco', monto: 200, tipo: 'ingreso', hora: '10:45' },
    { id: '2', titulo: 'Pago Alquiler', detalle: 'A: Juan (Av. Libertador)', monto: -50, tipo: 'gasto', hora: '10:42' },
    { id: '3', titulo: 'Premio Lotería', detalle: 'Suerte', monto: 1000, tipo: 'ingreso', hora: '10:30' },
    { id: '4', titulo: 'Compra Propiedad', detalle: 'Banco', monto: -350, tipo: 'gasto', hora: '10:15' },
    { id: '5', titulo: 'Transferencia', detalle: 'De: Ana', monto: 500, tipo: 'ingreso', hora: '10:00' },
    { id: '6', titulo: 'Multa', detalle: 'Cárcel', monto: -100, tipo: 'gasto', hora: '09:55' },
  ];

  // Función para dibujar cada fila de la lista
  const renderItem = ({ item }) => {
    const esIngreso = item.monto > 0;
    
    return (
      <View style={styles.itemCard}>
        {/* Icono a la izquierda */}
        <View style={[styles.iconBox, { backgroundColor: esIngreso ? '#e8f8f5' : '#fdedec' }]}>
          <Ionicons 
            name={esIngreso ? "arrow-down" : "arrow-up"} 
            size={24} 
            color={esIngreso ? "#2ecc71" : "#e74c3c"} 
          />
        </View>

        {/* Textos del centro */}
        <View style={styles.infoBox}>
          <Text style={styles.titulo}>{item.titulo}</Text>
          <Text style={styles.detalle}>{item.detalle} • {item.hora}</Text>
        </View>

        {/* Monto a la derecha */}
        <Text style={[styles.monto, { color: esIngreso ? "#27ae60" : "#c0392b" }]}>
          {esIngreso ? '+' : ''} ${item.monto}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Registro de Actividad 📋</Text>
      
      <FlatList
        data={movimientos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginLeft: 20, marginBottom: 20, color: '#2c3e50' },
  
  // Padding bottom 100 es CLAVE para que la barra flotante no tape el último item
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },

  itemCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 15,
    alignItems: 'center',
    // Sombras suaves
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  
  iconBox: { width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  
  infoBox: { flex: 1 },
  titulo: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  detalle: { fontSize: 12, color: '#95a5a6', marginTop: 2 },
  
  monto: { fontSize: 18, fontWeight: 'bold' }
});