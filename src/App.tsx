import { useState, useEffect, lazy, Suspense } from 'react';
import { ExploreTab } from './components/ExploreTab';
import { useDictionaryStore } from './lib/store';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import clsx from 'clsx';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy-load non-default tabs (only loaded when user navigates to them)
const PracticeTab = lazy(() => import('./components/PracticeTab').then(m => ({ default: m.PracticeTab })));
const SettingsTab = lazy(() => import('./components/SettingsTab').then(m => ({ default: m.SettingsTab })));

function App() {
  const [activeTab, setActiveTab] = useState<'explore' | 'practice' | 'settings'>('explore');
  const [showHelp, setShowHelp] = useState(false);
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
    <div className="flex flex-col h-screen w-full bg-paper overflow-hidden relative selection:bg-black selection:text-white">

      {/* Header */}
      <header className="bg-paper px-5 py-4 flex items-center justify-between border-b border-ink z-10 shrink-0">
        <h1 className="font-serif font-black text-3xl tracking-tighter uppercase text-ink">Dictionary</h1>
        <button
          onClick={() => setShowHelp(true)}
          className="text-ink hover:text-ink/60 transition-colors p-1"
          aria-label="Help"
        >
          <HelpCircle size={20} strokeWidth={2.5} />
        </button>
      </header>

      <AnimatePresence>
        {showHelp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
              className="absolute inset-0 bg-ink/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute top-20 left-5 right-5 bg-paper border border-ink shadow-brutal-lg z-50 p-6 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4 pb-2 border-b border-ink/20">
                <h2 className="font-serif text-2xl font-bold text-ink italic">How to Use</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-ink hover:text-danger transition-colors p-1 -mt-1 -mr-1"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
              <ol className="font-sans text-sm text-ink/80 space-y-4 list-decimal pl-4">
                <li className="pl-2"><strong className="font-bold text-ink">Highlight</strong> any word on any webpage you are currently reading.</li>
                <li className="pl-2"><strong className="font-bold text-ink">Right-click</strong> the highlighted word to open the native browser context menu.</li>
                <li className="pl-2">Select <strong className="font-bold text-ink bg-paper-dim border border-ink/20 px-1 py-0.5 whitespace-nowrap">Save to Personal Dictionary</strong>.</li>
              </ol>
              <p className="font-sans text-xs italic text-ink/60 mt-6 pt-4 border-t border-ink/20">
                The definition and audio pronunciation will be automatically retrieved and saved to this extension.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative bg-paper @container">
        <div key={activeTab} className="h-full absolute inset-0 animate-fade-in">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <span className="font-sans text-tiny text-ink/40 uppercase tracking-widest">Loading…</span>
            </div>
          }>
            {activeTab === 'explore' && <ExploreTab />}
            {activeTab === 'practice' && <PracticeTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </Suspense>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-paper border-t border-ink flex items-center justify-around z-10 shrink-0 absolute bottom-0 w-full h-14">
        <button
          onClick={() => setActiveTab('explore')}
          className={clsx(
            "flex items-center justify-center h-full transition-colors duration-200 ease-out flex-1 border-r border-ink last:border-r-0",
            activeTab === 'explore' ? "bg-ink text-paper" : "text-ink hover:bg-paper-dim"
          )}
        >
          <span className="font-sans text-tiny font-bold tracking-[0.2em] uppercase">Words</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={clsx(
            "flex items-center justify-center h-full transition-colors duration-200 ease-out flex-1 border-r border-ink last:border-r-0",
            activeTab === 'practice' ? "bg-ink text-paper" : "text-ink hover:bg-paper-dim"
          )}
        >
          <span className="font-sans text-tiny font-bold tracking-[0.2em] uppercase">Test</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={clsx(
            "flex items-center justify-center h-full transition-colors duration-200 ease-out flex-1",
            activeTab === 'settings' ? "bg-ink text-paper" : "text-ink hover:bg-paper-dim"
          )}
        >
          <span className="font-sans text-tiny font-bold tracking-[0.2em] uppercase">Sync</span>
        </button>
      </nav>

    </div>
  );
}

export default App;
