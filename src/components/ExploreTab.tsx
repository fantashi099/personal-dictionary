import { useState, useMemo } from 'react';
import { useDictionaryStore } from '../lib/store';
import { Volume2, Trash2, ArrowDownAZ, ArrowUpAZ, Shuffle } from 'lucide-react';

type SortMode = 'latest' | 'oldest' | 'shuffle';

const SORT_OPTIONS: { mode: SortMode; label: string; Icon: typeof ArrowDownAZ }[] = [
    { mode: 'latest', label: 'New', Icon: ArrowDownAZ },
    { mode: 'oldest', label: 'Old', Icon: ArrowUpAZ },
    { mode: 'shuffle', label: 'Mix', Icon: Shuffle },
];

export function ExploreTab() {
    const words = useDictionaryStore(state => state.words);
    const loading = useDictionaryStore(state => state.loading);
    const deleteWord = useDictionaryStore(state => state.deleteWord);
    const [sortMode, setSortMode] = useState<SortMode>('latest');
    const [shuffledIds, setShuffledIds] = useState<string[]>([]);
    const searchQuery = useDictionaryStore(state => state.searchQuery);

    const sortedWords = useMemo(() => {
        let filtered = words;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = words.filter(w =>
                w.word.toLowerCase().includes(query) ||
                w.definition.toLowerCase().includes(query)
            );
        }

        switch (sortMode) {
            case 'oldest':
                return [...filtered].sort((a, b) => a.createdAt - b.createdAt);
            case 'shuffle':
                return [...filtered].sort((a, b) => {
                    const idxA = shuffledIds.indexOf(a.id);
                    const idxB = shuffledIds.indexOf(b.id);
                    if (idxA === -1) return 1;
                    if (idxB === -1) return -1;
                    return idxA - idxB;
                });
            case 'latest':
            default:
                return [...filtered];
        }
    }, [words, sortMode, shuffledIds, searchQuery]);

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

    // Show skeleton while loading cached words
    if (loading && words.length === 0) {
        return (
            <div className="flex flex-col h-full bg-paper">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="px-5 py-4 border-b border-ink/10 animate-pulse">
                        <div className="h-7 w-32 bg-ink/10 rounded mb-2" />
                        <div className="h-3 w-20 bg-ink/5 rounded mb-3" />
                        <div className="h-3 w-full bg-ink/5 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (words.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-center h-full">
                <div className="w-20 h-20 border-2 border-ink/15 rounded-2xl flex items-center justify-center mb-6">
                    <span className="font-serif text-4xl text-ink/20 italic">A</span>
                </div>
                <p className="font-serif italic text-xl text-ink">No words yet</p>
                <p className="font-sans text-[13px] text-ink/60 mt-3 leading-relaxed max-w-[240px]">
                    Highlight any word on a webpage, right-click, and choose <span className="font-semibold text-ink">"Save to Dictionary"</span>
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-paper relative">
            {/* ── Toolbar: Sort ── */}
            <div className="flex items-center justify-between px-5 py-3 border-b-2 border-ink shrink-0 bg-paper sticky top-0 z-20">
                <span className="font-sans text-[11px] tracking-[0.15em] uppercase text-ink/60 font-bold whitespace-nowrap">
                    {words.length} {words.length === 1 ? 'word' : 'words'}
                </span>

                <div className="flex items-center gap-2">
                    {/* Sort Options */}
                    <div className="flex items-center bg-ink/[0.04] p-0.5 gap-0.5">
                        {SORT_OPTIONS.map(({ mode, label, Icon }) => (
                            <button
                                key={mode}
                                onClick={() => handleSortChange(mode)}
                                className={`
                                flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-sans text-[10px]
                                font-semibold tracking-wider uppercase transition-all duration-200
                                ${sortMode === mode
                                        ? 'bg-ink text-paper shadow-sm'
                                        : 'text-ink/60 hover:text-ink/90 hover:bg-ink/[0.06]'
                                    }
                            `}
                            >
                                <Icon size={12} strokeWidth={2.5} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Word List ── */}
            <div className="flex flex-col overflow-y-auto flex-1 pb-20 overflow-x-hidden">
                {sortedWords.length === 0 && searchQuery.trim() !== '' && (
                    <div className="flex flex-col items-center justify-center p-10 text-center mt-10">
                        <p className="font-serif italic text-lg text-ink/60">No matching words</p>
                        <p className="font-sans text-[12px] text-ink/40 mt-1">Try a different search term</p>
                    </div>
                )}
                {sortedWords.map((wordInfo, index) => (
                    <div
                        key={wordInfo.id}
                        className="group relative bg-paper hover:bg-paper-dim/60 transition-colors duration-200 animate-slide-up"
                        style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                    >
                        {/* Left accent line on hover */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-ink scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

                        <div className="flex items-start gap-4 px-5 py-4 border-b border-ink/15">

                            {/* Word content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-serif text-[28px] font-semibold text-ink tracking-[-0.01em] leading-[1.1] capitalize">
                                    {wordInfo.word}
                                </h3>

                                {(wordInfo.phoneticUK || wordInfo.phoneticUS) && (
                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2">
                                        {wordInfo.phoneticUK && (
                                            <span className="font-sans text-[11px] flex items-baseline">
                                                <span className="font-medium tracking-wider uppercase text-ink/60 mr-1.5 text-[9px]">UK</span>
                                                <span className="font-sans text-[12px] text-ink/80 tracking-wide">{wordInfo.phoneticUK}</span>
                                            </span>
                                        )}
                                        {wordInfo.phoneticUS && (
                                            <span className="font-sans text-[11px] flex items-baseline">
                                                <span className="font-medium tracking-wider uppercase text-ink/60 mr-1.5 text-[9px]">US</span>
                                                <span className="font-sans text-[12px] text-ink/80 tracking-wide">{wordInfo.phoneticUS}</span>
                                            </span>
                                        )}
                                    </div>
                                )}

                                <p className="font-sans text-[13px] text-ink/80 leading-[1.6] mt-2.5 tracking-[0.01em]">
                                    {wordInfo.definition}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col items-center gap-2 shrink-0 pt-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                                {wordInfo.audioUrl && (
                                    <button
                                        onClick={() => playAudio(wordInfo.audioUrl)}
                                        className="w-9 h-9 rounded-lg border border-ink/30 flex items-center justify-center
                                                   text-ink hover:bg-ink hover:text-paper hover:border-ink
                                                   transition-all duration-200 active:scale-90 bg-paper"
                                        aria-label="Play pronunciation"
                                        title="Play pronunciation"
                                    >
                                        <Volume2 size={16} strokeWidth={2} />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => handleDelete(e, wordInfo.id)}
                                    className="w-9 h-9 rounded-lg border border-danger/30 flex items-center justify-center
                                               text-danger hover:bg-danger hover:text-paper hover:border-danger
                                               transition-all duration-200 active:scale-90 bg-paper"
                                    aria-label="Delete word"
                                    title="Delete word"
                                >
                                    <Trash2 size={15} strokeWidth={2} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
