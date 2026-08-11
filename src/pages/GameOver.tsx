import { motion } from 'framer-motion';
import Leaderboard from '../components/Leaderboard';
import { useLeaderboard } from '../hooks/useLeaderboard';
import './GameOver.css';

interface GameOverProps {
  score: number;
  bestStreak: number;
  highScore: number;
  isNewHighScore: boolean;
  onPlayAgain: () => void;
  onChangeCategory: () => void;
}

export default function GameOver({
  score,
  bestStreak,
  highScore,
  isNewHighScore,
  onPlayAgain,
  onChangeCategory,
}: GameOverProps) {
  const { entries } = useLeaderboard();
  return (
    <div className="screen gameover">
      {/* Game Over title */}
      <motion.h2
        className="gameover__title"
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
      >
        GAME OVER
      </motion.h2>

      {/* New high score celebration */}
      {isNewHighScore && (
        <motion.div
          className="gameover__newhigh"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: [0.5, 1.15, 1] }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="gameover__newhigh-text">🎉 NEW HIGH SCORE!</span>
          <motion.div
            className="gameover__newhigh-glow"
            animate={{
              boxShadow: [
                '0 0 20px rgba(196,30,58,0.2)',
                '0 0 40px rgba(196,30,58,0.4)',
                '0 0 20px rgba(196,30,58,0.2)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      )}

      {/* Score display */}
      <motion.div
        className="gameover__score-block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
      >
        <span className="gameover__score-label">YOUR SCORE</span>
        <motion.span
          className="gameover__score-value"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
        >
          {score.toLocaleString()}
        </motion.span>
      </motion.div>

      {/* Stats row */}
      <motion.div
        className="gameover__stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="gameover__stat">
          <span className="gameover__stat-label">BEST STREAK</span>
          <span className="gameover__stat-value">🔥 {bestStreak}</span>
        </div>
        <div className="gameover__stat-divider" />
        <div className="gameover__stat">
          <span className="gameover__stat-label">HIGH SCORE</span>
          <span className="gameover__stat-value">{highScore.toLocaleString()}</span>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        className="gameover__leaderboard-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Leaderboard entries={entries} highlightScore={score} maxItems={4} />
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className="gameover__actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
      >
        <motion.button
          className="btn btn-primary gameover__play-again"
          onClick={onPlayAgain}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          PLAY AGAIN
        </motion.button>
        <motion.button
          className="btn btn-ghost"
          onClick={onChangeCategory}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          CHANGE CATEGORY
        </motion.button>
      </motion.div>

      {/* Prize nudge */}
      <motion.div
        className="gameover__prize"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="gameover__prize-question">Think you can beat the leaderboard?</span>
        <span className="gameover__prize-cta">WIN PRIZES</span>
      </motion.div>

    </div>
  );
}
