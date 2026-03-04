import { useDictionaryStore } from '../lib/store';
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
            <div className="flex flex-col items-center justify-center p-8 text-center h-full text-black">
                <p className="font-serif italic text-xl">No words documented</p>
                <p className="font-sans text-xs uppercase tracking-widest mt-4 text-[#555]">Highlight & save from context menu</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col overflow-y-auto h-full pb-20">
            {words.map((wordInfo, index) => (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={wordInfo.id}
                    className="p-5 border-b border-black flex justify-between items-start hover:bg-white transition-colors"
                >
                    <div className="flex-1 pr-4">
                        <h3 className="font-serif text-3xl font-bold text-black tracking-tight leading-none mb-2 capitalize">
                            {wordInfo.word}
                        </h3>
                        <p className="font-sans text-[11px] uppercase tracking-[0.15em] text-[#555] leading-relaxed">
                            {wordInfo.definition}
                        </p>
                    </div>
                    {wordInfo.audioUrl && (
                        <button
                            onClick={() => playAudio(wordInfo.audioUrl)}
                            className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase border border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors shrink-0"
                            aria-label="Play pronunciation"
                        >
                            Play
                        </button>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
