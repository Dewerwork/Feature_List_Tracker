import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useEffect } from 'react';

interface CelebrationProps {
  show: boolean;
  onComplete: () => void;
}

export function Celebration({ show, onComplete }: CelebrationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      >
        {/* Confetti particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: 0, 
              y: 0, 
              scale: 0,
              rotate: 0
            }}
            animate={{
              x: (Math.random() - 0.5) * 1000,
              y: Math.random() * 1000 - 200,
              scale: [0, 1, 0.5],
              rotate: Math.random() * 720,
            }}
            transition={{
              duration: 2 + Math.random(),
              ease: "easeOut"
            }}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: [
                  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
                  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
                ][Math.floor(Math.random() * 8)]
              }}
            />
          </motion.div>
        ))}

        {/* Center message */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: [0, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 0.6,
            ease: "backOut"
          }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-6 rounded-3xl shadow-2xl flex items-center gap-3"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Sparkles size={32} />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold">Awesome! 🎉</h2>
            <p className="text-sm opacity-90">Feature completed!</p>
          </div>
        </motion.div>

        {/* Sparkle effects */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            initial={{ 
              scale: 0,
              opacity: 1
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [1, 1, 0],
              x: Math.cos((i / 12) * Math.PI * 2) * 200,
              y: Math.sin((i / 12) * Math.PI * 2) * 200,
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.05,
              ease: "easeOut"
            }}
            className="absolute text-4xl"
            style={{
              left: '50%',
              top: '50%',
            }}
          >
            ✨
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
