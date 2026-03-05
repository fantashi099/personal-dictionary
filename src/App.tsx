import { useState, useEffect, lazy, Suspense } from 'react';
import { ExploreTab } from './components/ExploreTab';
import { useDictionaryStore } from './lib/store';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import clsx from 'clsx';

// Lazy-load non-default tabs (only loaded when user navigates to them)
const PracticeTab = lazy(() => import('./components/PracticeTab').then(m => ({ default: m.PracticeTab })));
const SettingsTab = lazy(() => import('./components/SettingsTab').then(m => ({ default: m.SettingsTab })));

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
    <div className="flex flex-col h-screen w-full bg-paper overflow-hidden relative selection:bg-black selection:text-white">

      {/* Header */}
      <header className="bg-paper px-5 py-4 flex items-center justify-between border-b border-ink z-10 shrink-0">
        <h1 className="font-serif font-black text-3xl tracking-tighter uppercase text-ink">LEXICON</h1>
      </header>

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
