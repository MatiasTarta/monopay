import { useState } from 'react';
import {
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// --- DEFINICIÓN DE TIPOS ---
interface Player {
  id: string;
  name: string;
  avatar?: any; 
}

interface TransferWizardProps {
  isVisible: boolean;
  onClose: () => void;
  // Solo necesitamos datos básicos para mostrar, nada de cálculos
  otherPlayers: Player[]; 
  
  // La función final solo entrega los datos crudos al servidor
  onConfirmTransaction: (
    targetId: string, 
    amount: number, 
    actionType: 'TRANSFER_P2P' | 'BANK_PAYMENT' | 'BANK_LOAN'
  ) => void;
}

const TransferWizard = ({
  isVisible,
  onClose,
  otherPlayers,
  onConfirmTransaction
}: TransferWizardProps) => {

  // --- ESTADOS LOCALES DE UI ---
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  const [selectedTarget, setSelectedTarget] = useState<Player | 'BANK' | null>(null);
  const [amount, setAmount] = useState('');
  // Sub-tipo de operación solo para UI (para saber qué texto mostrar)
  const [bankOperationType, setBankOperationType] = useState<'PAY' | 'LOAN'>('PAY');

  const reset = () => {
    setStep(1);
    setSelectedTarget(null);
    setAmount('');
    setBankOperationType('PAY');
    onClose();
  };

  // --- PASO 1: SELECCIONAR ENTIDAD ---
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>1. Selecciona Destinatario</Text>
      
      <View style={styles.grid}>
        {/* Opción BANCO */}
        <TouchableOpacity 
          style={styles.entityCard} 
          onPress={() => { setSelectedTarget('BANK'); setStep(2); }}
        >
          <View style={[styles.avatarCircle, { backgroundColor: '#333' }]}>
            <Text style={styles.bankIcon}>🏦</Text>
          </View>
          <Text style={styles.entityName}>BANCO</Text>
        </TouchableOpacity>

     
     
      {otherPlayers && otherPlayers.map((player) => (
    <TouchableOpacity 
      key={player.id}
      style={styles.entityCard} 
      onPress={() => { setSelectedTarget(player); setStep(2); }}
    >
      <View style={[styles.avatarCircle, { backgroundColor: '#007AFF' }]}>
        <Text style={styles.avatarText}>{player.name.charAt(0)}</Text>
      </View>
      <Text style={styles.entityName}>{player.name}</Text>
    </TouchableOpacity>
  ))}
       
        
      </View>
    </View>
  );

  // --- PASO 2: MONTO Y TIPO DE OPERACIÓN ---
  const renderStep2 = () => {
    const isBank = selectedTarget === 'BANK';

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>2. Define el Monto</Text>

        {/* Selector de Tipo de Operación (Solo si es Banco) */}
        {isBank && (
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleBtn, bankOperationType === 'PAY' && styles.toggleActive]}
              onPress={() => setBankOperationType('PAY')}
            >
              <Text style={[styles.toggleText, bankOperationType === 'PAY' && styles.textActive]}>
                PAGAR / COMPRAR
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.toggleBtn, bankOperationType === 'LOAN' && styles.toggleActive]}
              onPress={() => setBankOperationType('LOAN')}
            >
              <Text style={[styles.toggleText, bankOperationType === 'LOAN' && styles.textActive]}>
                PEDIR PRÉSTAMO
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Numérico */}
        <View style={styles.inputWrapper}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="number-pad"
            placeholder="0"
            value={amount}
            onChangeText={setAmount}
            autoFocus={true}
          />
        </View>

        {/* Botones Navegación */}
        <View style={styles.navButtons}>
          <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
            <Text style={styles.backText}>Atrás</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { if(amount) setStep(3); }} 
            style={[styles.nextBtn, !amount && styles.disabledBtn]}
            disabled={!amount}
          >
            <Text style={styles.nextText}>Siguiente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // --- PASO 3: VERIFICACIÓN (Solo Resumen) ---
  const renderStep3 = () => {
    const value = parseInt(amount) || 0;
    const isBank = selectedTarget === 'BANK';
    
    // Preparar los datos que se enviarán (Solo visualización)
    let targetName = "";
    let actionLabel = "";
    
    if (isBank) {
      targetName = "Banco Central";
      actionLabel = bankOperationType === 'PAY' ? "Pago / Compra" : "Solicitud de Préstamo";
    } else {
      targetName = (selectedTarget as Player).name;
      actionLabel = "Transferencia Directa";
    }

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>3. Verificar Transacción</Text>

        {/* Tarjeta de Resumen de Datos */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Destinatario:</Text>
            <Text style={styles.summaryValue}>{targetName}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tipo:</Text>
            <Text style={styles.summaryValue}>{actionLabel}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.amountDisplay}>
             <Text style={styles.amountLabel}>Monto Total</Text>
             <Text style={styles.amountValue}>${value}</Text>
          </View>
        </View>

        <View style={styles.navButtons}>
          <TouchableOpacity onPress={() => setStep(2)} style={styles.backBtn}>
            <Text style={styles.backText}>Modificar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.confirmBtn}
            onPress={() => {
              // 1. Determinar el ActionType final para el servidor
              let finalActionType: 'TRANSFER_P2P' | 'BANK_PAYMENT' | 'BANK_LOAN';
              
              if (!isBank) {
                finalActionType = 'TRANSFER_P2P';
              } else {
                finalActionType = bankOperationType === 'PAY' ? 'BANK_PAYMENT' : 'BANK_LOAN';
              }

              // 2. Determinar el Target ID final
              const finalTargetId = isBank ? 'BANK_ID' : (selectedTarget as Player).id;

              // 3. ENVIAR PAQUETE PURO (Sin cálculos)
              onConfirmTransaction(finalTargetId, value, finalActionType);
              
              reset();
            }}
          >
            <Text style={styles.confirmText}>CONFIRMAR OPERACIÓN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Nueva Operación</Text>
            <TouchableOpacity onPress={reset}>
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Contenido Dinámico */}
          <View style={styles.content}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </View>
          
          {/* Indicador de Pasos */}
          <View style={styles.dots}>
            <View style={[styles.dot, step >= 1 && styles.activeDot]} />
            <View style={[styles.dot, step >= 2 && styles.activeDot]} />
            <View style={[styles.dot, step >= 3 && styles.activeDot]} />
          </View>

        </View>
      </SafeAreaView>
    </Modal>
  );
};

// --- ESTILOS VISUALES ---
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    height: '75%', 
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#999', textTransform: 'uppercase' },
  closeX: { fontSize: 24, color: '#333', padding: 5 },
  
  content: { flex: 1 },
  stepContainer: { flex: 1, alignItems: 'center', width: '100%' },
  stepTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 25, marginTop: 10 },

  // -- PASO 1 --
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
  entityCard: { alignItems: 'center', width: 90, marginBottom: 15 },
  avatarCircle: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    backgroundColor: '#eee'
  },
  bankIcon: { fontSize: 28 },
  avatarText: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  entityName: { fontSize: 12, fontWeight: '600', color: '#333', textAlign: 'center' },

  // -- PASO 2 --
  toggleContainer: { flexDirection: 'row', marginBottom: 25, backgroundColor: '#f5f5f5', borderRadius: 10, padding: 4 },
  toggleBtn: { paddingVertical: 12, paddingHorizontal: 15, borderRadius: 8 },
  toggleActive: { backgroundColor: '#fff', shadowColor: "#000", shadowOpacity: 0.1, elevation: 1 },
  toggleText: { fontWeight: '600', color: '#999', fontSize: 13 },
  textActive: { color: '#333' },

  inputWrapper: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  currency: { fontSize: 40, fontWeight: '300', color: '#333' },
  amountInput: { fontSize: 50, fontWeight: 'bold', color: '#333', minWidth: 100, textAlign: 'center' },

  // -- PASO 3 (RESUMEN) --
  summaryCard: { 
    backgroundColor: '#f9f9fa', 
    width: '100%', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee'
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#888' },
  summaryValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  
  amountDisplay: { alignItems: 'center', marginTop: 10 },
  amountLabel: { fontSize: 12, color: '#888', textTransform: 'uppercase', marginBottom: 5 },
  amountValue: { fontSize: 36, fontWeight: 'bold', color: '#333' },

  // -- BOTONES COMUNES --
  navButtons: { flexDirection: 'row', marginTop: 'auto', width: '100%', gap: 12, marginBottom: 10 },
  backBtn: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#666', fontWeight: '600' },
  
  nextBtn: { flex: 2, backgroundColor: '#222', padding: 16, borderRadius: 14, alignItems: 'center' },
  nextText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  confirmBtn: { flex: 2, backgroundColor: '#007AFF', padding: 16, borderRadius: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  disabledBtn: { backgroundColor: '#ccc' },

  // -- INDICADORES --
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#eee' },
  activeDot: { backgroundColor: '#333' }
});

export default TransferWizard;