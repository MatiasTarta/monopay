export interface Player {
  id: string;          
  name: string;       
  balance: number;    
  debt: number;        
  isHost: boolean;     
  isProcessing: boolean;
}

export interface GameRoom {
  code: string;        // Código de la sala (ej: "ABCD")
  players: Player[];   // Lista de jugadores
  history: string[];   // Historial de acciones ("Juan pagó 100")
}

export type GameDatabase = Record<string, GameRoom>;