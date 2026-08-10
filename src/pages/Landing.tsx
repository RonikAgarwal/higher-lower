import { motion } from 'framer-motion';
import { LeaderboardEntry } from '../data/types';
import Leaderboard from '../components/Leaderboard';
import logoSquare from '../assets/logo-square.jpg';
import './Landing.css';

interface LandingProps {
  highScore: number;
  leaderboardEntries: LeaderboardEntry[];
  onPlay: () => void;
}

export default function Landing({ highScore, leaderboardEntries, onPlay }: LandingProps) {
  return (
    <div className="screen landing">
      {/* Branding - Top Left */}
      <motion.div
        className="landing__brand"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <img src={logoSquare} alt="Cherry Network" className="landing__logo" />
        <div className="landing__brand-text">
          <span className="landing__club">CHERRY NETWORK CLUB</span>
          <span className="landing__event">ELYSIAN SPECIAL</span>
        </div>
      </motion.div>

      {/* Social Links - Top Right */}
      <motion.div
        className="landing__socials"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.6, type: 'spring', stiffness: 100 }}
      >
        <motion.a
          href="https://www.instagram.com/cherry.network/"
          target="_blank"
          rel="noopener noreferrer"
          className="landing__social-link"
          whileHover={{ scale: 1.1, textShadow: '0 0 8px rgba(196, 30, 58, 0.6)' }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="landing__social-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </span>
          INSTAGRAM
        </motion.a>
        <motion.a
          href="https://www.cherrynetwork.in"
          target="_blank"
          rel="noopener noreferrer"
          className="landing__social-link"
          whileHover={{ scale: 1.1, textShadow: '0 0 8px rgba(196, 30, 58, 0.6)' }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="landing__social-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          </span>
          WEBSITE
        </motion.a>
      </motion.div>

      {/* Main Content - Centered */}
      <div className="landing__center-content">
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

        {/* Leaderboard */}
        <motion.div
          className="landing__leaderboard-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          {leaderboardEntries.length > 0 ? (
            <Leaderboard entries={leaderboardEntries} />
          ) : (
            <div className="landing__empty-leaderboard">
              Play to see your name here
            </div>
          )}
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="landing__deco-line landing__deco-line--left" />
      <div className="landing__deco-line landing__deco-line--right" />
    </div>
  );
}
