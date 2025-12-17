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
    socket.on('join_game', ({ roomCode, playerName, action, color, settings }) => {

        if (!playerName) return;
        const playerColor = color || '#34495e';

        if (action === 'JOIN') {
            const code = roomCode?.toUpperCase();
            if (!code || !games[code]) {
                socket.emit('error_message', '❌ La sala no existe.');
                return;
            }

            const room = games[code];
            const existingPlayer = room.players.find(p => p.name === playerName);

            if (existingPlayer) {
                console.log(`♻️  ${playerName} se reconectó`);
                existingPlayer.id = socket.id;
                existingPlayer.color = playerColor;
            } else {
                room.players.push({
                    id: socket.id,
                    name: playerName,
                    color: playerColor, 
                    balance: room.settings.initialBalance, 
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
            while (games[newCode]) newCode = generateRoomCode();

            const roomSettings = {
                initialBalance: settings?.initialBalance || 35000,
                goReward: settings?.goReward || 2000
            };

            games[newCode] = {
                code: newCode,
                settings: roomSettings, 
                players: [{
                    id: socket.id,
                    name: playerName,
                    color: playerColor, 
                    balance: roomSettings.initialBalance,
                    debt: 0,
                    isHost: true,
                    isProcessing: false
                }],
                history: [`Sala ${newCode} creada por ${playerName}`]
            };

            socket.join(newCode);
            socket.emit('join_success', games[newCode]);
            io.to(newCode).emit('game_updated', games[newCode]);

            console.log(`✨ Sala ${newCode} creada. Saldo Ini: ${roomSettings.initialBalance}, Salida: ${roomSettings.goReward}`);
        }
    });

    socket.on('make_transaction', ({ roomCode, targetId, amount, type }) => {
        const code = roomCode?.toUpperCase();
        if (!code || !games[code]) return;

        const room = games[code];
        const sender = room.players.find(p => p.id === socket.id);
        const amountNum = parseInt(amount);

        if (!sender) return;
        if (sender.isProcessing) return;

        sender.isProcessing = true;

        try {
            if (type === 'P2P') {
                if (isNaN(amountNum) || amountNum <= 0) throw new Error("Monto inválido.");
                const receiver = room.players.find(p => p.id === targetId);
                if (!receiver) throw new Error("Destinatario no encontrado.");
                if (sender.balance < amountNum) throw new Error("❌ Fondos insuficientes.");

                sender.balance -= amountNum;
                receiver.balance += amountNum;
                room.history.push(`${sender.name} pagó $${amountNum} a ${receiver.name}`);
            }
            else if (type === 'BANK_LOAN') {
                if (isNaN(amountNum) || amountNum <= 0) throw new Error("Monto inválido.");
                sender.balance += amountNum;
                sender.debt += amountNum;
                room.history.push(`${sender.name} pidió préstamo de $${amountNum}`);
            }
            else if (type === 'BANK_PAY') {
                if (isNaN(amountNum) || amountNum <= 0) throw new Error("Monto inválido.");
                if (sender.balance < amountNum) throw new Error("No tienes suficiente dinero.");

                sender.balance -= amountNum;
                const payment = Math.min(sender.debt, amountNum);
                sender.debt -= payment;
                room.history.push(`${sender.name} pagó $${amountNum} al banco`);
            }
            else if (type === 'BANK_GO') {
                const salario = room.settings.goReward;
                sender.balance += salario;
                room.history.push(`🏁 ${sender.name} pasó por la SALIDA (+$${salario})`);
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

    socket.on('disconnect', () => {});

    socket.on('request_update_by_socket', () => {
        const roomCode = Object.keys(games).find(code =>
            games[code].players.some(p => p.id === socket.id)
        );
        if (roomCode) socket.emit('game_updated', games[roomCode]);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});