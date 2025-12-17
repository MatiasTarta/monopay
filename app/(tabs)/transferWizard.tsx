import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { socket } from '../../services/socket';

export default function TransferTabScreen() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roomCode, setRoomCode] = useState<string>('');
  const [otherPlayers, setOtherPlayers] = useState<any[]>([]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [bankOperationType, setBankOperationType] = useState<'PAY' | 'LOAN'>('PAY');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("💰 TransferWizard montado. Pidiendo datos...");
    socket.on('game_updated', (room) => {
      console.log("📦 Datos recibidos en TransferWizard");
      setRoomCode(room.code);

      const me = room.players.find((p: any) => p.id === socket.id);
      setCurrentUser(me);

      const others = room.players.filter((p: any) => p.id !== socket.id);
      setOtherPlayers(others);
    });

    socket.on('transaction_success', () => {
      setLoading(false);
      Alert.alert("¡Éxito!", "Transacción realizada", [{ text: "OK", onPress: reset }]);
    });

    socket.on('error_message', (msg) => {
      setLoading(false);
      Alert.alert("Error", msg);
    });

    if (socket.connected) {
      socket.emit('request_update_by_socket');
    } else {
      console.log("⚠️ Socket desconectado, intentando reconectar...");
      socket.connect();
      setTimeout(() => socket.emit('request_update_by_socket'), 500);
    }

    const handleSuccess = () => {
      console.log("✅ Transacción confirmada por el servidor");
      setLoading(false); 
      Alert.alert("¡Éxito!", "Operación realizada", [
        { text: "OK", onPress: reset } 
      ]);
    };

    const handleError = (msg: string) => {
      console.log("❌ Error recibido:", msg);
      setLoading(false);
      Alert.alert("Error", msg);
    };

    socket.on('transaction_success', handleSuccess);
    socket.on('error_message', handleError);


    if (socket.connected) {
      socket.emit('request_update_by_socket');
    }

    return () => {
      socket.off('game_updated');
      socket.off('transaction_success', handleSuccess);
      socket.off('error_message', handleError);
    };
  }, []);

  const reset = () => {
    setStep(1);
    setSelectedTarget(null);
    setAmount('');
    setBankOperationType('PAY');
    setLoading(false);
  };

  const handleConfirm = () => {
    if (!amount || parseInt(amount) <= 0) return;
    if (loading) return;
    setLoading(true);
    let type = 'P2P';
    let targetId = selectedTarget?.id;
    if (selectedTarget === 'BANK') {
      type = bankOperationType === 'LOAN' ? 'BANK_LOAN' : 'BANK_PAY';
      targetId = 'BANK';
    }
    socket.emit('make_transaction', {
      roomCode,
      targetId,
      amount,
      type
    });

    setTimeout(() => {
      setLoading((currentState) => {
        if (currentState === true) {
          Alert.alert("Tiempo agotado", "El servidor no respondió. Verifica tu conexión.");
          return false;
        }
        return currentState;
      });
    }, 5000);
  };
  if (!currentUser) return <View style={styles.center}><Text>Cargando datos...</Text></View>;



  const renderStep1 = () => (
    <View style={styles.content}>
      <Text style={styles.title}>¿A quién transferir?</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => { setSelectedTarget('BANK'); setStep(2); }}>
          <Text style={styles.icon}>🏦</Text>
          <Text style={styles.name}>BANCO</Text>
        </TouchableOpacity>

        {otherPlayers.length === 0 && <Text style={{ marginTop: 20, color: '#999' }}>Esperando jugadores...</Text>}

        {otherPlayers.map(p => (
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
        <TouchableOpacity onPress={() => { if (amount) setStep(3) }} style={styles.btnPri}><Text style={styles.btnText}>Siguiente</Text></TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => {
    const val = parseInt(amount) || 0;
    const isBank = selectedTarget === 'BANK';
    const isLoan = isBank && bankOperationType === 'LOAN';

    let futureBalance = currentUser.balance;
    if (isLoan) futureBalance += val;
    else futureBalance -= val;

    const isNegative = futureBalance < 0;

    return (
      <View style={styles.content}>
        <Text style={styles.title}>Confirmar</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Destino:</Text>
            <Text style={styles.valueText}>{isBank ? 'Banco' : selectedTarget.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Monto:</Text>
            <Text style={styles.valueBig}>${val}</Text>
          </View>
          <Text style={{ textAlign: 'center', color: isNegative ? 'red' : '#999', marginTop: 10 }}>
            {isNegative ? '⚠️ Quedarás en negativo' : `Saldo actual: $${currentUser.balance}`}
          </Text>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => setStep(2)} style={styles.btnSec}><Text>Editar</Text></TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={loading || (isNegative && !isLoan)}
            style={[styles.btnPri, (isNegative && !isLoan) && { backgroundColor: '#ccc' }]}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>CONFIRMAR</Text>}
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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#fff', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 20, alignItems: 'center' },
  title: { fontSize: 22, marginBottom: 20, fontWeight: 'bold', color: '#333' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'center' },
  card: { width: 100, height: 100, backgroundColor: '#fff', borderRadius: 15, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  icon: { fontSize: 30, marginBottom: 5 },
  name: { fontWeight: '600', fontSize: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  avatarText: { color: '#fff', fontWeight: 'bold' },

  input: { fontSize: 50, fontWeight: 'bold', marginVertical: 30, textAlign: 'center', width: '100%', color: '#333' },
  toggleRow: { flexDirection: 'row', backgroundColor: '#e0e0e0', borderRadius: 20, padding: 4, marginBottom: 20 },
  pill: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 16 },
  pillActive: { backgroundColor: '#fff', elevation: 2 },
  pillText: { color: '#666', fontWeight: 'bold', fontSize: 12 },
  textActive: { color: '#000' },

  summaryCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, width: '100%', elevation: 2, marginBottom: 30 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  label: { fontSize: 16, color: '#666' },
  valueText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  valueBig: { fontSize: 32, fontWeight: 'bold', color: '#333' },

  navRow: { flexDirection: 'row', gap: 10, marginTop: 'auto', width: '100%', marginBottom: 90 },
  btnSec: { flex: 1, padding: 15, backgroundColor: '#e0e0e0', borderRadius: 12, alignItems: 'center' },
  btnPri: { flex: 2, padding: 15, backgroundColor: '#222', borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});