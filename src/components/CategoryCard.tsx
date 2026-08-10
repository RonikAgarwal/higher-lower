import { motion } from 'framer-motion';
import { Category } from '../data/types';
import './CategoryCard.css';

interface CategoryCardProps {
  category: Category;
  onSelect: (id: string) => void;
  index: number;
}

export default function CategoryCard({ category, onSelect, index }: CategoryCardProps) {
  return (
    <motion.button
      className="category-card"
      onClick={() => onSelect(category.id)}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: index * 0.08,
      }}
      whileHover={{
        scale: 1.06,
        y: -4,
        borderColor: category.color,
        boxShadow: `0 8px 30px rgba(0,0,0,0.5), 0 0 25px ${category.color}33`,
      }}
      whileTap={{ scale: 0.97 }}
      style={{
        '--card-accent': category.color,
      } as React.CSSProperties}
    >
      <div className="category-card__glow" />
      <span className="category-card__icon">{category.icon}</span>
      <span className="category-card__name">{category.name}</span>
      <span className="category-card__desc">{category.description}</span>
      <div className="category-card__halftone" />
    </motion.button>
  );
}
