import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";

const LandingPage: React.FC = () => {
  const [playerName, setPlayerName] = useState("");
  const [gameId, setGameId] = useState("");
  const [view, setView] = useState<"main" | "create" | "join">("main");
  const { createGame, joinGame } = useGameStore();

  const handleCreateGame = async () => {
    if (!playerName) return;
    const newGameId = await createGame(playerName);
    // Copy game URL to clipboard
    const gameUrl = `${window.location.origin}?game=${newGameId}`;
    await navigator.clipboard.writeText(gameUrl);
  };

  const handleJoinGame = async () => {
    if (!playerName || !gameId) return;
    await joinGame(gameId, playerName);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {view === "main" && (
          <>
            <h1 className="text-4xl font-bold text-center mb-8">Guess Who?</h1>
            <div className="space-y-4">
              <button
                className="btn-primary w-full"
                onClick={() => setView("create")}
              >
                Create Game
              </button>
              <button
                className="btn-secondary w-full"
                onClick={() => setView("join")}
              >
                Join Game
              </button>
            </div>
          </>
        )}

        {view === "create" && (
          <>
            <h2 className="text-2xl font-bold mb-6">Create New Game</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="input w-full"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
              <button
                className="btn-primary w-full"
                onClick={handleCreateGame}
                disabled={!playerName}
              >
                Create Game
              </button>
              <button
                className="btn-secondary w-full"
                onClick={() => setView("main")}
              >
                Back
              </button>
            </div>
          </>
        )}

        {view === "join" && (
          <>
            <h2 className="text-2xl font-bold mb-6">Join Game</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="input w-full"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Game ID"
                className="input w-full"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
              />
              <button
                className="btn-primary w-full"
                onClick={handleJoinGame}
                disabled={!playerName || !gameId}
              >
                Join Game
              </button>
              <button
                className="btn-secondary w-full"
                onClick={() => setView("main")}
              >
                Back
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default LandingPage;
