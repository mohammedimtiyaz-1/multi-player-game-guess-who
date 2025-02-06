import { useEffect, useState } from "react";
import { useGameStore } from "./store/gameStore";
import LandingPage from "./components/LandingPage";
import GameBoard from "./components/GameBoard";
import NameModal from "./components/NameModal";
import Footer from "./components/Footer";

function App() {
  const { gameState, joinGame } = useGameStore();
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingGameId, setPendingGameId] = useState<string | null>(null);

  useEffect(() => {
    // Check for game ID in URL, accounting for hash routing
    const params = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search);
    const gameId = params.get("game");

    if (gameId && gameState.id === "") {
      setPendingGameId(gameId);
      setShowNameModal(true);
    }
  }, []);

  const handleNameSubmit = async (playerName: string) => {
    if (pendingGameId) {
      await joinGame(pendingGameId, playerName);
      setShowNameModal(false);
      setPendingGameId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {gameState.id ? <GameBoard /> : <LandingPage />}
        {showNameModal && <NameModal onSubmit={handleNameSubmit} />}
      </div>
      <Footer />
    </div>
  );
}

export default App;
