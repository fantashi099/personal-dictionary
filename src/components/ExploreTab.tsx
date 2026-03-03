import { useDictionaryStore } from '../lib/store';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

export function ExploreTab() {
    const words = useDictionaryStore(state => state.words);

    const playAudio = (url: string) => {
        if (url) {
            new Audio(url).play();
        }
    };

    if (words.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full text-slate-500">
                <p>No words saved yet.</p>
                <p className="text-sm mt-2">Highlight a word and right-click to save it to your dictionary!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 p-4 overflow-y-auto h-full pb-24">
            {words.map((wordInfo, index) => (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={wordInfo.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-start"
                >
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-800 capitalize leading-tight">
                            {wordInfo.word}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                            {wordInfo.definition}
                        </p>
                    </div>
                    {wordInfo.audioUrl && (
                        <button
                            onClick={() => playAudio(wordInfo.audioUrl)}
                            className="ml-3 p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shrink-0"
                            aria-label="Play pronunciation"
                        >
                            <Play size={18} fill="currentColor" />
                        </button>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
