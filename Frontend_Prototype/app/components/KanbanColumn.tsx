import { motion, AnimatePresence } from 'motion/react';
import { useDrag, useDrop } from 'react-dnd';
import { FeatureCard } from './FeatureCard';

interface Feature {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'inProgress' | 'done';
}

interface KanbanColumnProps {
  title: string;
  status: 'todo' | 'inProgress' | 'done';
  features: Feature[];
  onEdit: (id: string, title: string, description: string) => void;
  onDelete: (id: string) => void;
  onDrop: (featureId: string, newStatus: 'todo' | 'inProgress' | 'done') => void;
  onMoveToBacklog: (id: string) => void;
  emoji: string;
  gradient: string;
}

interface DraggableFeatureProps {
  feature: Feature;
  onEdit: (id: string, title: string, description: string) => void;
  onDelete: (id: string) => void;
  onMoveToBacklog: (id: string) => void;
}

function DraggableFeature({ feature, onEdit, onDelete, onMoveToBacklog }: DraggableFeatureProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'FEATURE',
    item: { id: feature.id, status: feature.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag}>
      <FeatureCard
        feature={feature}
        onEdit={onEdit}
        onDelete={onDelete}
        onMoveToBacklog={onMoveToBacklog}
        isDragging={isDragging}
      />
    </div>
  );
}

export function KanbanColumn({ title, status, features, onEdit, onDelete, onDrop, onMoveToBacklog, emoji, gradient }: KanbanColumnProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'FEATURE',
    drop: (item: { id: string; status: string }) => {
      if (item.status !== status) {
        onDrop(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-[280px] transition-all duration-300 ${
        isActive ? 'scale-105' : 'scale-100'
      }`}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 shadow-xl h-full min-h-[500px] border-2 ${
          isActive
            ? 'border-yellow-400 ring-4 ring-yellow-300 dark:ring-yellow-600'
            : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        <motion.div
          animate={isActive ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: isActive ? Infinity : 0, duration: 1 }}
          className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-300 dark:border-gray-600"
        >
          <span className="text-2xl">{emoji}</span>
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
            {title}
          </h3>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            {features.length}
          </motion.span>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {features.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-center p-4"
            >
              <p className="text-sm">
                {isActive ? '✨ Drop here!' : 'Drag features here'}
              </p>
            </motion.div>
          )}

          <div className="space-y-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 10, opacity: 0 }}
                transition={{ 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
              >
                <DraggableFeature
                  feature={feature}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onMoveToBacklog={onMoveToBacklog}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="text-6xl"
            >
              ✨
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}