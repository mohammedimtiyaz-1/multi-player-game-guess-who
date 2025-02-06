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
      return `Waiting for players (${totalPlayers}/${minPlayers})`;
    }
    return "Start Game";
  };

  return (
    <motion.div
      className="w-full mt-4 sm:mt-6 flex justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={onStart}
        disabled={disabled}
        className={`
          flex items-center justify-center space-x-1.5 sm:space-x-2 
          px-4 sm:px-6 py-2 sm:py-3 
          rounded-lg shadow-lg transition-all
          text-sm sm:text-base font-medium text-white
          w-full sm:w-auto min-w-[200px] max-w-[90%] sm:max-w-none
          ${
            disabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90 hover:scale-105"
          }
        `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 sm:h-5 sm:w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
        <span className="whitespace-nowrap">{getMessage()}</span>
      </button>
    </motion.div>
  );
};

export default StartGameButton;
