import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { socket } from '../../services/socket';
export default function SaldoScreen() {
  const router = useRouter();
  const [roomData, setRoomData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    console.log("🏦 Pantalla de Saldo montada. Esperando datos...");
    socket.on('game_updated', (room) => {
      console.log("📦 Datos recibidos en Saldo");
      setRoomData(room);

      const me = room.players.find((p: any) => p.id === socket.id);
      setCurrentUser(me);
    });
    if (socket.connected) {
      socket.emit('request_update_by_socket');
    } else {
      socket.connect();
      setTimeout(() => socket.emit('request_update_by_socket'), 500);
    }

    return () => {
      socket.off('game_updated');
    };
  }, []);


  const handleCollectGo = () => {
    if (!roomData) return;

    // PREGUNTA DE SEGURIDAD (UX)
    // Evita clicks accidentales que arruinan la partida
    Alert.alert(
      "Pasar por la SALIDA",
      "¿Confirmas que diste la vuelta? Se te sumarán $200.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "SÍ, COBRAR",
          onPress: () => {
            // Enviamos la transacción con el formato NUEVO y SEGURO
            socket.emit('make_transaction', {
              roomCode: roomData.code,
              targetId: 'BANK', // Destino ficticio para cumplir el protocolo
              amount: 200,      // Monto obligatorio
              type: 'BANK_GO'   // El tipo exacto que espera el switch del server
            });
          }
        }
      ]
    );
  };

  if (!roomData || !currentUser) {
    return <View style={styles.center}><Text>Cargando partida...</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ENCABEZADO: SALA */}
        <View style={styles.header}>
          <Text style={styles.roomLabel}>SALA: {roomData.code}</Text>
          <View style={styles.onlineBadge}>
            <Text style={styles.onlineText}>🟢 {roomData.players.length} Online</Text>
          </View>
        </View>

        {/* TARJETA PRINCIPAL (SALDO) */}
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>SALDO DISPONIBLE</Text>
          <Text style={styles.balanceText}>${currentUser.balance}</Text>
          {currentUser.debt > 0 && (
            <View style={styles.debtTag}>
              <Text style={styles.debtText}>Deuda: ${currentUser.debt}</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#dff9fb' }]}
            onPress={handleCollectGo} 
          >
            <Text style={styles.btnIcon}>🏁</Text>
            <Text style={[styles.btnLabel, { color: '#130f40' }]}>Cobrar GO (+$200)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#eccc68' }]}
            onPress={() => router.push('/(tabs)/transferWizard')}
          >
            <Text style={styles.btnIcon}>💸</Text>
            <Text style={[styles.btnLabel, { color: '#535c68' }]}>Transferir</Text>
          </TouchableOpacity>
        </View>

        {/* LISTA RESUMIDA DE JUGADORES */}
        <Text style={styles.sectionTitle}>Ranking de Riqueza</Text>
        {roomData.players
          .sort((a: any, b: any) => b.balance - a.balance) // Ordenar por dinero
          .map((player: any) => (
            <View key={player.id} style={styles.playerRow}>
              <View style={styles.rowLeft}>
                <View style={[styles.avatar, player.id === socket.id && styles.myAvatar]}>
                  <Text style={styles.avatarText}>{player.name[0]}</Text>
                </View>
                <Text style={styles.playerName}>
                  {player.name} {player.isHost && '👑'} {player.id === socket.id && '(Tú)'}
                </Text>
              </View>
              <Text style={styles.playerBalance}>${player.balance}</Text>
            </View>
          ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  roomLabel: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', letterSpacing: 2 },
  onlineBadge: { backgroundColor: '#dff9fb', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  onlineText: { color: '#22a6b3', fontWeight: 'bold', fontSize: 12 },

  mainCard: { backgroundColor: '#2c3e50', borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 25, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  cardTitle: { color: '#95a5a6', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 10 },
  balanceText: { color: '#fff', fontSize: 50, fontWeight: 'bold' },
  debtTag: { backgroundColor: '#e74c3c', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginTop: 10 },
  debtText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#34495e', marginBottom: 15 },

  // ESTILOS DE LOS BOTONES RESTAURADOS
  actionGrid: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  actionBtn: { flex: 1, padding: 20, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  btnIcon: { fontSize: 32, marginBottom: 5 },
  btnLabel: { fontWeight: 'bold', fontSize: 14 },

  playerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#bdc3c7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  myAvatar: { backgroundColor: '#2980b9' },
  avatarText: { color: 'white', fontWeight: 'bold' },
  playerName: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  playerBalance: { fontSize: 16, fontWeight: 'bold', color: '#27ae60' }
});