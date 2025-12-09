import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// --- DEFINICIÓN DE TIPOS (Frontend) ---
interface Player {
  id: string;
  name: string;
  avatar?: any; // URL o require local
}

interface TransferModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentUser: { 
    balance: number; 
    debt: number; 
  };
  otherPlayers: Player[]; // Lista de oponentes
  
  // Acciones solo visuales por ahora (Logs)
  onTransferToPlayer: (targetId: string, amount: number) => void;
  onBankAction: (type: 'BUY_ASSET' | 'PAY_DEBT' | 'TAKE_LOAN', amount: number) => void;
}

const TransferModal = ({
  isVisible,
  onClose,
  currentUser,
  otherPlayers,
  onTransferToPlayer,
  onBankAction
}: TransferModalProps) => {
  
  // Estado local de la UI
  const [activeTab, setActiveTab] = useState<'PLAYERS' | 'BANK'>('PLAYERS');
  const [amount, setAmount] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Limpieza al cerrar
  const handleClose = () => {
    setAmount('');
    setSelectedPlayerId(null);
    setActiveTab('PLAYERS'); // Resetear a la tab por defecto
    onClose();
  };

  // --- LOGICA UI: BANCO ---
  const handleBankSubmit = (action: 'BUY_ASSET' | 'PAY_DEBT' | 'TAKE_LOAN') => {
    const value = parseInt(amount);
    if (!value || value <= 0) {
      Alert.alert("Error", "Ingresa un monto válido");
      return;
    }
    
    // Validaciones visuales rápidas
    if (action === 'PAY_DEBT' && value > currentUser.balance) {
      Alert.alert("Saldo insuficiente", "No tienes dinero para pagar esa deuda.");
      return;
    }

    onBankAction(action, value);
    setAmount('');
  };

  // --- LOGICA UI: JUGADORES ---
  const handlePlayerSubmit = () => {
    const value = parseInt(amount);
    if (!value || value <= 0) return Alert.alert("Error", "Monto inválido");
    if (!selectedPlayerId) return Alert.alert("Error", "Selecciona un jugador");

    onTransferToPlayer(selectedPlayerId, value);
    handleClose();
  };

  // --- RENDERIZADO: PESTAÑA BANCO (Tu diseño solicitado) ---
  const renderBankTab = () => (
    <View style={styles.tabContent}>
      
      {/* Tarjeta de Estado */}
      <View style={styles.bankStatusCard}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Tu Saldo</Text>
          <Text style={styles.balanceText}>${currentUser.balance}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Tu Deuda</Text>
          <Text style={[styles.debtText, currentUser.debt > 0 && styles.debtActive]}>
            ${currentUser.debt}
          </Text>
        </View>
      </View>

      {/* Input Gigante */}
      <View style={styles.amountInputContainer}>
        <Text style={styles.currencyPrefix}>$</Text>
        <TextInput
          style={styles.largeInput}
          placeholder="0"
          placeholderTextColor="#ccc"
          keyboardType="number-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>
      <Text style={styles.helperText}>Monto de la operación</Text>

      {/* Botones de Acción Banco */}
      <View style={styles.bankActions}>
        
        {/* 1. PEDIR PRESTAMO (Nuevo agregado) */}
         <TouchableOpacity 
          style={[styles.bankBtn, styles.loanBtn]}
          onPress={() => handleBankSubmit('TAKE_LOAN')}
        >
          <Text style={styles.btnTitle}>PEDIR PRÉSTAMO</Text>
          <Text style={styles.btnSub}>Recibir dinero (Genera deuda)</Text>
        </TouchableOpacity>

        {/* 2. PAGAR / COMPRAR */}
        <TouchableOpacity 
          style={[styles.bankBtn, styles.payBtn]}
          onPress={() => handleBankSubmit('BUY_ASSET')}
        >
          <Text style={[styles.btnTitle, {color: '#fff'}]}>PAGAR / COMPRAR</Text>
          <Text style={[styles.btnSub, {color: '#ddd'}]}>Propiedades, casas, multas</Text>
        </TouchableOpacity>

        {/* 3. PAGAR DEUDA (Solo si tiene deuda) */}
        {currentUser.debt > 0 && (
          <TouchableOpacity 
            style={[styles.bankBtn, styles.debtBtn]}
            onPress={() => handleBankSubmit('PAY_DEBT')}
          >
            <Text style={[styles.btnTitle, {color: '#d9534f'}]}>ABONAR A DEUDA</Text>
            <Text style={styles.btnSub}>Reducir deuda bancaria</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // --- RENDERIZADO: PESTAÑA JUGADORES ---
  const renderPlayersTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.label}>1. Ingresa el monto:</Text>
      <View style={styles.amountInputContainer}>
        <Text style={styles.currencyPrefix}>$</Text>
        <TextInput
          style={styles.largeInput}
          placeholder="0"
          placeholderTextColor="#ccc"
          keyboardType="number-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <Text style={styles.label}>2. Elige a quién transferir:</Text>
      <FlatList
        data={otherPlayers}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.playersList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.playerCard,
              selectedPlayerId === item.id && styles.playerCardSelected
            ]}
            onPress={() => setSelectedPlayerId(item.id)}
          >
            {/* Placeholder de Avatar */}
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <Text style={styles.playerName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity 
        style={[styles.mainActionBtn, !selectedPlayerId && styles.disabledBtn]}
        onPress={handlePlayerSubmit}
        disabled={!selectedPlayerId}
      >
        <Text style={styles.mainActionText}>ENVIAR DINERO</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.container}>
          
          {/* HEADER: TABS */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'PLAYERS' && styles.activeTab]}
              onPress={() => setActiveTab('PLAYERS')}
            >
              <Text style={[styles.tabText, activeTab === 'PLAYERS' && styles.activeTabText]}>
                A JUGADORES
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, activeTab === 'BANK' && styles.activeTab]}
              onPress={() => setActiveTab('BANK')}
            >
              <Text style={[styles.tabText, activeTab === 'BANK' && styles.activeTabText]}>
                BANCO
              </Text>
            </TouchableOpacity>
          
            {/* Botón cerrar pequeño */}
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* CONTENIDO CAMBIANTE */}
          {activeTab === 'BANK' ? renderBankTab() : renderPlayersTab()}

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%', // Ocupa casi toda la pantalla
    paddingTop: 10,
  },
  // Tabs Header
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 15,
    marginRight: 25,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#333', // Tab activa (negro)
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#333',
  },
  closeBtn: {
    marginLeft: 'auto',
    padding: 5,
  },
  closeX: {
    fontSize: 20,
    color: '#999',
  },
  // Contenido General
  tabContent: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    marginTop: 10,
  },
  // Inputs
  amountInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 5,
  },
  currencyPrefix: {
    fontSize: 40,
    fontWeight: '300',
    color: '#333',
  },
  largeInput: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 100,
    textAlign: 'center',
  },
  helperText: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 20,
  },
  // --- Estilos Banco ---
  bankStatusCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  statusItem: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: '#ddd', marginHorizontal: 10 },
  statusLabel: { fontSize: 11, textTransform: 'uppercase', color: '#888' },
  balanceText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  debtText: { fontSize: 18, fontWeight: 'bold', color: '#999' },
  debtActive: { color: '#d9534f' },
  
  bankActions: { gap: 12 },
  bankBtn: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  loanBtn: {
    backgroundColor: '#fff',
    borderColor: '#f0ad4e', // Naranja prestamo
  },
  payBtn: {
    backgroundColor: '#333', // Negro pagar
    borderColor: '#333',
  },
  debtBtn: {
    backgroundColor: '#fff',
    borderColor: '#d9534f', // Rojo deuda
  },
  btnTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  btnSub: { fontSize: 11, color: '#888' },

  // --- Estilos Lista Jugadores ---
  playersList: {
    paddingVertical: 10,
    gap: 15,
  },
  playerCard: {
    width: 80,
    alignItems: 'center',
    opacity: 0.5,
  },
  playerCardSelected: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#555' },
  playerName: { fontSize: 12, fontWeight: '600', color: '#333', textAlign: 'center' },
  
  mainActionBtn: {
    backgroundColor: '#007bff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto', // Empuja al fondo
  },
  disabledBtn: { backgroundColor: '#ccc' },
  mainActionText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default TransferModal;