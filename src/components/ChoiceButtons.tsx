import { motion } from 'framer-motion';
import './ChoiceButtons.css';

interface ChoiceButtonsProps {
  onChoice: (choice: 'higher' | 'lower') => void;
  disabled?: boolean;
}

export default function ChoiceButtons({ onChoice, disabled = false }: ChoiceButtonsProps) {
  const handleClick = (choice: 'higher' | 'lower', e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty('--ripple-x', `${x}%`);
    btn.style.setProperty('--ripple-y', `${y}%`);
    onChoice(choice);
  };

  return (
    <div className="choice-buttons">
      <motion.button
        className="btn choice-btn choice-btn--higher"
        onClick={(e) => handleClick('higher', e)}
        disabled={disabled}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        aria-label="Higher"
      >
        <span className="choice-btn__arrow">↑</span>
        <span className="choice-btn__label">HIGHER</span>
      </motion.button>

      <motion.button
        className="btn choice-btn choice-btn--lower"
        onClick={(e) => handleClick('lower', e)}
        disabled={disabled}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        aria-label="Lower"
      >
        <span className="choice-btn__arrow">↓</span>
        <span className="choice-btn__label">LOWER</span>
      </motion.button>
    </div>
  );
}
