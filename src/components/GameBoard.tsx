import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Card from "./Card";
import PlayerList from "./PlayerList";
import ShareButton from "./ShareButton";
import StartGameButton from "./StartGameButton";
import { useGameStore } from "../store/gameStore";
import { Player } from "../types/game";

const GameBoard: React.FC = () => {
  const {
    gameState,
    currentPlayer,
    makeGuess,
    startGame,
    restoreGameState,
    joinGame,
  } = useGameStore();
  const [playerName, setPlayerName] = useState("");
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);
  const [showRoundEndDialog, setShowRoundEndDialog] = useState(false);
  const [showWaitingForOrganizerModal, setShowWaitingForOrganizerModal] =
    useState(false);
  const [showFinalLeaderboardModal, setShowFinalLeaderboardModal] =
    useState(false);

  const isCurrentPlayerActive = currentPlayer?.isActive || false;
  const isOrganizer = currentPlayer?.id === gameState.organizer;
  const isGameStarted = gameState.status === "playing";

  // Check localStorage and restore game state on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get("game");

    if (gameId) {
      // We found a stored player, restore the game state
      restoreGameState(gameId)
        .then((success) => {
          setShowJoinPrompt(!success);
        })
        .catch((error) => {
          console.error("Error restoring game state:", error);
          setShowJoinPrompt(true);
        });
    } else {
      setShowJoinPrompt(true);
    }
  }, []); // Only run on mount

  // Listen for browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const gameId = params.get("game");
      if (gameId) {
        restoreGameState(gameId).catch(console.error);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Watch for round end
  useEffect(() => {
    if (gameState.status === "finished") {
      const sortedPlayers = [...gameState.players].sort(
        (a, b) => b.score - a.score
      );
      const leader = sortedPlayers[0];
      const isLastRound = gameState.currentRound > gameState.totalRounds;

      if (isLastRound) {
        // Show final leaderboard for all players
        setShowFinalLeaderboardModal(true);
        toast.success(
          <div>
            <b>Game Over! 🏆</b>
            <br />
            {leader.id === currentPlayer?.id
              ? "Congratulations! You've won the game!"
              : `${leader.name} has won the game!`}
          </div>,
          {
            duration: 5000,
            icon: "🎮",
          }
        );
      } else {
        // Regular round end toast
        toast.success(
          <div>
            <b>Round Complete! 🏆</b>
            <br />
            {leader.id === currentPlayer?.id
              ? "You're in the lead!"
              : `${leader.name} is leading with ${leader.score} points!`}
          </div>,
          {
            duration: 5000,
            icon: "🎮",
          }
        );
        // Show appropriate modal based on player role
        if (isOrganizer) {
          setShowRoundEndDialog(true);
        } else {
          setShowWaitingForOrganizerModal(true);
        }
      }
    } else if (gameState.status === "playing") {
      // Close waiting modal when game starts
      setShowWaitingForOrganizerModal(false);
    }
  }, [
    gameState.status,
    gameState.players,
    currentPlayer?.id,
    isOrganizer,
    gameState.currentRound,
    gameState.totalRounds,
  ]);

  const handleJoinGame = async () => {
    if (!playerName.trim()) return;
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get("game");
    if (gameId) {
      try {
        await joinGame(gameId, playerName);
        setShowJoinPrompt(false);
      } catch (error) {
        console.error("Failed to join game:", error);
        alert(error instanceof Error ? error.message : "Failed to join game");
      }
    }
  };

  const handleCardClick = (player: Player) => {
    if (
      !isGameStarted ||
      !isCurrentPlayerActive ||
      !currentPlayer ||
      player.id === currentPlayer.id ||
      !player.cardNumber ||
      !currentPlayer.cardNumber
    ) {
      return;
    }

    // Only allow clicking unrevealed cards
    if (
      player.cardNumber === gameState.revealedCard ||
      player.cardNumber === 1
    ) {
      return;
    }

    // Check if it's a correct guess (next consecutive number)
    const isCorrectGuess = player.cardNumber === currentPlayer.cardNumber + 1;

    if (isCorrectGuess) {
      const points = gameState.players.length - player.cardNumber + 1;
      toast.success(
        <div>
          <b>Correct guess! 🎯</b>
          <br />
          You earned {points} points!
        </div>,
        {
          duration: 3000,
          icon: "🎉",
        }
      );
      makeGuess(player.cardNumber);
    } else {
      toast.error(
        <div>
          <b>Incorrect guess! 🔄</b>
          <br />
          Swapping cards with {player.name}
        </div>,
        {
          duration: 3000,
          icon: "🔄",
        }
      );
      makeGuess(player.cardNumber);
    }
  };

  const handleStartNewRound = () => {
    toast.success(
      <div>
        <b>Starting new round! 🎮</b>
        <br />
        Get ready to play!
      </div>,
      {
        duration: 3000,
        icon: "🎲",
      }
    );
    setShowRoundEndDialog(false);
    startGame();
  };

  // Show join prompt if not joined yet
  if (showJoinPrompt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold mb-4">Join Game</h2>
          <input
            type="text"
            placeholder="Enter your name"
            className="input w-full mb-4"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleJoinGame()}
          />
          <button
            className="btn-primary w-full"
            onClick={handleJoinGame}
            disabled={!playerName.trim()}
          >
            Join Game
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Toaster
        position="top-center"
        toastOptions={{
          className: "text-sm",
          style: {
            background: "#333",
            color: "#fff",
            padding: "12px 16px",
          },
        }}
      />

      {/* Waiting for Organizer Modal - Shown to non-organizer players */}
      {showWaitingForOrganizerModal && !isOrganizer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                Round {gameState.currentRound - 1} Completed! 🎉
              </h2>
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold">Current Scores:</h3>
                {gameState.players
                  .sort((a, b) => b.score - a.score)
                  .map((player) => (
                    <div
                      key={player.id}
                      className="flex justify-between items-center"
                    >
                      <span
                        className={
                          player.id === currentPlayer?.id
                            ? "font-bold text-primary"
                            : ""
                        }
                      >
                        {player.name}{" "}
                        {player.id === currentPlayer?.id && "(You)"}
                      </span>
                      <span className="font-bold">{player.score} pts</span>
                    </div>
                  ))}
              </div>
              <div className="mt-6 flex items-center justify-center space-x-2">
                <span className="text-gray-600">Waiting for organizer</span>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  🎲
                </motion.span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Round End Dialog - Only shown to organizer */}
      {showRoundEndDialog && isOrganizer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4">
              Round {gameState.currentRound - 1} Completed!
            </h2>
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold">Current Scores:</h3>
              {gameState.players
                .sort((a, b) => b.score - a.score)
                .map((player) => (
                  <div
                    key={player.id}
                    className="flex justify-between items-center"
                  >
                    <span
                      className={
                        player.id === currentPlayer?.id
                          ? "font-bold text-primary"
                          : ""
                      }
                    >
                      {player.name} {player.id === currentPlayer?.id && "(You)"}
                    </span>
                    <span className="font-bold">{player.score} pts</span>
                  </div>
                ))}
            </div>
            <button
              className="btn-primary w-full"
              onClick={handleStartNewRound}
            >
              Start Round {gameState.currentRound}
            </button>
          </motion.div>
        </div>
      )}

      {/* Final Leaderboard Modal */}
      {showFinalLeaderboardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">🎮 Game Over! 🏆</h2>
              <p className="text-gray-600 mb-6">
                Congratulations to all players!
              </p>
              <div className="space-y-6 mb-8">
                {gameState.players
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        index === 0
                          ? "bg-yellow-100 border-2 border-yellow-400"
                          : index === 1
                          ? "bg-gray-100 border-2 border-gray-400"
                          : index === 2
                          ? "bg-orange-100 border-2 border-orange-400"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {index === 0
                            ? "🥇"
                            : index === 1
                            ? "🥈"
                            : index === 2
                            ? "🥉"
                            : `${index + 1}.`}
                        </span>
                        <span
                          className={`font-bold ${
                            player.id === currentPlayer?.id
                              ? "text-primary"
                              : ""
                          }`}
                        >
                          {player.name}
                          {player.id === currentPlayer?.id && " (You)"}
                        </span>
                      </div>
                      <span className="text-xl font-bold">
                        {player.score} pts
                      </span>
                    </div>
                  ))}
              </div>
              <button
                className="btn-primary w-full"
                onClick={() => (window.location.href = "/")}
              >
                Exit Game
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Current Player Name Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">
          Welcome, {currentPlayer?.name || "Player"}!
        </h1>
        {isCurrentPlayerActive && (
          <p className="text-lg text-gray-600 mt-2 animate-pulse">
            🎮 It's your turn to play!
          </p>
        )}
      </div>

      {/* Share Button - Only visible to organizer */}
      {isOrganizer && <ShareButton gameId={gameState.id} />}

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start">
          {/* Game Status */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
            <h1 className="text-lg font-bold mb-2">
              {isGameStarted
                ? `Round ${gameState.currentRound}`
                : "Waiting for players..."}
            </h1>
            <p className="text-gray-600 text">
              {isGameStarted ? (
                isCurrentPlayerActive ? (
                  <span className="animate-pulse font-medium text-primary">
                    It's your turn to guess! 🎯
                  </span>
                ) : (
                  <span>
                    Waiting for{" "}
                    <span className="font-bold text-primary text-xl">
                      {gameState.players.find((p) => p.isActive)?.name}
                    </span>
                    <span className="inline-block ml-2 animate-[spin_2s_linear_infinite]">
                      🎲
                    </span>
                  </span>
                )
              ) : isOrganizer ? (
                gameState.players.length < 3 ? (
                  "Waiting for more players to join..."
                ) : (
                  "Click 'Start Game' to begin"
                )
              ) : (
                "Waiting for the organizer to start the game"
              )}
            </p>
          </div>

        </div>

        {/* Game Area */}
        <div className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {gameState.players.map((player) => (
              <motion.div
                key={player.id}
                className="relative w-full"
                whileHover={
                  isGameStarted &&
                  isCurrentPlayerActive &&
                  player.id !== currentPlayer?.id &&
                  player.cardNumber !== gameState.revealedCard &&
                  player.cardNumber !== 1
                    ? { scale: 1.02 }
                    : {}
                }
              >
                <Card
                  number={player.cardNumber}
                  isRevealed={
                    isGameStarted &&
                    (player.id === currentPlayer?.id ||
                      player.cardNumber === gameState.revealedCard ||
                      player.cardNumber === 1)
                  }
                  isActive={player.isActive}
                  playerName={player.name}
                  isCurrentPlayer={player.id === currentPlayer?.id}
                  onClick={() => handleCardClick(player)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Player List - moved outside the game area */}
        <div className="mt-8">
          <PlayerList
            players={gameState.players}
            currentPlayerId={currentPlayer?.id || null}
            isGameStarted={isGameStarted}
          />
        </div>

        {/* Start Game Button */}
        {isOrganizer && !isGameStarted && (
          <div className="mt-6">
            <StartGameButton
              onStart={startGame}
              disabled={gameState.players.length < 3}
              totalPlayers={gameState.players.length}
              minPlayers={3}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
