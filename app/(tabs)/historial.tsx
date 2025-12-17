import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { socket } from '../../services/socket';

export default function HistoryScreen() {
  const [roomData, setRoomData] = useState<any>(null);

  useEffect(() => {
    console.log("📜 Historial montado");

    socket.on('game_updated', (room) => {
      setRoomData(room);
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

  if (!roomData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={{ marginTop: 10, color: '#7f8c8d' }}>Cargando registros...</Text>
      </View>
    );
  }
  const reversedHistory = [...roomData.history].reverse();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Movimientos</Text>
        <Text style={styles.subtitle}>Sala: {roomData.code}</Text>
      </View>

      <FlatList
        data={reversedHistory}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={styles.logRow}>
            <View style={styles.indexCircle}>
              <Text style={styles.indexText}>#{reversedHistory.length - index}</Text>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.logText}>{item}</Text>
              <Text style={styles.timeAgo}>Hace un momento</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aún no hay movimientos en esta partida.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
  subtitle: { fontSize: 14, color: '#7f8c8d', marginTop: 5, letterSpacing: 1 },

  listContent: { padding: 20 },

  logRow: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },

  indexCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ecf0f1', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  indexText: { fontSize: 10, fontWeight: 'bold', color: '#7f8c8d' },

  textContainer: { flex: 1 },
  logText: { fontSize: 14, color: '#34495e', lineHeight: 20 },
  timeAgo: { fontSize: 10, color: '#bdc3c7', marginTop: 4 },

  emptyText: { textAlign: 'center', marginTop: 50, color: '#95a5a6', fontStyle: 'italic' }
});