import { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from './hooks/useGame';
import { useSound } from './hooks/useSound';
import { useLeaderboard } from './hooks/useLeaderboard';
import BackgroundEffects from './components/BackgroundEffects';
import Header from './components/Header';
import Countdown from './components/Countdown';
import Landing from './pages/Landing';
import CategorySelect from './pages/CategorySelect';
import NameEntry from './components/NameEntry';
import Game from './pages/Game';
import GameOver from './pages/GameOver';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.35, ease: 'easeOut' as const },
};

export default function App() {
  const game = useGame();
  const sound = useSound();
  const leaderboard = useLeaderboard();

  const handlePlay = useCallback(() => {
    sound.play('click');
    game.goToCategory();
  }, [sound, game]);

  const handleSelectCategory = useCallback((categoryId: string) => {
    sound.play('click');
    game.selectCategory(categoryId);
  }, [sound, game]);

  const handleNameSubmit = useCallback((name: string) => {
    sound.play('click');
    game.setNameAndStart(name);
  }, [sound, game]);

  const handleCountdownComplete = useCallback(() => {
    game.startPlaying();
  }, [game]);

  const handleCountdownTick = useCallback((n: number) => {
    if (n > 0) sound.play('countdown');
    else sound.play('go');
  }, [sound]);


  const handleGameOverTransition = useCallback(() => {
    leaderboard.addEntry({
      name: game.playerName,
      score: game.score,
      streak: game.bestStreak,
      category: game.category,
    });
    game.goToGameOver();
  }, [game, leaderboard]);

  const handlePlayAgain = useCallback(() => {
    sound.play('click');
    game.playAgain();
  }, [sound, game]);

  const handleChangeCategory = useCallback(() => {
    sound.play('click');
    game.goToCategory();
  }, [sound, game]);

  // Show header on game-related screens
  const showHeader = ['playing', 'revealing', 'correct', 'wrong', 'gameOver', 'countdown'].includes(game.phase);
  const showScore = ['playing', 'revealing', 'correct', 'wrong'].includes(game.phase);

  return (
    <>
      <BackgroundEffects />

      {showHeader && (
        <Header
          score={game.score}
          streak={game.streak}
          multiplier={game.multiplier}
          soundEnabled={sound.enabled}
          onToggleSound={sound.toggle}
          showScore={showScore}
          compact={game.phase === 'countdown'}
        />
      )}

      {/* Sound toggle on non-header screens */}
      {!showHeader && (
        <div style={{
          position: 'fixed', top: 12, right: 16, zIndex: 100,
        }}>
          <button
            className="header__sound-btn"
            onClick={sound.toggle}
            aria-label={sound.enabled ? 'Mute sound' : 'Enable sound'}
            style={{
              background: 'none',
              border: '1px solid rgba(240,230,216,0.1)',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: '1rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            {sound.enabled ? '🔊' : '🔇'}
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {game.phase === 'landing' && (
          <motion.div key="landing" {...pageTransition}>
            <Landing highScore={game.highScore} onPlay={handlePlay} leaderboardEntries={leaderboard.entries} />
          </motion.div>
        )}

        {game.phase === 'category' && (
          <motion.div key="category" {...pageTransition}>
            <CategorySelect onSelect={handleSelectCategory} />
          </motion.div>
        )}

        {game.phase === 'nameEntry' && (
          <motion.div key="nameEntry" {...pageTransition}>
            <NameEntry onSubmit={handleNameSubmit} />
          </motion.div>
        )}

        {game.phase === 'countdown' && (
          <motion.div key="countdown" {...pageTransition}>
            <Countdown
              onComplete={handleCountdownComplete}
              onTick={handleCountdownTick}
            />
          </motion.div>
        )}

        {['playing', 'revealing', 'correct', 'wrong'].includes(game.phase) &&
          game.currentItem && game.challengerItem && (
          <motion.div key="game" {...pageTransition}>
            <Game
              currentItem={game.currentItem}
              challengerItem={game.challengerItem}
              streak={game.streak}
              multiplier={game.multiplier}
              lastPoints={game.lastPoints}
              isMilestone={game.isMilestone}
              phase={game.phase}
              onResolveReveal={game.resolveReveal}
              onAdvanceToNext={game.advanceToNext}
              onGameOver={handleGameOverTransition}
              playSound={sound.play as any}
            />
          </motion.div>
        )}

        {game.phase === 'gameOver' && (
          <motion.div key="gameover" {...pageTransition}>
            <GameOver
              score={game.score}
              bestStreak={game.bestStreak}
              highScore={game.highScore}
              isNewHighScore={game.isNewHighScore}
              onPlayAgain={handlePlayAgain}
              onChangeCategory={handleChangeCategory}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
