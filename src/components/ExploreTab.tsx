import { useState, useMemo } from 'react';
import { useDictionaryStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Trash2, ArrowDownAZ, ArrowUpAZ, Shuffle } from 'lucide-react';

type SortMode = 'latest' | 'oldest' | 'shuffle';

const SORT_OPTIONS: { mode: SortMode; label: string; Icon: typeof ArrowDownAZ }[] = [
    { mode: 'latest', label: 'New', Icon: ArrowDownAZ },
    { mode: 'oldest', label: 'Old', Icon: ArrowUpAZ },
    { mode: 'shuffle', label: 'Mix', Icon: Shuffle },
];

export function ExploreTab() {
    const words = useDictionaryStore(state => state.words);
    const deleteWord = useDictionaryStore(state => state.deleteWord);
    const [sortMode, setSortMode] = useState<SortMode>('latest');
    const [shuffledIds, setShuffledIds] = useState<string[]>([]);

    const sortedWords = useMemo(() => {
        switch (sortMode) {
            case 'oldest':
                return [...words].sort((a, b) => a.createdAt - b.createdAt);
            case 'shuffle':
                return [...words].sort((a, b) => {
                    const idxA = shuffledIds.indexOf(a.id);
                    const idxB = shuffledIds.indexOf(b.id);
                    if (idxA === -1) return 1;
                    if (idxB === -1) return -1;
                    return idxA - idxB;
                });
            case 'latest':
            default:
                return [...words];
        }
    }, [words, sortMode, shuffledIds]);

    const playAudio = (url: string) => {
        if (url) new Audio(url).play();
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        deleteWord(id);
    };

    const handleSortChange = (mode: SortMode) => {
        if (mode === 'shuffle') {
            setShuffledIds([...words].sort(() => Math.random() - 0.5).map(w => w.id));
        }
        setSortMode(mode);
    };

    if (words.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center h-full">
                <div className="w-20 h-20 border-2 border-ink/15 rounded-2xl flex items-center justify-center mb-6">
                    <span className="font-serif text-4xl text-ink/20 italic">A</span>
                </div>
                <p className="font-serif italic text-xl text-ink">No words yet</p>
                <p className="font-sans text-xs text-ink/40 mt-3 leading-relaxed max-w-[240px]">
                    Highlight any word on a webpage, right-click, and choose <span className="font-semibold text-ink/60">"Save to Dictionary"</span>
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-paper">
            {/* ── Sort Toolbar ── */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-ink/10 shrink-0 bg-paper">
                <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-ink/40 font-semibold">
                    {words.length} {words.length === 1 ? 'word' : 'words'}
                </span>
                <div className="flex items-center bg-ink/[0.04] rounded-lg p-0.5 gap-0.5">
                    {SORT_OPTIONS.map(({ mode, label, Icon }) => (
                        <button
                            key={mode}
                            onClick={() => handleSortChange(mode)}
                            className={`
                                flex items-center gap-1 px-2 py-1 rounded font-sans text-[9px]
                                font-semibold tracking-wider uppercase transition-all duration-200
                                ${sortMode === mode
                                    ? 'bg-ink text-paper shadow-sm'
                                    : 'text-ink/50 hover:text-ink/80 hover:bg-ink/[0.06]'
                                }
                            `}
                        >
                            <Icon size={11} strokeWidth={2.5} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Word List ── */}
            <div className="flex flex-col overflow-y-auto flex-1 pb-20 overflow-x-hidden">
                <AnimatePresence mode="popLayout">
                    {sortedWords.map((wordInfo) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: -4 }}
                            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                            key={wordInfo.id}
                            className="group relative bg-paper hover:bg-paper-dim/60 transition-colors duration-200"
                        >
                            {/* Left accent line on hover */}
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-ink scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

                            <div className="flex items-start gap-4 px-5 py-4 border-b border-ink/10">

                                {/* Word content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-serif text-[26px] font-semibold text-ink tracking-[-0.01em] leading-[1.1] capitalize">
                                        {wordInfo.word}
                                    </h3>

                                    {(wordInfo.phoneticUK || wordInfo.phoneticUS) && (
                                        <div className="flex items-center gap-3 mt-1.5">
                                            {wordInfo.phoneticUK && (
                                                <span className="font-sans text-[10px] text-ink/40">
                                                    <span className="font-semibold tracking-wider uppercase text-ink/30 mr-1">uk</span>
                                                    <span className="font-serif italic text-[11px] text-ink/45">{wordInfo.phoneticUK}</span>
                                                </span>
                                            )}
                                            {wordInfo.phoneticUS && (
                                                <span className="font-sans text-[10px] text-ink/40">
                                                    <span className="font-semibold tracking-wider uppercase text-ink/30 mr-1">us</span>
                                                    <span className="font-serif italic text-[11px] text-ink/45">{wordInfo.phoneticUS}</span>
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <p className="font-sans text-[12px] text-ink/55 leading-[1.6] mt-2 tracking-[0.01em]">
                                        {wordInfo.definition}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1.5 shrink-0 pt-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-200">
                                    {wordInfo.audioUrl && (
                                        <button
                                            onClick={() => playAudio(wordInfo.audioUrl)}
                                            className="w-8 h-8 rounded-lg border border-ink/20 flex items-center justify-center
                                                       text-ink/60 hover:bg-ink hover:text-paper hover:border-ink
                                                       transition-all duration-200 active:scale-90"
                                            aria-label="Play pronunciation"
                                            title="Play pronunciation"
                                        >
                                            <Volume2 size={14} strokeWidth={2} />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => handleDelete(e, wordInfo.id)}
                                        className="w-8 h-8 rounded-lg border border-danger/20 flex items-center justify-center
                                                   text-danger/60 hover:bg-danger hover:text-paper hover:border-danger
                                                   transition-all duration-200 active:scale-90"
                                        aria-label="Delete word"
                                        title="Delete word"
                                    >
                                        <Trash2 size={13} strokeWidth={2} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
