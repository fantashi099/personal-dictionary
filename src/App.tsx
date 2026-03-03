import { useState, useEffect } from 'react';
import { BookOpen, Gamepad2, Settings } from 'lucide-react';
import { ExploreTab } from './components/ExploreTab';
import { PracticeTab } from './components/PracticeTab';
import { SettingsTab } from './components/SettingsTab';
import { useDictionaryStore } from './lib/store';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState<'explore' | 'practice' | 'settings'>('explore');
  const setUser = useDictionaryStore(state => state.setUser);
  const loadWords = useDictionaryStore(state => state.loadWords);

  useEffect(() => {
    // Listen to Firebase Auth state changes
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
      });
      return () => unsubscribe();
    } else {
      // If no Firebase config, just load local storage words
      loadWords();
    }
  }, [setUser, loadWords]);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden relative selection:bg-blue-100 selection:text-blue-900">

      {/* Header */}
      <header className="bg-white px-5 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-2 text-blue-600">
          <BookOpen size={24} />
          <h1 className="font-extrabold text-xl tracking-tight text-slate-800">My Dictionary</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative bg-slate-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="h-full absolute inset-0"
          >
            {activeTab === 'explore' && <ExploreTab />}
            {activeTab === 'practice' && <PracticeTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-slate-100 flex items-center justify-around pb-4 pt-3 px-2 z-10 shrink-0 absolute bottom-0 w-full shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <button
          onClick={() => setActiveTab('explore')}
          className={clsx(
            "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all flex-1",
            activeTab === 'explore' ? "text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
          )}
        >
          <BookOpen size={22} className={activeTab === 'explore' ? "fill-blue-50" : ""} />
          <span className="text-[10px] tracking-wider uppercase">Explore</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={clsx(
            "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all flex-1",
            activeTab === 'practice' ? "text-orange-500 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
          )}
        >
          <Gamepad2 size={24} className={activeTab === 'practice' ? "fill-orange-50" : ""} />
          <span className="text-[10px] tracking-wider uppercase">Practice</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={clsx(
            "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all flex-1",
            activeTab === 'settings' ? "text-slate-800 font-bold" : "text-slate-400 hover:text-slate-600 font-medium"
          )}
        >
          <Settings size={22} />
          <span className="text-[10px] tracking-wider uppercase">Sync</span>
        </button>
      </nav>

    </div>
  );
}

export default App;
