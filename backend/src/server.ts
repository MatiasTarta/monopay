
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
        const code = roomCode?.toUpperCase();

        if (action === 'JOIN') {
            if (!code || !games[code]) {
                socket.emit('error_message', '❌ La sala no existe. Verifica el código.');
                return;
            }

            const room = games[code];
            const existingPlayer = room.players.find(p => p.name === playerName);

            if (existingPlayer) {
                existingPlayer.id = socket.id; // Reconexión
            } else {
                // Nuevo jugador en sala existente
                room.players.push({
                    id: socket.id,
                    name: playerName,
                    balance: 1500,
                    debt: 0,
                    isHost: false
                });
            }
            socket.join(code);
            io.to(code).emit('game_updated', room);
            socket.emit('join_success', room);
        }

        else if (action === 'CREATE') {
            const newCode = generateRoomCode(); // Siempre generamos uno nuevo
            games[newCode] = {
                code: newCode,
                players: [{
                    id: socket.id,
                    name: playerName,
                    balance: 1500,
                    debt: 0,
                    isHost: true // Es el creador
                }],
                history: []
            };

            socket.join(newCode);
            socket.emit('join_success', games[newCode]);
            io.to(newCode).emit('game_updated', games[newCode]);

            console.log(`✨ Sala creada: ${newCode} por ${playerName}`);
        }
    });


        //operacion de transaccion
    socket.on('make_transaction', ({ roomCode, targetId, amount, type }) => {
        const code = roomCode?.toUpperCase();
        if (!code || !games[code]) return;

        const room = games[code];
        const sender = room.players.find(p => p.id === socket.id);
        const amountNum = parseInt(amount);

        if (!sender || isNaN(amountNum) || amountNum <= 0) return;

        // A. TRANSFERENCIA ENTRE JUGADORES (P2P)
        if (type === 'P2P') {
            const receiver = room.players.find(p => p.id === targetId);

            if (receiver) {
                // Lógica: Restar al que envía, sumar al que recibe
                if (sender.balance >= amountNum) {
                    sender.balance -= amountNum;
                    receiver.balance += amountNum;
                    room.history.push(`${sender.name} transfirió $${amountNum} a ${receiver.name}`);
                } else {
                    socket.emit('error_message', '❌ No tienes fondos suficientes.');
                    return;
                }
            }
        }

        // B. OPERACIONES CON EL BANCO
        else if (type === 'BANK_LOAN') {
            // Pedir Préstamo: Sube saldo, Sube deuda
            sender.balance += amountNum;
            sender.debt += amountNum;
            room.history.push(`${sender.name} pidió un préstamo de $${amountNum}`);
        }
        else if (type === 'BANK_PAY') {
            // Pagar al Banco: Baja saldo, Baja deuda
            if (sender.balance >= amountNum) {
                sender.balance -= amountNum;
                // La deuda no puede ser negativa, pagamos lo que se pueda
                const payment = Math.min(sender.debt, amountNum);
                sender.debt -= payment;
                room.history.push(`${sender.name} pagó $${amountNum} al banco`);
            } else {
                socket.emit('error_message', '❌ No tienes fondos para pagar al banco.');
                return;
            }
        }

        // FINAL: Enviar estado actualizado a TODOS
        io.to(code).emit('game_updated', room);
        socket.emit('transaction_success'); // Confirmación al usuario
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