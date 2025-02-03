export interface Player {
  id: string;
  name: string;
  score: number;
  cardNumber: number | null;
  isActive: boolean;
}

export interface GameState {
  id: string;
  status: "waiting" | "playing" | "finished";
  players: Player[];
  currentRound: number;
  totalRounds: number;
  revealedCard: number | null;
  organizer: string;
  winner: string | null;
}

export interface GameSettings {
  totalRounds: number;
  maxPlayers: number;
}

export interface CardProps {
  number: number | null;
  isRevealed: boolean;
  isActive: boolean;
  onClick?: () => void;
}

export interface ShareButtonProps {
  gameUrl: string;
}

export interface GameContextType {
  gameState: GameState;
  settings: GameSettings;
  currentPlayer: Player | null;
  makeGuess: (guessedNumber: number) => void;
  joinGame: (playerName: string) => void;
  createGame: (playerName: string) => void;
  setReady: (playerId: string) => void;
  startGame: () => void;
}
