import { motion } from 'framer-motion';
import './Landing.css';

interface LandingProps {
  highScore: number;
  onPlay: () => void;
}

export default function Landing({ highScore, onPlay }: LandingProps) {
  return (
    <div className="screen landing">
      {/* Branding */}
      <motion.div
        className="landing__brand"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <span className="landing__club">CHERRY NETWORK CLUB</span>
        <span className="landing__event">ELYSIAN SPECIAL</span>
      </motion.div>

      {/* Main title */}
      <motion.div
        className="landing__title-block"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.3 }}
      >
        <h1 className="landing__title">
          <span className="landing__title-line landing__title-line--higher">HIGHER</span>
          <span className="landing__title-line landing__title-line--or">OR</span>
          <span className="landing__title-line landing__title-line--lower">LOWER</span>
        </h1>
        <motion.div
          className="landing__title-glow"
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Tagline */}
      <motion.p
        className="landing__tagline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        How good is your gut feeling?
      </motion.p>

      {/* CTA Button */}
      <motion.button
        className="btn landing__cta"
        onClick={onPlay}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="landing__cta-text">PLAY NOW</span>
        <motion.div
          className="landing__cta-glow"
          animate={{
            boxShadow: [
              '0 0 20px rgba(196,30,58,0.3), inset 0 0 20px rgba(196,30,58,0.1)',
              '0 0 40px rgba(196,30,58,0.5), inset 0 0 30px rgba(196,30,58,0.15)',
              '0 0 20px rgba(196,30,58,0.3), inset 0 0 20px rgba(196,30,58,0.1)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.button>

      {/* Prize & info */}
      <motion.div
        className="landing__info"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <span className="landing__prize">WIN PRIZES</span>
        <span className="landing__subtext">"Think fast. Choose wisely."</span>
      </motion.div>

      {/* High score */}
      {highScore > 0 && (
        <motion.div
          className="landing__highscore"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <span className="landing__highscore-label">BEST SCORE</span>
          <span className="landing__highscore-value">{highScore.toLocaleString()}</span>
        </motion.div>
      )}

      {/* Decorative elements */}
      <div className="landing__deco-line landing__deco-line--left" />
      <div className="landing__deco-line landing__deco-line--right" />
    </div>
  );
}
