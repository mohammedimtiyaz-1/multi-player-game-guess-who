import React from "react";
import { motion } from "framer-motion";
import { Player } from "../types/game";

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string | null;
  isGameStarted: boolean;
}

const PlayerStatus: React.FC<{ player: Player; isGameStarted: boolean }> = ({
  player,
  isGameStarted,
}) => {
  if (isGameStarted) {
    if (player.isActive) {
      return (
        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
          Active
        </span>
      );
    }
    return (
      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
        Playing
      </span>
    );
  }
};

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentPlayerId,
  isGameStarted,
}) => {
  return (
    <div className="w-64 bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">Players</h2>
      <div className="space-y-2">
        {players.map((player) => (
          <motion.div
            key={player.id}
            className={`p-3 rounded-lg ${
              player.isActive ? "bg-primary text-white" : "bg-gray-100"
            } ${player.id === currentPlayerId ? "ring-2 ring-secondary" : ""}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{player.name}</span>
                <PlayerStatus player={player} isGameStarted={isGameStarted} />
              </div>
              <span className="font-bold">{player.score}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
