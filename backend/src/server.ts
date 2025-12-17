// backend/src/server.ts
import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { GameDatabase, GameRoom, Player } from './types';

// --- CONFIGURACIÓN ---
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] } // Permitir acceso desde el celular
});

// --- BASE DE DATOS (En Memoria) ---
const games: GameDatabase = {};

// --- UTILIDADES ---
// Función para generar código de sala de 4 letras
const generateRoomCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

// --- LÓGICA DE SOCKETS ---
io.on('connection', (socket: Socket) => {
  console.log('🔌 Nuevo dispositivo conectado:', socket.id);

  // EVENTO 1: UNIRSE O CREAR SALA
  socket.on('join_game', ({ roomCode, playerName }: { roomCode?: string, playerName: string }) => {
    
    // 1. Validar nombre
    if (!playerName) return;

    let room: GameRoom | undefined;
    let code = roomCode?.toUpperCase();
    let isHost = false;

    // 2. ¿Quiere entrar a una sala existente?
    if (code && games[code]) {
      room = games[code];
    } else {
      // 3. Si no mandó código (o no existe), CREAMOS UNA NUEVA
      code = generateRoomCode();
      isHost = true; // Es el primer jugador, así que es el Host
      
      // Inicializamos la sala
      games[code] = {
        code,
        players: [],
        history: [`Sala ${code} creada por ${playerName}`]
      };
      
      room = games[code];
      console.log(`✨ Sala creada: ${code}`);
    }

    // 4. Verificar si el jugador ya está (para reconexiones simples)
    const existingPlayer = room.players.find(p => p.name === playerName);

    if (existingPlayer) {
      // Si ya existe, actualizamos su ID de socket (se reconectó)
      existingPlayer.id = socket.id;
      console.log(`🔄 ${playerName} se reconectó a ${code}`);
    } else {
      // Si es nuevo, lo agregamos
      const newPlayer: Player = {
        id: socket.id,
        name: playerName,
        balance: 1500, // Saldo inicial Monopoly
        debt: 0,
        isHost
      };
      room.players.push(newPlayer);
      room.history.push(`${playerName} se unió al juego.`);
      console.log(`👤 ${playerName} entró a ${code}`);
    }

    // 5. Unir el socket al canal de la sala
    socket.join(code!);

    // 6. ¡IMPORTANTE! Enviamos la actualización A TODOS en la sala
    io.to(code!).emit('game_updated', room);
  });

  socket.on('disconnect', () => {
    console.log('❌ Dispositivo desconectado:', socket.id);
  });
});

// --- INICIAR ---
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor listo en puerto ${PORT}`);
});