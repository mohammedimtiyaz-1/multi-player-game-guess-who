import React from "react";
import { motion } from "framer-motion";

interface StartGameButtonProps {
  onStart: () => void;
  disabled: boolean;
  totalPlayers: number;
  minPlayers: number;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({
  onStart,
  disabled,
  totalPlayers,
  minPlayers,
}) => {
  const getMessage = () => {
    if (totalPlayers < minPlayers) {
      return `Waiting for more players... (${totalPlayers}/${minPlayers} players)`;
    }
    return "Start Game";
  };

  return (
    <motion.div
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={onStart}
        disabled={disabled}
        className={`flex items-center space-x-2 px-6 py-3 rounded-lg shadow-lg transition-all
          ${
            disabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90 hover:scale-105"
          } text-white font-medium`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
        <span>{getMessage()}</span>
      </button>
    </motion.div>
  );
};

export default StartGameButton;
