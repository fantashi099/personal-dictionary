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
            <div className="flex flex-col items-center justify-center p-8 text-center h-full text-ink">
                <p className="font-serif italic text-xl">No words documented</p>
                <p className="font-sans text-xs uppercase tracking-widest mt-4 opacity-60">Highlight & save from context menu</p>
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
                    className="p-5 border-b border-ink flex justify-between items-start hover:bg-paper-dim transition-colors duration-200 ease-out @container/entry"
                >
                    <div className="flex-1 pr-4">
                        <h3 className="font-serif text-3xl font-bold text-ink tracking-tight leading-none capitalize">
                            {wordInfo.word}
                        </h3>
                        {(wordInfo.phoneticUK || wordInfo.phoneticUS) ? (
                            <div className="flex gap-3 mt-1.5 mb-3">
                                {wordInfo.phoneticUK && <span className="font-sans text-xs text-ink/60 font-medium tracking-wide">UK <span className="text-ink/40 font-serif lowercase italic tracking-normal">{wordInfo.phoneticUK}</span></span>}
                                {wordInfo.phoneticUS && <span className="font-sans text-xs text-ink/60 font-medium tracking-wide">US <span className="text-ink/40 font-serif lowercase italic tracking-normal">{wordInfo.phoneticUS}</span></span>}
                            </div>
                        ) : null}
                        <p className={`font-sans text-tiny uppercase tracking-[0.15em] text-ink/70 leading-relaxed ${!(wordInfo.phoneticUK || wordInfo.phoneticUS) ? 'mt-3' : ''}`}>
                            {wordInfo.definition}
                        </p>
                    </div>
                    {wordInfo.audioUrl && (
                        <button
                            onClick={() => playAudio(wordInfo.audioUrl)}
                            className="font-sans text-micro font-bold tracking-[0.2em] uppercase border border-ink px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors shrink-0"
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
