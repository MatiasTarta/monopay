import { io } from "socket.io-client";
const API_URL = "https://monopay-1lxl.onrender.com"; 
// -------------------

console.log("Configurando socket hacia:", API_URL);

export const socket = io(API_URL, {
  autoConnect: false, 
  transports: ["websocket"],
});

// Listeners para depuración (déjalos, son muy útiles)
socket.on("connect", () => console.log("✅ Conectado al servidor Render!"));
socket.on("connect_error", (err) => console.log("❌ Error conexión:", err.message));