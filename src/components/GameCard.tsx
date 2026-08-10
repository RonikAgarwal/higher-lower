import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GameItem, Metric } from '../data/types';
import './GameCard.css';

interface GameCardProps {
  item: GameItem;
  metric: Metric | null;
  isHidden?: boolean;
  isRevealing?: boolean;
  revealedValue?: string;
  result?: 'correct' | 'wrong' | null;
  side: 'left' | 'right';
  onRevealComplete?: () => void;
}

const slideVariants = {
  left: {
    initial: { x: -80, opacity: 0, rotateY: -5 },
    animate: { x: 0, opacity: 1, rotateY: 0 },
    exit: { x: -120, opacity: 0, scale: 0.95 },
  },
  right: {
    initial: { x: 80, opacity: 0, rotateY: 5 },
    animate: { x: 0, opacity: 1, rotateY: 0 },
    exit: { x: 120, opacity: 0, scale: 0.95 },
  },
};

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function GameCard({
  item,
  metric,
  isHidden = false,
  isRevealing = false,
  revealedValue,
  result,
  side,
  onRevealComplete,
}: GameCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -4;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 4;
    setTilt({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const variants = slideVariants[side];
  const accentColor = item.color || '#c41e3a';

  return (
    <motion.div
      className={`game-card ${result ? `game-card--${result}` : ''}`}
      ref={cardRef}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 25,
        mass: 0.8,
      }}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Card glow overlay for results */}
      {result === 'correct' && (
        <motion.div
          className="game-card__result-glow game-card__result-glow--correct"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0.15] }}
          transition={{ duration: 0.6 }}
        />
      )}
      {result === 'wrong' && (
        <motion.div
          className="game-card__result-glow game-card__result-glow--wrong"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.2] }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Entity image placeholder (gradient + initials) */}
      <div
        className="game-card__image"
        style={{
          background: `linear-gradient(135deg, ${accentColor}33 0%, ${accentColor}11 50%, var(--bg-card) 100%)`,
        }}
      >
        <span className="game-card__initials" style={{ color: accentColor }}>
          {getInitials(item.name)}
        </span>
        <div className="game-card__image-halftone" />
      </div>

      {/* Content */}
      <div className="game-card__content">
        <h3 className="game-card__name">{item.name}</h3>
        {metric && <span className="game-card__metric">{metric.name}</span>}

        <div className="game-card__value-container">
          {isHidden && !isRevealing ? (
            <motion.span
              className="game-card__value game-card__value--hidden"
              animate={{
                textShadow: [
                  '0 0 8px rgba(196,30,58,0.3)',
                  '0 0 16px rgba(196,30,58,0.5)',
                  '0 0 8px rgba(196,30,58,0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ???
            </motion.span>
          ) : isRevealing ? (
            <motion.span
              className="game-card__value game-card__value--revealing"
              initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: 0.2,
              }}
              onAnimationComplete={onRevealComplete}
            >
              {revealedValue || item.display_value}
            </motion.span>
          ) : (
            <span className="game-card__value">{item.display_value}</span>
          )}
        </div>

        {/* Data Provenance Metadata */}
        <div className="game-card__provenance">
          {item.source.is_estimate && (
            <span className="game-card__badge game-card__badge--estimate">ESTIMATE</span>
          )}
          <span className="game-card__source" title={item.source.name}>
            Data verified {new Date(item.source.verified_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Decorative border glow */}
      <div
        className="game-card__border-glow"
        style={{
          boxShadow: result === 'correct'
            ? '0 0 20px rgba(45,210,132,0.3), inset 0 0 20px rgba(45,210,132,0.1)'
            : result === 'wrong'
            ? '0 0 20px rgba(230,51,85,0.3), inset 0 0 20px rgba(230,51,85,0.1)'
            : 'none',
        }}
      />
    </motion.div>
  );
}
