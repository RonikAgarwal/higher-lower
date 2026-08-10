import { motion } from 'framer-motion';
import { LeaderboardEntry } from '../data/types';
import './Leaderboard.css';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  highlightScore?: number;
}

export default function Leaderboard({ entries, highlightScore }: LeaderboardProps) {
  return (
    <div className="leaderboard">
      <h3 className="leaderboard__title">TOP SCORES</h3>
      <div className="leaderboard__list">
        {entries.slice(0, 8).map((entry, i) => {
          const isHighlighted = highlightScore !== undefined && entry.score === highlightScore;
          return (
            <motion.div
              key={`${entry.name}-${entry.timestamp}`}
              className={`leaderboard__row ${isHighlighted ? 'leaderboard__row--highlight' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <span className="leaderboard__rank">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="leaderboard__name">{entry.name}</span>
              <span className="leaderboard__streak">🔥{entry.streak}</span>
              <span className="leaderboard__score">{entry.score.toLocaleString()}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
