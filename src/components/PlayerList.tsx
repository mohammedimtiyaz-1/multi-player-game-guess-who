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
        <span className="text-[10px] sm:text-xs bg-green-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
          Active
        </span>
      );
    }
    return (
      <span className="text-[10px] sm:text-xs bg-blue-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
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
    <div className="w-full bg-white rounded-lg shadow-lg p-3 sm:p-4 mt-4 sm:mt-6">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Players</h2>
      <div className="divide-y divide-gray-100">
        {players.map((player) => (
          <motion.div
            key={player.id}
            className={`flex items-center justify-between py-2 sm:py-3 px-2 sm:px-3 ${
              player.isActive ? "bg-primary text-white" : ""
            } ${player.id === currentPlayerId ? "ring-2 ring-secondary" : ""}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="text-sm sm:text-base font-medium">{player.name}</span>
              <PlayerStatus player={player} isGameStarted={isGameStarted} />
            </div>
            <div className="flex items-center">
              <span className="text-sm sm:text-base font-bold min-w-[3ch] text-right">
                {player.score}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
