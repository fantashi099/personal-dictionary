import { create } from 'zustand';
import { getDb } from './firebase';
import { collection, getDocs, query, orderBy, setDoc, doc, deleteDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export interface WordEntry {
    id: string;
    word: string;
    definition: string;
    audioUrl: string;
    phoneticUK?: string;
    phoneticUS?: string;
    createdAt: number;
}

interface DictionaryState {
    words: WordEntry[];
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    loadWords: () => Promise<void>;
    addWord: (word: WordEntry) => Promise<void>;
    deleteWord: (id: string) => Promise<void>;
}

export const useDictionaryStore = create<DictionaryState>((set, get) => ({
    words: [],
    user: null,
    loading: false,

    setUser: (user) => {
        set({ user });
        if (user) {
            get().loadWords();
        } else {
            // Load from local storage if not logged in
            chrome.storage.local.get("words", (result) => {
                set({ words: (result.words as WordEntry[]) || [] });
            });
        }
    },

    loadWords: async () => {
        set({ loading: true });
        try {
            const user = get().user;
            const db = getDb();
            if (user && db) {
                const q = query(
                    collection(db, `users/${user.uid}/words`),
                    orderBy('createdAt', 'desc')
                );
                const snapshot = await getDocs(q);
                const firestoreWords = snapshot.docs.map(docSnapshot => docSnapshot.data() as WordEntry);

                // Sync local storage -> Firestore (if there are local words not in Firestore)
                chrome.storage.local.get("words", async (result) => {
                    const localWords = (result.words as WordEntry[]) || [];
                    const firestoreWordIds = new Set(firestoreWords.map(w => w.word));

                    let updated = false;
                    for (const lw of localWords) {
                        if (!firestoreWordIds.has(lw.word)) {
                            await setDoc(doc(db, `users/${user.uid}/words`, lw.id), lw);
                            firestoreWords.unshift(lw);
                            updated = true;
                        }
                    }

                    if (updated) {
                        firestoreWords.sort((a, b) => b.createdAt - a.createdAt);
                    }

                    set({ words: firestoreWords, loading: false });
                    chrome.storage.local.set({ words: firestoreWords });
                });
            } else {
                // Just local storage
                chrome.storage.local.get("words", (result) => {
                    set({ words: (result.words as WordEntry[]) || [], loading: false });
                });
            }
        } catch (error) {
            console.error("Failed to load words", error);
            set({ loading: false });
        }
    },

    addWord: async (word: WordEntry) => {
        const user = get().user;

        // 1. Add locally
        const currentWords = get().words;
        if (currentWords.find(w => w.word === word.word)) return;

        const newWords = [word, ...currentWords];
        set({ words: newWords });
        chrome.storage.local.set({ words: newWords });

        // 2. Add to Firestore if logged in
        const db = getDb();
        if (user && db) {
            try {
                await setDoc(doc(db, `users/${user.uid}/words`, word.id), word);
            } catch (error) {
                console.error("Error saving to Firestore:", error);
            }
        }
    },

    deleteWord: async (id: string) => {
        const user = get().user;

        // 1. Remove locally
        const currentWords = get().words;
        const newWords = currentWords.filter(w => w.id !== id);
        set({ words: newWords });
        chrome.storage.local.set({ words: newWords });

        // 2. Remove from Firestore if logged in
        const db = getDb();
        if (user && db) {
            try {
                await deleteDoc(doc(db, `users/${user.uid}/words`, id));
            } catch (error) {
                console.error("Error deleting from Firestore:", error);
            }
        }
    }
}));

// Listen to local storage changes (if background script adds a word)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.words) {
        const newWords = changes.words.newValue as WordEntry[];
        const store = useDictionaryStore.getState();
        // Only update if it's different to prevent loops
        if (newWords && newWords.length !== store.words.length) {
            useDictionaryStore.setState({ words: newWords });

            // If user is logged in, sync new words to Firestore
            const user = store.user;
            const db = getDb();
            if (user && db) {
                store.loadWords();
            }
        }
    }
});
