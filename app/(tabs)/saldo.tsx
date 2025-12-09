// Archivo: app/(tabs)/saldo.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Dashboard() {
  const { userName } = useLocalSearchParams();
  const router = useRouter();
  
  // --- ESTADOS ---
  const [saldo, setSaldo] = useState(1500);
  const [deuda, setDeuda] = useState(0); // <--- NUEVO: Estado para la deuda

  // Estado para Modal de Ingreso Extra (Suerte)
  const [modalIngresoVisible, setModalIngresoVisible] = useState(false);
  const [montoIngreso, setMontoIngreso] = useState('');

  // Estado para Modal de Préstamo
  const [modalPrestamoVisible, setModalPrestamoVisible] = useState(false); // <--- NUEVO
  const [montoPrestamo, setMontoPrestamo] = useState(''); // <--- NUEVO

  // --- LÓGICA DE INGRESO EXTRA ---
  const confirmarIngresoExtra = () => {
    const valor = parseInt(montoIngreso);
    if (!valor || valor <= 0) return Alert.alert("Error", "Monto inválido");

    setSaldo(saldo + valor);
    setModalIngresoVisible(false);
    setMontoIngreso('');
    Alert.alert("¡Suerte! 🍀", `Se han agregado $${valor} a tu cuenta.`);
  };

  // --- LÓGICA DE PRÉSTAMO (NUEVA) ---
  const confirmarPrestamo = () => {
    const valor = parseInt(montoPrestamo);
    if (!valor || valor <= 0) return Alert.alert("Error", "Monto inválido");

    // El préstamo te da dinero en efectivo, pero aumenta tu deuda
    setSaldo(saldo + valor);
    setDeuda(deuda + valor);

    setModalPrestamoVisible(false);
    setMontoPrestamo('');
    Alert.alert("Préstamo Aprobado 🏦", `Recibiste $${valor}. Recuerda pagarlo.`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Cabecera */}
        <View style={styles.header}>
          <Text style={styles.welcome}>Hola, {userName || 'Jugador'}</Text>
          <Text style={styles.id}>ID: #{userName ? userName: '001'}</Text>
        </View>

        {/* Tarjeta de Saldo */}
        <View style={styles.saldoCard}>
          <Text style={styles.label}>TU SALDO</Text>
          <Text style={styles.saldo}>$ {saldo}</Text>
          
          {/* NUEVO: Visualizador de Deuda */}
          {deuda > 0 && (
            <View style={styles.deudaContainer}>
              <Text style={styles.deudaLabel}>Deuda al Banco:</Text>
              <Text style={styles.deudaMonto}>- ${deuda}</Text>
            </View>
          )}
        </View>

        {/* --- BOTONERA DE ACCIONES --- */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        
        <View style={styles.actionsGrid}>
          
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#8e44ad' }]}
            onPress={() => router.push('/(tabs)/transferir')}
          >
            <Ionicons name="paper-plane" size={32} color="white" />
            <Text style={styles.btnText}>Transferir a Jugador</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#27ae60' }]}
            onPress={() => {
              setSaldo(saldo + 200);
              Alert.alert("¡Pasaste por la Salida!", "+ $200");
            }}
          >
            <Ionicons name="arrow-forward-circle" size={32} color="white" />
            <Text style={styles.btnText}>Cobrar Salida ($200)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#2980b9' }]} 
            onPress={() => setModalIngresoVisible(true)}
          >
            <Ionicons name="gift" size={32} color="white" />
            <Text style={styles.btnText}>Ingreso Extra / Suerte</Text>
          </TouchableOpacity>

          {/* BOTÓN DE PRÉSTAMO (Ahora sí funciona) */}
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#e67e22' }]}
            onPress={() => setModalPrestamoVisible(true)} // <--- Abre el modal naranja
          >
            <Ionicons name="business" size={32} color="white" />
            <Text style={styles.btnText}>Pedir Préstamo</Text>
          </TouchableOpacity>

        </View>

        {/* --- MODAL 1: INGRESO EXTRA (Verde/Azul) --- */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalIngresoVisible}
          onRequestClose={() => setModalIngresoVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>🍀 Ingreso Extra</Text>
              <Text style={styles.modalSub}>Premios, herencias o suerte.</Text>
              <Text style={styles.labelInput}>¿Cuánto recibiste?</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="$0"
                keyboardType="numeric"
                autoFocus={true} 
                value={montoIngreso}
                onChangeText={setMontoIngreso}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#e74c3c' }]} onPress={() => setModalIngresoVisible(false)}>
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#2980b9' }]} onPress={confirmarIngresoExtra}>
                  <Text style={styles.modalBtnText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* --- MODAL 2: PRÉSTAMO (Naranja) --- */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalPrestamoVisible}
          onRequestClose={() => setModalPrestamoVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalView, { borderTopWidth: 5, borderColor: '#e67e22' }]}>
              <Text style={[styles.modalTitle, { color: '#e67e22' }]}>🏦 Pedir al Banco</Text>
              <Text style={styles.modalSub}>Esto se sumará a tu deuda.</Text>
              
              <Text style={styles.labelInput}>¿Cuánto necesitas?</Text>
              <TextInput
                style={[styles.modalInput, { color: '#e67e22' }]}
                placeholder="$0"
                keyboardType="numeric"
                autoFocus={true} 
                value={montoPrestamo}
                onChangeText={setMontoPrestamo}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#95a5a6' }]} onPress={() => setModalPrestamoVisible(false)}>
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#e67e22' }]} onPress={confirmarPrestamo}>
                  <Text style={styles.modalBtnText}>Solicitar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 }, 
  header: { marginTop: 40, marginBottom: 20 },
  welcome: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50' },
  id: { color: '#7f8c8d', fontSize: 14 },
  
  // Tarjeta de Saldo
  saldoCard: { backgroundColor: 'white', padding: 30, borderRadius: 20, alignItems: 'center', elevation: 4, marginBottom: 30 },
  label: { fontSize: 14, color: '#95a5a6', letterSpacing: 1, fontWeight: '600' },
  saldo: { fontSize: 48, fontWeight: 'bold', color: '#2c3e50', marginTop: 5 },
  
  // Estilos de Deuda
  deudaContainer: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#eee', width: '100%', alignItems: 'center' },
  deudaLabel: { fontSize: 12, color: '#e74c3c', fontWeight: 'bold', textTransform: 'uppercase' },
  deudaMonto: { fontSize: 20, color: '#e74c3c', fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#34495e', marginBottom: 15 },
  actionsGrid: { gap: 15 },
  
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 15, elevation: 2, gap: 15 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },

  // Estilos del Modal (Compartidos)
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 5, color: '#2980b9' },
  modalSub: { fontSize: 14, color: '#7f8c8d', marginBottom: 20 },
  labelInput: { alignSelf: 'flex-start', color: '#666', marginBottom: 5 },
  modalInput: { width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 10 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  modalBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});