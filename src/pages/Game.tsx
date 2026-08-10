import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameItem, Metric } from '../data/types';
import { isAnswerCorrect } from '../utils/helpers';
import GameCard from '../components/GameCard';
import VSBadge from '../components/VSBadge';
import ChoiceButtons from '../components/ChoiceButtons';
import FloatingPoints from '../components/FloatingPoints';
import ResultOverlay from '../components/ResultOverlay';
import './Game.css';

interface GameProps {
  currentItem: GameItem;
  challengerItem: GameItem;
  metric: Metric | null;
  streak: number;
  multiplier: number;
  lastPoints: number;
  isMilestone: boolean;
  phase: string;
  onResolveReveal: (correct: boolean) => void;
  onAdvanceToNext: () => void;
  onGameOver: () => void;
  playSound: (sound: string) => void;
}

type InternalPhase = 'idle' | 'revealing' | 'showResult' | 'transitioning';

export default function Game({
  currentItem,
  challengerItem,
  metric,
  streak,
  lastPoints,
  isMilestone,
  phase,
  onResolveReveal,
  onAdvanceToNext,
  onGameOver,
  playSound,
}: GameProps) {
  const [internalPhase, setInternalPhase] = useState<InternalPhase>('idle');
  const [pendingResult, setPendingResult] = useState<'correct' | 'wrong' | null>(null);
  const [showFloatingPoints, setShowFloatingPoints] = useState(false);
  const [floatKey, setFloatKey] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  const choiceRef = useRef<'higher' | 'lower' | null>(null);

  // Reset internal state when phase changes to 'playing'
  useEffect(() => {
    if (phase === 'playing') {
      setInternalPhase('idle');
      setPendingResult(null);
      setShowFloatingPoints(false);
    }
  }, [phase]);

  const handleChoice = useCallback((choice: 'higher' | 'lower') => {
    if (internalPhase !== 'idle') return;

    choiceRef.current = choice;
    playSound('click');
    setInternalPhase('revealing');

    // Tension pause before reveal
    setTimeout(() => {
      const correct = isAnswerCorrect(currentItem.value, challengerItem.value, choice);
      setPendingResult(correct ? 'correct' : 'wrong');

      // Small delay then show result overlay
      setTimeout(() => {
        setInternalPhase('showResult');
        onResolveReveal(correct);

        if (correct) {
          playSound('correct');
        } else {
          playSound('wrong');
        }
      }, 600);
    }, 400);
  }, [internalPhase, currentItem, challengerItem, onResolveReveal, playSound]);

  const handleResultComplete = useCallback(() => {
    if (pendingResult === 'correct') {
      setShowFloatingPoints(true);
      setFloatKey(prev => prev + 1);
      playSound('scoreUp');

      if (isMilestone) {
        playSound('milestone');
      }

      // Transition to next round
      setInternalPhase('transitioning');
      setTimeout(() => {
        setCardKey(prev => prev + 1);
        onAdvanceToNext();
      }, 300);
    } else {
      playSound('gameOver');
      setTimeout(() => {
        onGameOver();
      }, 400);
    }
  }, [pendingResult, isMilestone, onAdvanceToNext, onGameOver, playSound]);

  const isRevealing = internalPhase === 'revealing' || internalPhase === 'showResult';
  const isDisabled = internalPhase !== 'idle';

  return (
    <div className="screen game-screen">
      {/* Question prompt */}
      <motion.div
        className="game-screen__prompt"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        WHO HAS MORE?
      </motion.div>

      {/* Cards arena */}
      <div className="game-screen__arena">
        <AnimatePresence mode="wait">
          <motion.div
            key={`left-${cardKey}`}
            className="game-board__card-wrapper"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          >
            <GameCard
              item={currentItem}
              metric={metric}
              revealedValue={currentItem.display_value}
              side="left"
            />
          </motion.div>
        </AnimatePresence>

        <VSBadge isRevealing={internalPhase !== 'idle'} />

        <AnimatePresence mode="wait">
          <motion.div
            key={`right-${cardKey}`}
            className="game-board__card-wrapper"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          >
            <GameCard
              item={challengerItem}
              metric={metric}
              isHidden={true}
              isRevealing={internalPhase === 'revealing' || internalPhase === 'showResult'}
              revealedValue={challengerItem.display_value}
              result={internalPhase === 'showResult' ? pendingResult : null}
              side="right"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Choice buttons */}
      <ChoiceButtons onChoice={handleChoice} disabled={isDisabled} />

      {/* Floating points */}
      <div className="game-screen__float-anchor">
        <AnimatePresence>
          {showFloatingPoints && lastPoints > 0 && (
            <FloatingPoints key={floatKey} points={lastPoints} id={floatKey} />
          )}
        </AnimatePresence>
      </div>

      {/* Result overlay */}
      <AnimatePresence>
        {internalPhase === 'showResult' && pendingResult && (
          <ResultOverlay
            type={pendingResult}
            streak={streak}
            isMilestone={isMilestone}
            onComplete={handleResultComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
