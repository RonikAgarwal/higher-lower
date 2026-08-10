import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import './NameEntry.css';

interface NameEntryProps {
  onSubmit: (name: string) => void;
}

export default function NameEntry({ onSubmit }: NameEntryProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input automatically
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed) {
      onSubmit(trimmed.toUpperCase());
    }
  };

  return (
    <div className="screen name-entry">
      <motion.div
        className="name-entry__card"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ 
          type: 'spring', stiffness: 200, damping: 20,
          exit: { type: 'tween', duration: 0.2 }
        }}
      >
        <div className="name-entry__glow" />
        
        <h2 className="name-entry__title">ENTER YOUR NAME</h2>
        <p className="name-entry__subtitle">To claim your spot on the leaderboard</p>
        
        <div className="name-entry__form">
          <input
            ref={inputRef}
            type="text"
            className="name-entry__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="PLAYER 1"
            maxLength={12}
            autoComplete="off"
            spellCheck="false"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          
          <motion.button
            className="btn btn-primary name-entry__submit"
            disabled={!name.trim()}
            onClick={handleSubmit}
            whileHover={name.trim() ? { scale: 1.05 } : {}}
            whileTap={name.trim() ? { scale: 0.95 } : {}}
          >
            CONTINUE
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
