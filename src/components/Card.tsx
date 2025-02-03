import React from "react";
import { motion } from "framer-motion";
import { CardProps } from "../types/game";

interface ExtendedCardProps extends CardProps {
  playerName: string;
  isCurrentPlayer: boolean;
}

const Card: React.FC<ExtendedCardProps> = ({
  number,
  isRevealed,
  isActive,
  playerName,
  isCurrentPlayer,
  onClick,
}) => {
  const getCardStyle = () => {
    if (isCurrentPlayer) {
      return "bg-purple-600 text-white ring-2 ring-purple-300 hover:bg-purple-700"; // Self card
    }
    if (isRevealed) {
      if (isActive) {
        return "bg-emerald-600 text-white ring-2 ring-emerald-300 hover:bg-emerald-700"; // Active revealed card
      }
      return "bg-emerald-500 text-white ring-2 ring-emerald-200 hover:bg-emerald-600"; // Revealed card
    }
    if (isActive) {
      return "bg-amber-500 text-white ring-2 ring-amber-300 hover:bg-amber-600"; // Active unrevealed card
    }
    return "bg-slate-100 ring-2 ring-slate-200 hover:bg-slate-200"; // Default unrevealed card
  };

  return (
    <div className="relative">
      <div
        className={`card-container h-40 w-28 cursor-pointer ${getCardStyle()} rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col`}
        onClick={onClick}
      >
        {/* Player name at the top of card */}
        <div className="w-full text-center py-2 px-1 border-b border-current/20">
          <span className="text-sm font-medium truncate block">
            {playerName}
            {isCurrentPlayer && " (You)"}
          </span>
        </div>

        {/* Card content */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="card-inner w-full h-full"
            initial={false}
            animate={{ rotateY: isRevealed ? 180 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* Front of card */}
            <div
              className="card-face card-front"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                position: "absolute",
                width: "100%",
                height: "100%",
                transform: "rotateY(0deg)",
              }}
            >
              <div className="flex items-center justify-center h-full">
                <span
                  className={`text-4xl font-bold ${
                    isActive ? "animate-pulse" : ""
                  }`}
                >
                  {isRevealed ? number : number === null ? "?" : "🎴"}
                </span>
              </div>
            </div>

            {/* Back of card */}
            <div
              className="card-face card-back"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                position: "absolute",
                width: "100%",
                height: "100%",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="flex flex-col items-center justify-center h-full space-y-2">
                {number === null ? (
                  <span className="text-sm">Waiting for game to start...</span>
                ) : (
                  <>
                    <span className="text-sm">Your Card</span>
                    <span className="text-4xl font-bold">{number}</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Card;
