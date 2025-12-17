export interface Player {
  id: string;
  name: string;
  color: string;
  balance: number;
  debt: number;
  isHost: boolean;
  isProcessing: boolean;
}

export interface GameSettings {
  goReward: number;
  initialBalance: number;
}

export interface GameRoom {
  code: string;
  settings: GameSettings;
  players: Player[];
  history: string[];
}

export type GameDatabase = Record<string, GameRoom>;