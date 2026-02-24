import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { BacklogList } from './components/BacklogList';
import { KanbanBoard } from './components/KanbanBoard';
import { Celebration } from './components/Celebration';
import { Rocket } from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'inProgress' | 'done';
}

// Sample data to get started
const initialFeatures: Feature[] = [
  {
    id: '1',
    title: 'User Authentication',
    description: 'Implement login and signup functionality with OAuth support',
    status: 'backlog'
  },
  {
    id: '2',
    title: 'Dashboard Analytics',
    description: 'Create interactive charts and metrics visualization',
    status: 'todo'
  },
  {
    id: '3',
    title: 'Dark Mode Support',
    description: 'Add theme toggling between light and dark modes',
    status: 'inProgress'
  },
  {
    id: '4',
    title: 'Search Functionality',
    description: 'Implement full-text search with filters and sorting',
    status: 'backlog'
  }
];

export default function App() {
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleAddFeature = useCallback((title: string, description: string) => {
    const newFeature: Feature = {
      id: Date.now().toString(),
      title,
      description,
      status: 'backlog'
    };
    setFeatures(prev => [...prev, newFeature]);
  }, []);

  const handleEditFeature = useCallback((id: string, title: string, description: string) => {
    setFeatures(prev => prev.map(f => 
      f.id === id ? { ...f, title, description } : f
    ));
  }, []);

  const handleDeleteFeature = useCallback((id: string) => {
    setFeatures(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleMoveToKanban = useCallback((id: string) => {
    setFeatures(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'todo' as const } : f
    ));
  }, []);

  const handleMoveToBacklog = useCallback((id: string) => {
    setFeatures(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'backlog' as const } : f
    ));
  }, []);

  const handleUpdateStatus = useCallback((id: string, status: 'todo' | 'inProgress' | 'done') => {
    const feature = features.find(f => f.id === id);
    const wasNotDone = feature?.status !== 'done';
    
    setFeatures(prev => prev.map(f => 
      f.id === id ? { ...f, status } : f
    ));

    // Show celebration when moving to done
    if (status === 'done' && wasNotDone) {
      setShowCelebration(true);
    }
  }, [features]);

  const backlogFeatures = features.filter(f => f.status === 'backlog');
  const kanbanFeatures = features.filter(f => f.status !== 'backlog');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50 to-blue-100 dark:from-gray-950 dark:via-purple-950 dark:to-blue-950 p-4 md:p-8">
      <Celebration show={showCelebration} onComplete={() => setShowCelebration(false)} />
      
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-[1800px] mx-auto mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Rocket className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Feature Manager
          </h1>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 dark:text-gray-400 ml-14"
        >
          Manage your features with style! Drag, drop, and celebrate your progress 🎉
        </motion.p>
      </motion.div>

      <div className="max-w-[1800px] mx-auto space-y-6">
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <KanbanBoard
            features={kanbanFeatures}
            onEdit={handleEditFeature}
            onDelete={handleDeleteFeature}
            onUpdateStatus={handleUpdateStatus}
            onMoveToBacklog={handleMoveToBacklog}
          />
        </motion.div>

        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <BacklogList
            features={backlogFeatures}
            onEdit={handleEditFeature}
            onDelete={handleDeleteFeature}
            onMoveToKanban={handleMoveToKanban}
            onAdd={handleAddFeature}
          />
        </motion.div>
      </div>

      {/* Floating particles background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 dark:bg-purple-600 rounded-full opacity-20"
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight
              ],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%'
            }}
          />
        ))}
      </div>
    </div>
  );
}