import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// --- DATOS MOCK (Simulados) ---
const OTHER_PLAYERS = [
  { id: 'p2', name: 'Pedro' },
  { id: 'p3', name: 'Ana' },
  { id: 'p4', name: 'Luis' },
];

export default function TransferTabScreen() {
  // Simulación del usuario conectado (Esto vendría de tu Base de Datos real)
  const [currentUser] = useState({ balance: 1500, debt: 500 }); // Puse $500 de deuda para que veas el ejemplo

  // --- ESTADOS ---
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [bankOperationType, setBankOperationType] = useState<'PAY' | 'LOAN'>('PAY');

  const reset = () => {
    setStep(1);
    setSelectedTarget(null);
    setAmount('');
    setBankOperationType('PAY');
  };

  const handleConfirm = () => {
    Alert.alert("¡Éxito!", "Operación enviada al servidor", [
        { text: "OK", onPress: reset }
    ]);
  };

  // --- RENDERIZADO DE PASOS ---

  const renderStep1 = () => (
    <View style={styles.content}>
      <Text style={styles.title}>¿A quién transferir?</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => { setSelectedTarget('BANK'); setStep(2); }}>
            <Text style={styles.icon}>🏦</Text>
            <Text style={styles.name}>BANCO</Text>
        </TouchableOpacity>
        {OTHER_PLAYERS.map(p => (
            <TouchableOpacity key={p.id} style={styles.card} onPress={() => { setSelectedTarget(p); setStep(2); }}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{p.name[0]}</Text></View>
                <Text style={styles.name}>{p.name}</Text>
            </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.content}>
      <Text style={styles.title}>¿Cuánto dinero?</Text>
      
      {selectedTarget === 'BANK' && (
          <View style={styles.toggleRow}>
              <TouchableOpacity onPress={() => setBankOperationType('PAY')} style={[styles.pill, bankOperationType === 'PAY' && styles.pillActive]}>
                  <Text style={[styles.pillText, bankOperationType === 'PAY' && styles.textActive]}>PAGAR</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setBankOperationType('LOAN')} style={[styles.pill, bankOperationType === 'LOAN' && styles.pillActive]}>
                  <Text style={[styles.pillText, bankOperationType === 'LOAN' && styles.textActive]}>PRÉSTAMO</Text>
              </TouchableOpacity>
          </View>
      )}

      <TextInput 
        style={styles.input} 
        value={amount} 
        onChangeText={setAmount} 
        placeholder="$0" 
        keyboardType="numeric" 
        autoFocus 
      />
      
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => setStep(1)} style={styles.btnSec}><Text>Atrás</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => {if(amount) setStep(3)}} style={styles.btnPri}><Text style={styles.btnText}>Siguiente</Text></TouchableOpacity>
      </View>
    </View>
  );

  // --- AQUÍ ESTÁ LA LÓGICA DE SALDO FUTURO ---
  const renderStep3 = () => {
    const val = parseInt(amount) || 0;
    const isBank = selectedTarget === 'BANK';
    const isLoan = isBank && bankOperationType === 'LOAN';
    
    // Cálculos de saldo futuro
    let futureBalance = currentUser.balance;
    let futureDebt = currentUser.debt;
    
    if (isLoan) {
        // Pedir préstamo: Sube saldo, sube deuda
        futureBalance += val;
        futureDebt += val;
    } else {
        // Pagar (a jugador o banco): Baja saldo
        futureBalance -= val;
        
        // Si pagas al banco, baja la deuda
        if (isBank && bankOperationType === 'PAY') {
            const debtPayment = Math.min(currentUser.debt, val); // No puedes pagar más deuda de la que tienes
            futureDebt -= debtPayment;
        }
    }

    const isNegative = futureBalance < 0;

    return (
      <View style={styles.content}>
        <Text style={styles.title}>Confirmar Operación</Text>
        
        {/* Tarjeta Resumen */}
        <View style={styles.summaryCard}>
            
            {/* Fila 1: Monto de la operación */}
            <View style={styles.summaryRow}>
                <Text style={styles.label}>Monto a operar:</Text>
                <Text style={styles.valueBig}>${val}</Text>
            </View>

            <View style={styles.divider} />

            {/* Fila 2: Proyección de Saldo */}
            <View style={styles.projectionRow}>
                <View>
                    <Text style={styles.labelSmall}>Saldo Actual</Text>
                    <Text style={styles.valueSmall}>${currentUser.balance}</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
                <View>
                    <Text style={styles.labelSmall}>Nuevo Saldo</Text>
                    <Text style={[styles.valueSmall, isNegative && {color: 'red'}]}>
                        ${futureBalance}
                    </Text>
                </View>
            </View>

            {/* Fila 3: Proyección de Deuda (Solo si cambia) */}
            {(isLoan || (isBank && currentUser.debt > 0)) && (
                <View style={[styles.projectionRow, {marginTop: 15}]}>
                    <View>
                        <Text style={styles.labelSmall}>Deuda Actual</Text>
                        <Text style={[styles.valueSmall, {color: '#d9534f'}]}>${currentUser.debt}</Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                    <View>
                        <Text style={styles.labelSmall}>Nueva Deuda</Text>
                        <Text style={[styles.valueSmall, {color: '#d9534f'}]}>
                            ${futureDebt}
                        </Text>
                    </View>
                </View>
            )}

        </View>

        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => setStep(2)} style={styles.btnSec}><Text>Editar</Text></TouchableOpacity>
          <TouchableOpacity 
            onPress={handleConfirm} 
            style={[styles.btnPri, isNegative && {backgroundColor: '#999'}]} // Deshabilita visualmente si no alcanza
            disabled={isNegative && !isLoan} // No deja pagar si te quedas en negativo (salvo préstamo)
          >
              <Text style={styles.btnText}>CONFIRMAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nueva Operación</Text>
      </View>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  header: { padding: 20, backgroundColor: '#fff', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 20, alignItems: 'center' },
  title: { fontSize: 22, marginBottom: 20, fontWeight: 'bold', color: '#333' },
  
  // Grid Paso 1
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'center' },
  card: { width: 100, height: 100, backgroundColor: '#fff', borderRadius: 15, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  icon: { fontSize: 30, marginBottom: 5 },
  name: { fontWeight: '600', fontSize: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  
  // Paso 2
  input: { fontSize: 50, fontWeight: 'bold', marginVertical: 30, textAlign: 'center', width: '100%', color: '#333' },
  toggleRow: { flexDirection: 'row', backgroundColor: '#e0e0e0', borderRadius: 20, padding: 4, marginBottom: 10 },
  pill: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 16 },
  pillActive: { backgroundColor: '#fff', elevation: 2 },
  pillText: { color: '#666', fontWeight: 'bold', fontSize: 12 },
  textActive: { color: '#000' },

  // Paso 3 (Confirmación)
  summaryCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, width: '100%', elevation: 2, marginBottom: 30 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  label: { fontSize: 16, color: '#666' },
  valueBig: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  
  projectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10 },
  labelSmall: { fontSize: 10, color: '#999', textTransform: 'uppercase' },
  valueSmall: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  arrow: { fontSize: 20, color: '#ccc', marginHorizontal: 10 },

  // Botones Navegación
  navRow: { 
    flexDirection: 'row', 
    gap: 10, 
    marginTop: 'auto', 
    width: '100%', 
    marginBottom: 90 // <--- AQUÍ ESTÁ EL ESPACIO PARA QUE NO SE TAPE CON LA TAB BAR
  },
  btnSec: { flex: 1, padding: 15, backgroundColor: '#e0e0e0', borderRadius: 12, alignItems: 'center' },
  btnPri: { flex: 2, padding: 15, backgroundColor: '#222', borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});