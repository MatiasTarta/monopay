import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { socket } from '../../services/socket'; // Importamos el mismo socket

export default function SaldoScreen() {
  const [roomData, setRoomData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // 1. SOLICITAR ESTADO ACTUAL (Por si llegamos tarde)
    // No hace falta emitir nada extra, el servidor ya nos mandó 'game_updated' al entrar,
    // pero necesitamos poner la oreja (listener) para escucharlo.

    // 2. ESCUCHAR ACTUALIZACIONES
    socket.on('game_updated', (room) => {
      console.log("📦 Datos recibidos del servidor:", room);
      setRoomData(room);

      // Buscamos cuál de todos los jugadores soy yo (por mi ID de socket)
      const myPlayer = room.players.find((p: any) => p.id === socket.id);
      setCurrentUser(myPlayer);
    });

    // Limpieza al salir de la pantalla
    return () => {
      socket.off('game_updated');
    };
  }, []);

  // Si aún no cargan los datos...
  if (!roomData || !currentUser) {
    return (
      <View style={styles.container}>
        <Text style={{textAlign: 'center', marginTop: 50}}>Conectando con el Banco...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* TARJETA PRINCIPAL */}
      <View style={styles.card}>
        <Text style={styles.label}>TU SALDO ACTUAL</Text>
        <Text style={styles.balance}>${currentUser.balance}</Text>
        {currentUser.debt > 0 && <Text style={styles.debt}>Deuda: ${currentUser.debt}</Text>}
      </View>

      {/* INFORMACIÓN DE LA SALA */}
      <View style={styles.roomInfo}>
        <Text style={styles.roomLabel}>CÓDIGO DE SALA:</Text>
        <Text style={styles.roomCode}>{roomData.code}</Text>
        <Text style={styles.hint}>(Comparte este código para que otros se unan)</Text>
      </View>

      {/* LISTA DE JUGADORES CONECTADOS */}
      <Text style={styles.sectionTitle}>Jugadores en Línea ({roomData.players.length})</Text>
      
      <FlatList
        data={roomData.players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.playerRow, item.id === socket.id && styles.meRow]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View>
              <Text style={styles.playerName}>
                {item.name} {item.isHost ? '👑' : ''} {item.id === socket.id ? '(Tú)' : ''}
              </Text>
              <Text style={styles.playerBalance}>${item.balance}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', padding: 20 },
  card: { backgroundColor: '#2c3e50', padding: 30, borderRadius: 20, alignItems: 'center', marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  label: { color: '#bdc3c7', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  balance: { color: '#fff', fontSize: 48, fontWeight: 'bold', marginVertical: 10 },
  debt: { color: '#e74c3c', fontSize: 16, fontWeight: 'bold' },
  
  roomInfo: { backgroundColor: '#fff', padding: 15, borderRadius: 15, alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: '#ecf0f1', borderStyle: 'dashed' },
  roomLabel: { color: '#7f8c8d', fontSize: 12, fontWeight: 'bold' },
  roomCode: { color: '#2c3e50', fontSize: 32, fontWeight: 'bold', letterSpacing: 5 },
  hint: { color: '#95a5a6', fontSize: 12, marginTop: 5 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#34495e' },
  playerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10 },
  meRow: { borderWidth: 2, borderColor: '#2ecc71' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  playerName: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  playerBalance: { fontSize: 14, color: '#27ae60', fontWeight: 'bold' }
});