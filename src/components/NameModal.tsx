import { useState } from "react";
import { motion } from "framer-motion";

interface NameModalProps {
  onSubmit: (name: string) => void;
}

const NameModal: React.FC<NameModalProps> = ({ onSubmit }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Enter Your Name</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-full mb-4"
            placeholder="Your name"
            autoFocus
          />
          <button type="submit" className="btn-primary w-full">
            Join Game
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default NameModal;
