import { motion } from 'framer-motion';
import logoHorizontal from '../assets/logo-horizontal.png';
import './Header.css';

interface HeaderProps {
  score?: number;
  streak?: number;
  multiplier?: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLogoClick?: () => void;
  showScore?: boolean;
  compact?: boolean;
}

export default function Header({
  score = 0,
  streak = 0,
  multiplier = 1,
  soundEnabled,
  onToggleSound,
  onLogoClick,
  showScore = false,
  compact = false,
}: HeaderProps) {
  return (
    <header className={`header ${compact ? 'header--compact' : ''}`}>
      <div 
        className="header__brand" 
        onClick={onLogoClick} 
        style={{ cursor: onLogoClick ? 'pointer' : 'default' }}
      >
        <img src={logoHorizontal} alt="Cherry Network" className="header__logo-img" />
      </div>

      <div className="header__right">
        {showScore && (
          <div className="header__stats">
            <div className="header__stat">
              <span className="header__stat-label">SCORE</span>
              <motion.span
                key={score}
                className="header__stat-value"
                initial={{ scale: 1.3, color: '#e63355' }}
                animate={{ scale: 1, color: '#f0e6d8' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {score.toLocaleString()}
              </motion.span>
            </div>
            <div className="header__stat header__stat--streak">
              <span className="header__stat-label">STREAK</span>
              <motion.span
                key={streak}
                className="header__stat-value"
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                🔥 {streak}
              </motion.span>
            </div>
            {multiplier > 1 && (
              <motion.div
                className="header__stat header__stat--multiplier"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                <span className="header__multiplier">×{multiplier}</span>
              </motion.div>
            )}
          </div>
        )}
        <button
          className="header__sound-btn"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          title={soundEnabled ? 'Mute' : 'Sound'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>
    </header>
  );
}
