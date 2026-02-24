import { motion, AnimatePresence } from 'motion/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { KanbanColumn } from './KanbanColumn';

interface Feature {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'inProgress' | 'done';
}

interface KanbanBoardProps {
  features: Feature[];
  onEdit: (id: string, title: string, description: string) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: 'todo' | 'inProgress' | 'done') => void;
  onMoveToBacklog: (id: string) => void;
}

export function KanbanBoard({ features, onEdit, onDelete, onUpdateStatus, onMoveToBacklog }: KanbanBoardProps) {
  const todoFeatures = features.filter(f => f.status === 'todo');
  const inProgressFeatures = features.filter(f => f.status === 'inProgress');
  const doneFeatures = features.filter(f => f.status === 'done');

  const handleDrop = (featureId: string, newStatus: 'todo' | 'inProgress' | 'done') => {
    onUpdateStatus(featureId, newStatus);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-950 rounded-2xl p-6 shadow-xl border-2 border-slate-200 dark:border-slate-800">
        <motion.h2
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent"
        >
          🚀 In Progress Features
        </motion.h2>

        {features.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 text-gray-500 dark:text-gray-400"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="text-6xl mb-4"
            >
              🎯
            </motion.div>
            <p className="text-lg">No features in progress yet</p>
            <p className="text-sm mt-2">Move features from the backlog to start working! 💪</p>
          </motion.div>
        )}

        {features.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            <KanbanColumn
              title="To Do"
              status="todo"
              features={todoFeatures}
              onEdit={onEdit}
              onDelete={onDelete}
              onDrop={handleDrop}
              onMoveToBacklog={onMoveToBacklog}
              emoji="📝"
              gradient="from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950"
            />
            <KanbanColumn
              title="In Progress"
              status="inProgress"
              features={inProgressFeatures}
              onEdit={onEdit}
              onDelete={onDelete}
              onDrop={handleDrop}
              onMoveToBacklog={onMoveToBacklog}
              emoji="⚡"
              gradient="from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950"
            />
            <KanbanColumn
              title="Done"
              status="done"
              features={doneFeatures}
              onEdit={onEdit}
              onDelete={onDelete}
              onDrop={handleDrop}
              onMoveToBacklog={onMoveToBacklog}
              emoji="🎉"
              gradient="from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950"
            />
          </div>
        )}
      </div>
    </DndProvider>
  );
}