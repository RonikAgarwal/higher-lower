import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Countdown.css';

interface CountdownProps {
  onComplete: () => void;
  onTick?: (n: number) => void;
}

export default function Countdown({ onComplete, onTick }: CountdownProps) {
  const [count, setCount] = useState(3);
  const [isGo, setIsGo] = useState(false);

  const tick = useCallback(() => {
    onTick?.(count);
  }, [count, onTick]);

  useEffect(() => {
    tick();
  }, [count, tick]);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(prev => prev - 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (!isGo) {
      setIsGo(true);
    } else {
      // count === 0 && isGo === true
      const timer = setTimeout(() => {
        onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [count, isGo, onComplete]);

  return (
    <div className="countdown-overlay">
      <AnimatePresence mode="wait">
        {count > 0 ? (
          <motion.div
            key={count}
            className="countdown__number"
            initial={{ scale: 2.5, opacity: 0, filter: 'blur(8px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 0.3, opacity: 0, filter: 'blur(4px)' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
              duration: 0.5,
            }}
          >
            {count}
          </motion.div>
        ) : isGo ? (
          <motion.div
            key="go"
            className="countdown__go"
            initial={{ scale: 3, opacity: 0, filter: 'blur(12px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 20,
            }}
          >
            GO
            <motion.div
              className="countdown__go-ring"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Pulse rings on each tick */}
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            key={`ring-${count}`}
            className="countdown__ring"
            initial={{ scale: 0.8, opacity: 0.4 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
