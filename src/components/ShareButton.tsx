import React, { useState } from "react";
import { motion } from "framer-motion";

interface ShareButtonProps {
  gameId: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ gameId }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const gameUrl = `${window.location.origin}/multi-player-game-guess-who?game=${gameId}`;

    try {
      await navigator.clipboard.writeText(gameUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Open WhatsApp share if on mobile
      if (window.innerWidth < 768) {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `Join my Guess Who game! ${gameUrl}`
          )}`,
          "_blank"
        );
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <motion.div
      className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={handleShare}
        className="flex items-center space-x-1.5 sm:space-x-2 bg-primary text-white 
          px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg hover:bg-primary/90 
          transition-colors text-sm sm:text-base"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 sm:h-5 sm:w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
        </svg>
        <span>{copied ? "Copied!" : "Share"}</span>
      </button>
    </motion.div>
  );
};

export default ShareButton;
