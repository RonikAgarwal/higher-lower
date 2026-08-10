import { motion, AnimatePresence } from 'framer-motion';
import { getStreakMessage } from '../utils/helpers';
import './ResultOverlay.css';

interface ResultOverlayProps {
  type: 'correct' | 'wrong';
  streak?: number;
  isMilestone?: boolean;
  onComplete: () => void;
}

export default function ResultOverlay({ type, streak = 0, isMilestone = false, onComplete }: ResultOverlayProps) {
  return (
    <AnimatePresence>
      <motion.div
        className={`result-overlay result-overlay--${type}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onAnimationComplete={() => {
          const delay = type === 'correct' ? (isMilestone ? 1200 : 700) : 1400;
          setTimeout(onComplete, delay);
        }}
      >
        {/* Screen flash */}
        <motion.div
          className={`result-overlay__flash result-overlay__flash--${type}`}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Result badge */}
        <motion.div
          className="result-overlay__badge"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.1 }}
        >
          {type === 'correct' ? (
            <>
              <motion.span
                className="result-overlay__icon result-overlay__icon--correct"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                ✓
              </motion.span>
              <span className="result-overlay__text result-overlay__text--correct">CORRECT</span>
            </>
          ) : (
            <>
              <motion.span
                className="result-overlay__icon result-overlay__icon--wrong"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                ✗
              </motion.span>
              <span className="result-overlay__text result-overlay__text--wrong">WRONG</span>
            </>
          )}
        </motion.div>

        {/* Streak milestone */}
        {type === 'correct' && isMilestone && streak > 0 && (
          <motion.div
            className="result-overlay__milestone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          >
            <span className="result-overlay__streak-number">🔥 {streak} STREAK!</span>
            <span className="result-overlay__streak-msg">{getStreakMessage(streak)}</span>
          </motion.div>
        )}

        {/* Particle burst for correct */}
        {type === 'correct' && (
          <div className="result-overlay__particles">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="result-overlay__particle"
                initial={{
                  x: 0, y: 0, scale: 1, opacity: 0.8,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 300,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{ duration: 0.8, delay: 0.1 + Math.random() * 0.15 }}
                style={{
                  width: Math.random() * 6 + 3,
                  height: Math.random() * 6 + 3,
                  background: i % 3 === 0 ? 'var(--cherry-bright)' : i % 3 === 1 ? 'var(--correct)' : 'var(--rose)',
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
