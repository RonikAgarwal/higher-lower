import { motion } from 'framer-motion';
import './FloatingPoints.css';

interface FloatingPointsProps {
  points: number;
  id: string | number;
}

export default function FloatingPoints({ points, id }: FloatingPointsProps) {
  return (
    <motion.div
      key={id}
      className="floating-points"
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -70, scale: 0.7 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      +{points}
    </motion.div>
  );
}
