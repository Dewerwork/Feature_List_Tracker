import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { FeatureCard } from './FeatureCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface Feature {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'inProgress' | 'done';
}

interface BacklogListProps {
  features: Feature[];
  onEdit: (id: string, title: string, description: string) => void;
  onDelete: (id: string) => void;
  onMoveToKanban: (id: string) => void;
  onAdd: (title: string, description: string) => void;
}

export function BacklogList({ features, onEdit, onDelete, onMoveToKanban, onAdd }: BacklogListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    if (title.trim()) {
      onAdd(title, description);
      setTitle('');
      setDescription('');
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950 rounded-2xl p-6 shadow-xl border-2 border-indigo-200 dark:border-indigo-800">
      <div className="flex items-center justify-between mb-6">
        <motion.h2 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          📋 Feature Backlog
        </motion.h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Plus size={16} className="mr-1" />
            Add Feature
          </Button>
        </motion.div>
      </div>

      <AnimatePresence mode="popLayout">
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0, scale: 0.8 }}
            animate={{ height: 'auto', opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 border-purple-400">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Feature title"
                className="mb-2"
                autoFocus
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Feature description (optional)"
                className="mb-3 min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button onClick={handleAdd} size="sm" className="flex-1">
                  Add
                </Button>
                <Button onClick={() => setIsAdding(false)} variant="outline" size="sm" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {features.length === 0 && !isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 text-gray-500 dark:text-gray-400"
          >
            <p className="text-lg">No features in backlog</p>
            <p className="text-sm mt-2">Add your first feature to get started! 🚀</p>
          </motion.div>
        )}

        <div className="space-y-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <FeatureCard
                feature={feature}
                onEdit={onEdit}
                onDelete={onDelete}
                onMoveToKanban={onMoveToKanban}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
