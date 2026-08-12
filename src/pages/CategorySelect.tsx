import { motion } from 'framer-motion';
import { categories } from '../data';
import CategoryCard from '../components/CategoryCard';
import './CategorySelect.css';

interface CategorySelectProps {
  onSelect: (categoryId: string) => void;
  onBack: () => void;
}

export default function CategorySelect({ onSelect, onBack }: CategorySelectProps) {
  return (
    <div className="screen category-select">
      <button 
        className="back-button"
        onClick={onBack}
        aria-label="Go back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </button>

      <motion.div
        className="category-select__header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="category-select__title">CHOOSE YOUR CATEGORY</h2>
        <p className="category-select__subtitle">Select a topic to test your knowledge</p>
      </motion.div>

      <div className="category-select__grid">
        {categories.map((cat, i) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onSelect={onSelect}
            index={i}
          />
        ))}
      </div>

      <motion.div
        className="category-select__random-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
      >
        <motion.button
          className="btn btn-ghost category-select__random"
          onClick={() => onSelect('mixed')}
          whileHover={{ scale: 1.04, borderColor: 'rgba(196,30,58,0.5)' }}
          whileTap={{ scale: 0.96 }}
        >
          🎲 MIXED — ALL CATEGORIES
        </motion.button>
      </motion.div>

      <motion.p
        className="category-select__trust"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.7 }}
      >
        "TRUST YOUR GUT."
      </motion.p>
    </div>
  );
}
