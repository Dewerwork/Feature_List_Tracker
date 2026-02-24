import { motion } from 'motion/react';
import { Edit2, Trash2, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface Feature {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'inProgress' | 'done';
}

interface FeatureCardProps {
  feature: Feature;
  onEdit: (id: string, title: string, description: string) => void;
  onDelete: (id: string) => void;
  onMoveToKanban?: (id: string) => void;
  onMoveToBacklog?: (id: string) => void;
  isDragging?: boolean;
}

export function FeatureCard({ feature, onEdit, onDelete, onMoveToKanban, onMoveToBacklog, isDragging }: FeatureCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(feature.title);
  const [description, setDescription] = useState(feature.description);

  const handleSave = () => {
    if (title.trim()) {
      onEdit(feature.id, title, description);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTitle(feature.title);
    setDescription(feature.description);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 border-purple-400"
      >
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
          placeholder="Feature description"
          className="mb-3 min-h-[80px]"
        />
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm" className="flex-1">
            Save
          </Button>
          <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1">
            Cancel
          </Button>
        </div>
        
        {/* Show delete and back to backlog buttons in edit mode */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(feature.id)}
            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-1 justify-center py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </motion.button>
          
          {feature.status !== 'backlog' && onMoveToBacklog && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onMoveToBacklog(feature.id)}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex-1 justify-center py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ArrowLeft size={16} />
              <span>Back to Backlog</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ scale: 0, rotate: -10 }}
      animate={{ 
        scale: isDragging ? 1.05 : 1,
        rotate: 0,
        opacity: isDragging ? 0.8 : 1
      }}
      exit={{ scale: 0, rotate: 10, opacity: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 shadow-md hover:shadow-xl border-2 border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing ${
        isDragging ? 'ring-4 ring-purple-400' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex-1">
          {feature.title}
        </h3>
        <motion.button
          whileHover={{ scale: 1.2, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-700 p-1"
        >
          <Edit2 size={16} />
        </motion.button>
      </div>
      
      {feature.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {feature.description}
        </p>
      )}
      
      {feature.status === 'backlog' && onMoveToKanban && (
        <motion.button
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onMoveToKanban(feature.id)}
          className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mt-2"
        >
          <span>Start Working</span>
          <ArrowRight size={16} />
        </motion.button>
      )}
      
      {feature.status === 'done' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 text-green-600 dark:text-green-400 mt-2"
        >
          <CheckCircle2 size={16} />
          <span className="text-sm font-medium">Completed!</span>
        </motion.div>
      )}
    </motion.div>
  );
}