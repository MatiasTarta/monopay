import { io } from "socket.io-client";

const IP = "192.168.0.10"; 
const PORT = 3000;

const API_URL = `http://${IP}:${PORT}`;

console.log("Configurando socket hacia:", API_URL);

export const socket = io(API_URL, {
  autoConnect: false,
  transports: ["websocket"], 
});

// Listeners para depuración
socket.on("connect", () => console.log("✅ Conectado al servidor!"));
socket.on("connect_error", (err) => console.log("❌ Error conexión:", err.message));