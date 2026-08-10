import { motion } from 'framer-motion';
import './VSBadge.css';

interface VSBadgeProps {
  isActive?: boolean;
}

export default function VSBadge({ isActive = false }: VSBadgeProps) {
  return (
    <motion.div
      className={`vs-badge ${isActive ? 'vs-badge--active' : ''}`}
      animate={isActive ? {
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 15px rgba(196,30,58,0.2)',
          '0 0 30px rgba(196,30,58,0.4)',
          '0 0 15px rgba(196,30,58,0.2)',
        ],
      } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="vs-badge__text">
        <span className="vs-badge__v">V</span>
        <span className="vs-badge__s">S</span>
      </span>
      <div className="vs-badge__ring" />
      <div className="vs-badge__ring vs-badge__ring--outer" />
    </motion.div>
  );
}
