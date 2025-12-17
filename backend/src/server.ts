
import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { GameDatabase } from './types';


const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});



const games: GameDatabase = {};

const generateRoomCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();


io.on('connection', (socket: Socket) => {
    console.log('🔌 Nuevo dispositivo conectado:', socket.id);

    socket.on('join_game', ({ roomCode, playerName, action }: { roomCode?: string, playerName: string, action: 'CREATE' | 'JOIN' }) => {

        if (!playerName) return;
        if (action === 'JOIN') {
            const code = roomCode?.toUpperCase();
            if (!code || !games[code]) {
                socket.emit('error_message', '❌ La sala no existe.');
                return;
            }

            const room = games[code];
            const existingPlayer = room.players.find(p => p.name === playerName);

            if (existingPlayer) {
                console.log(`♻️  ${playerName} se reconectó (Socket ID actualizado)`);
                existingPlayer.id = socket.id;
            } else {
                room.players.push({
                    id: socket.id,
                    name: playerName,
                    balance: 1500,
                    debt: 0,
                    isHost: false,
                    isProcessing: false
                });
                console.log(`➕ ${playerName} entró a sala ${code}`);
            }

            socket.join(code);
            io.to(code).emit('game_updated', room);
            socket.emit('join_success', room);
        }
        else if (action === 'CREATE') {
            let newCode = generateRoomCode();
            let attempts = 0;
            while (games[newCode] && attempts < 10) {
                console.log(`⚠️ Colisión de código ${newCode}, generando otro...`);
                newCode = generateRoomCode();
                attempts++;
            }
            games[newCode] = {
                code: newCode,
                players: [{
                    id: socket.id,
                    name: playerName,
                    balance: 1500,
                    debt: 0,
                    isHost: true,
                    isProcessing: false
                }],
                history: [`Sala ${newCode} creada por ${playerName}`]
            };

            socket.join(newCode);
            socket.emit('join_success', games[newCode]);
            io.to(newCode).emit('game_updated', games[newCode]);

            console.log(`✨ Sala creada: ${newCode} por ${playerName}`);
        }
    });


    socket.on('make_transaction', ({ roomCode, targetId, amount, type }) => {
        const code = roomCode?.toUpperCase();
        if (!code || !games[code]) return;

        const room = games[code];
        const sender = room.players.find(p => p.id === socket.id);
        const amountNum = parseInt(amount);

        if (!sender) return;
        if (sender.isProcessing) {
            socket.emit('error_message', '⚠️ Espera, procesando anterior...');
            return;
        }

        sender.isProcessing = true; 

        try {
            if (isNaN(amountNum) || amountNum <= 0) {
                throw new Error("Monto inválido.");
            }
            if (type === 'P2P') {
                const receiver = room.players.find(p => p.id === targetId);

                if (!receiver) throw new Error("Destinatario no encontrado.");
                if (sender.balance < amountNum) throw new Error("❌ Fondos insuficientes.");

                sender.balance -= amountNum;
                receiver.balance += amountNum;
                room.history.push(`${sender.name} pagó $${amountNum} a ${receiver.name}`);
            }
            else if (type === 'BANK_LOAN') {
                sender.balance += amountNum;
                sender.debt += amountNum;
                room.history.push(`${sender.name} pidió préstamo de $${amountNum}`);
            }
            else if (type === 'BANK_PAY') {
                if (sender.balance < amountNum) throw new Error("No tienes suficiente dinero.");

                sender.balance -= amountNum;
                const payment = Math.min(sender.debt, amountNum);
                sender.debt -= payment;
                room.history.push(`${sender.name} pagó $${amountNum} al banco`);
            }
            else if (type === 'BANK_GO') {
                sender.balance += 200;
                room.history.push(`🏁 ${sender.name} pasó por la SALIDA`);
            }
            if (room.history.length > 50) room.history.shift();
            io.to(code).emit('game_updated', room);
            socket.emit('transaction_success');

        } catch (error: any) {
            console.log(`Error transacción: ${error.message}`);
            socket.emit('error_message', error.message || 'Error desconocido');
        } finally {
            sender.isProcessing = false;
        }
    });

    socket.on('disconnect', () => {
        for (const code in games) {
            const room = games[code];
            const playerIndex = room.players.findIndex(p => p.id === socket.id);

            if (playerIndex !== -1) {
                console.log(`❌ Jugador desconectado de sala ${code}`);
            }
        }
    });

    setInterval(() => {
        console.log("🧹 Limpiando salas viejas...");
    }, 1000 * 60 * 60);

    socket.on('request_update', ({ roomCode }) => {
        const code = roomCode?.toUpperCase();
        if (code && games[code]) {
            socket.emit('game_updated', games[code]);
        }
    });

    socket.on('request_update_by_socket', () => {
        const roomCode = Object.keys(games).find(code =>
            games[code].players.some(p => p.id === socket.id)
        );

        if (roomCode) {
            socket.emit('game_updated', games[roomCode]);
        }
    });

});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});