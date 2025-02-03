import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";
import { GameState, Player, GameSettings } from "../types/game";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface GameStore {
  gameState: GameState;
  settings: GameSettings;
  currentPlayer: Player | null;

  // Actions
  createGame: (playerName: string) => Promise<string>;
  joinGame: (gameId: string, playerName: string) => Promise<void>;
  makeGuess: (guessedNumber: number) => Promise<void>;
  swapCards: (player1Id: string, player2Id: string) => Promise<void>;
  setReady: (playerId: string) => Promise<void>;
  startGame: () => Promise<void>;
  resetGame: () => void;
  updateGameState: (newState: DbGame) => void;
  restoreGameState: (gameId: string) => Promise<boolean>;
}

// Database schema type
interface DbGame {
  id: string;
  status: "waiting" | "playing" | "finished";
  players: Player[];
  current_round: number;
  total_rounds: number;
  revealed_card: number | null;
  organizer: string;
  winner: string | null;
}

// Convert database game to application game state
const dbGameToGameState = (dbGame: DbGame): GameState => ({
  id: dbGame.id,
  status: dbGame.status,
  players: dbGame.players,
  currentRound: dbGame.current_round,
  totalRounds: dbGame.total_rounds,
  revealedCard: dbGame.revealed_card,
  organizer: dbGame.organizer,
  winner: dbGame.winner,
});

// Convert application game state to database game
const gameStateToDbGame = (gameState: GameState): DbGame => ({
  id: gameState.id,
  status: gameState.status,
  players: gameState.players,
  current_round: gameState.currentRound,
  total_rounds: gameState.totalRounds,
  revealed_card: gameState.revealedCard,
  organizer: gameState.organizer,
  winner: gameState.winner,
});

const initialGameState: GameState = {
  id: "",
  status: "waiting",
  players: [],
  currentRound: 0,
  totalRounds: 10,
  revealedCard: null,
  organizer: "",
  winner: null,
};

const initialSettings: GameSettings = {
  totalRounds: 10,
  maxPlayers: 8,
};

export const useGameStore = create<GameStore>((set, get) => {
  // Keep track of active subscriptions
  let activeSubscription: ReturnType<typeof supabase.channel> | null = null;

  const setupRealtimeSubscription = (gameId: string) => {
    // Clean up existing subscription if any
    if (activeSubscription) {
      activeSubscription.unsubscribe();
    }

    // Set up new subscription
    activeSubscription = supabase
      .channel(`game:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          if (payload.new) {
            const { currentPlayer } = get();
            const newState = dbGameToGameState(payload.new as DbGame);

            // Update current player state if it exists
            if (currentPlayer) {
              const updatedPlayer = newState.players.find(
                (p) => p.id === currentPlayer.id
              );
              set({
                gameState: newState,
                currentPlayer: updatedPlayer || currentPlayer,
              });
            } else {
              set({ gameState: newState });
            }
          }
        }
      )
      .subscribe();
  };

  return {
    gameState: initialGameState,
    settings: initialSettings,
    currentPlayer: null,

    createGame: async (playerName: string) => {
      const gameId = Math.random().toString(36).substring(2, 9);
      const player: Player = {
        id: Math.random().toString(36).substring(2, 9),
        name: playerName,
        score: 0,
        cardNumber: null,
        isActive: false,
      };

      const newGameState: GameState = {
        ...initialGameState,
        id: gameId,
        players: [player],
        organizer: player.id,
      };

      const { error } = await supabase
        .from("games")
        .insert([gameStateToDbGame(newGameState)]);

      if (error) {
        console.error("Error creating game:", error);
        throw new Error("Failed to create game");
      }

      // Store player data with combined key format
      localStorage.setItem(`game_${gameId}`, JSON.stringify(player));

      // Set up real-time subscription
      setupRealtimeSubscription(gameId);

      // Set game state and current player before updating URL
      set({ gameState: newGameState, currentPlayer: player });

      // Update URL with game ID without triggering state restoration
      const newUrl = `${window.location.origin}?game=${gameId}`;
      window.history.replaceState({ path: newUrl }, "", newUrl);

      return gameId;
    },

    joinGame: async (gameId: string, playerName: string) => {
      try {
        const { data: dbGame, error } = await supabase
          .from("games")
          .select()
          .eq("id", gameId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching game:", error);
          throw new Error("Failed to fetch game");
        }

        if (!dbGame) {
          throw new Error("Game not found");
        }

        const gameState = dbGameToGameState(dbGame as DbGame);

        // Prevent joining if game has already started
        if (gameState.status !== "waiting") {
          throw new Error("Cannot join a game that has already started");
        }

        if (gameState.players.length >= initialSettings.maxPlayers) {
          throw new Error("Game is full");
        }

        const player: Player = {
          id: Math.random().toString(36).substring(2, 9),
          name: playerName,
          score: 0,
          cardNumber: null,
          isActive: false,
        };

        const updatedPlayers = [...gameState.players, player];
        const updatedGameState: GameState = {
          ...gameState,
          players: updatedPlayers,
        };

        const { error: updateError } = await supabase
          .from("games")
          .update(gameStateToDbGame(updatedGameState))
          .eq("id", gameId);

        if (updateError) {
          console.error("Error updating game:", updateError);
          throw new Error("Failed to join game");
        }

        // Store player data with combined key
        localStorage.setItem(`game_${gameId}`, JSON.stringify(player));

        // Set up real-time subscription
        setupRealtimeSubscription(gameId);

        set({
          gameState: updatedGameState,
          currentPlayer: player,
        });
      } catch (error) {
        console.error("Error in joinGame:", error);
        throw error;
      }
    },

    swapCards: async (player1Id: string, player2Id: string) => {
      const { gameState } = get();
      const player1 = gameState.players.find((p) => p.id === player1Id);
      const player2 = gameState.players.find((p) => p.id === player2Id);

      if (!player1 || !player2) return;

      const updatedPlayers = gameState.players.map((player) => {
        if (player.id === player1Id) {
          return {
            ...player,
            cardNumber: player2.cardNumber,
            isActive: false,
          };
        }
        if (player.id === player2Id) {
          return {
            ...player,
            cardNumber: player1.cardNumber,
            isActive: true,
          };
        }
        return player;
      });

      const updatedGameState: GameState = {
        ...gameState,
        players: updatedPlayers,
      };

      const { error } = await supabase
        .from("games")
        .update(gameStateToDbGame(updatedGameState))
        .eq("id", gameState.id);

      if (error) {
        console.error("Error swapping cards:", error);
        throw new Error("Failed to swap cards");
      }

      set({ gameState: updatedGameState });
    },

    makeGuess: async (guessedNumber: number) => {
      const { gameState, currentPlayer } = get();
      if (!currentPlayer?.isActive || gameState.status !== "playing") return;

      const targetPlayer = gameState.players.find(
        (p) => p.cardNumber === guessedNumber
      );
      if (!targetPlayer) return;

      const isCorrectGuess =
        guessedNumber === (currentPlayer.cardNumber || 0) + 1;
      const points = isCorrectGuess
        ? gameState.players.length - guessedNumber + 1
        : 0;

      if (isCorrectGuess) {
        // Handle correct guess
        const updatedPlayers = gameState.players.map((player) => {
          if (player.id === currentPlayer.id) {
            return {
              ...player,
              score: player.score + points,
              isActive: false,
              cardNumber: null, // Player is out of game
            };
          }
          if (player.id === targetPlayer.id) {
            return {
              ...player,
              isActive: true, // Next player becomes active
            };
          }
          return player;
        });

        // Check if only two players remain with cards
        const playersWithCards = updatedPlayers.filter(
          (p) => p.cardNumber !== null
        );
        const roundFinished = playersWithCards.length === 2;

        if (roundFinished) {
          // Last active player gets points for their card number
          const lastActivePlayer = playersWithCards.find((p) => p.isActive);
          const lastPlayer = playersWithCards.find((p) => !p.isActive);

          if (lastActivePlayer && lastPlayer) {
            // Award points to both players
            updatedPlayers.forEach((player) => {
              if (player.id === lastActivePlayer.id) {
                player.score +=
                  gameState.players.length - (lastActivePlayer.cardNumber || 0);
                player.cardNumber = null;
              }
              if (player.id === lastPlayer.id) {
                player.score +=
                  gameState.players.length - (lastPlayer.cardNumber || 0);
                player.cardNumber = null;
              }
            });
          }
        }

        const updatedGameState: GameState = {
          ...gameState,
          players: updatedPlayers,
          revealedCard: guessedNumber,
          status: roundFinished ? "finished" : "playing",
          currentRound: roundFinished
            ? gameState.currentRound + 1
            : gameState.currentRound,
        };

        const { error } = await supabase
          .from("games")
          .update(gameStateToDbGame(updatedGameState))
          .eq("id", gameState.id);

        if (error) {
          console.error("Error updating game:", error);
          throw new Error("Failed to update game");
        }

        set({ gameState: updatedGameState });
      } else {
        // Handle incorrect guess by swapping cards
        await get().swapCards(currentPlayer.id, targetPlayer.id);
      }
    },

    setReady: async (playerId: string) => {
      const { gameState } = get();
      const updatedPlayers = gameState.players.map((player) =>
        player.id === playerId ? { ...player, isReady: true } : player
      );

      const updatedGameState: GameState = {
        ...gameState,
        players: updatedPlayers,
      };

      const { error } = await supabase
        .from("games")
        .update(gameStateToDbGame(updatedGameState))
        .eq("id", gameState.id);

      if (error) {
        console.error("Error updating game:", error);
        throw new Error("Failed to update game");
      }

      set({ gameState: updatedGameState });
    },

    startGame: async () => {
      const { gameState } = get();

      const numbers = Array.from(
        { length: gameState.players.length },
        (_, i) => i + 1
      );
      const shuffledNumbers = numbers.sort(() => Math.random() - 0.5);

      const updatedPlayers = gameState.players.map((player, index) => ({
        ...player,
        cardNumber: shuffledNumbers[index],
        isActive: shuffledNumbers[index] === 1,
      }));

      const updatedGameState: GameState = {
        ...gameState,
        status: "playing",
        players: updatedPlayers,
        currentRound: gameState.currentRound || 1,
        revealedCard: 1,
      };

      const { error } = await supabase
        .from("games")
        .update(gameStateToDbGame(updatedGameState))
        .eq("id", gameState.id);

      if (error) {
        console.error("Error starting game:", error);
        throw new Error("Failed to start game");
      }

      set({ gameState: updatedGameState });
    },

    resetGame: () => {
      // Clean up subscription when resetting
      if (activeSubscription) {
        activeSubscription.unsubscribe();
        activeSubscription = null;
      }

      set({
        gameState: initialGameState,
        currentPlayer: null,
      });
    },

    restoreGameState: async (gameId: string) => {
      try {
        // First check if we already have a game state and current player
        const { gameState: currentGameState, currentPlayer: existingPlayer } =
          get();
        if (currentGameState.id === gameId && existingPlayer) {
          return true;
        }

        // Find player data in localStorage first
        let storedPlayer: Player | null = null;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(`game_${gameId}`)) {
            const storedPlayerData = localStorage.getItem(key);
            if (storedPlayerData) {
              storedPlayer = JSON.parse(storedPlayerData);
              break;
            }
          }
        }

        if (!storedPlayer) {
          return false;
        }

        // Fetch current game state from Supabase
        const { data: dbGame, error } = await supabase
          .from("games")
          .select()
          .eq("id", gameId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching game:", error);
          throw new Error("Failed to fetch game");
        }

        if (!dbGame) {
          throw new Error("Game not found");
        }

        const gameState = dbGameToGameState(dbGame as DbGame);

        // Find the current state of our stored player
        const updatedPlayer = gameState.players.find(
          (p) => p.id === storedPlayer!.id
        );

        if (!updatedPlayer) {
          // Player no longer exists in the game
          return false;
        }

        // Set up real-time subscription
        setupRealtimeSubscription(gameId);

        // Update the game state and current player
        set({
          gameState,
          currentPlayer: updatedPlayer,
        });

        return true;
      } catch (error) {
        console.error("Error restoring game state:", error);
        throw error;
      }
    },

    updateGameState: (newState: DbGame) => {
      set({ gameState: dbGameToGameState(newState) });
    },
  };
});
