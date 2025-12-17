import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { socket } from '../../services/socket';

export default function SaldoScreen() {
  const router = useRouter();
  const [roomData, setRoomData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const premioSalida = roomData?.settings?.goReward || 200;

  useEffect(() => {
    socket.on('game_updated', (room) => {
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
    Alert.alert(
      "Pasar por la SALIDA",
      `¿Confirmas que diste la vuelta? Se te sumarán $${premioSalida}.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "SÍ, COBRAR",
          onPress: () => {
            socket.emit('make_transaction', {
              roomCode: roomData.code,
              targetId: 'BANK',
              amount: premioSalida,
              type: 'BANK_GO'
            });
          }
        }
      ]
    );
  };

  const handleExit = () => {
    Alert.alert(
      "Salir de la partida",
      "¿Seguro que quieres salir? (Podrás ingresar nuevamente a la sala con tu mismo nombre)",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "SÍ, SALIR",
          style: 'destructive',
          onPress: () => {
            router.replace('/'); 
          }
        }
      ]
    );
  };

  if (!roomData || !currentUser) {
    return <View style={styles.center}><Text>Cargando partida...</Text></View>;
  }

  const myColor = currentUser.color || '#2c3e50';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <View>
            <Text style={styles.roomLabel}>SALA: {roomData.code}</Text>
            <View style={styles.onlineBadge}>
              <Text style={styles.onlineText}>🟢 {roomData.players.length} Online</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>🚪 Salir</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.mainCard, { borderTopColor: myColor, borderTopWidth: 6 }]}>
          <Text style={styles.cardTitle}>SALDO DISPONIBLE</Text>
          <Text style={[styles.balanceText, { color: myColor }]}>
            ${currentUser.balance}
          </Text>
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
            <Text style={[styles.btnLabel, { color: '#130f40' }]}>
              Cobrar GO (+${premioSalida})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#eccc68' }]}
            onPress={() => router.push('/(tabs)/transferWizard')}
          >
            <Text style={styles.btnIcon}>💸</Text>
            <Text style={[styles.btnLabel, { color: '#535c68' }]}>Transferir</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Ranking de Riqueza</Text>
        {roomData.players
          .sort((a: any, b: any) => b.balance - a.balance)
          .map((player: any) => (
            <View key={player.id} style={styles.playerRow}>
              <View style={styles.rowLeft}>
                <View style={[styles.avatar, { backgroundColor: player.color || '#bdc3c7' }]}>
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

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  roomLabel: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', letterSpacing: 2, marginBottom: 5 },
  onlineBadge: { backgroundColor: '#dff9fb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
  onlineText: { color: '#22a6b3', fontWeight: 'bold', fontSize: 12 },

  exitButton: { backgroundColor: '#ffeaa7', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#fdcb6e' },
  exitButtonText: { color: '#d35400', fontWeight: 'bold', fontSize: 12 },

  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  cardTitle: { color: '#95a5a6', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 10 },
  balanceText: { fontSize: 50, fontWeight: 'bold' },
  debtTag: { backgroundColor: '#e74c3c', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginTop: 10 },
  debtText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#34495e', marginBottom: 15 },
  actionGrid: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  actionBtn: { flex: 1, padding: 20, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  btnIcon: { fontSize: 32, marginBottom: 5 },
  btnLabel: { fontWeight: 'bold', fontSize: 14 },
  playerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: 'white', fontWeight: 'bold' },
  playerName: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  playerBalance: { fontSize: 16, fontWeight: 'bold', color: '#27ae60' }
});