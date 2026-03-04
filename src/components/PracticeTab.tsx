import { useState, useEffect } from 'react';
import { useDictionaryStore } from '../lib/store';
import type { WordEntry } from '../lib/store';
import { motion } from 'framer-motion';

export function PracticeTab() {
    const words = useDictionaryStore(state => state.words);
    const [currentQuestion, setCurrentQuestion] = useState<WordEntry | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [score, setScore] = useState(0);

    const generateQuestion = () => {
        if (words.length < 4) return;

        // Pick a random word as the correct answer
        const correctTarget = words[Math.floor(Math.random() * words.length)];

        // Pick 3 other random words
        let incorrectOptions = words.filter(w => w.word !== correctTarget.word);

        // Shuffle and pick 3
        incorrectOptions = incorrectOptions.sort(() => 0.5 - Math.random()).slice(0, 3);

        let allOptions = [correctTarget.word, ...incorrectOptions.map(w => w.word)];
        // Shuffle options
        allOptions = allOptions.sort(() => 0.5 - Math.random());

        setCurrentQuestion(correctTarget);
        setOptions(allOptions);
        setSelected(null);
    };

    useEffect(() => {
        generateQuestion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [words]);

    if (words.length < 4) {
        return (
            <div className="p-8 text-center text-black flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 border border-black flex items-center justify-center mb-6">
                    <span className="font-serif text-3xl">{words.length}</span>
                </div>
                <h2 className="text-2xl font-serif italic text-black mb-2">Insufficient Entries</h2>
                <p className="font-sans text-xs uppercase tracking-widest text-[#555]">
                    Requires 4 entries minimum to commence testing.
                </p>
            </div>
        );
    }

    if (!currentQuestion) return null;

    const handleSelect = (option: string) => {
        if (selected) return; // Prevent multiple clicks
        setSelected(option);

        if (option === currentQuestion.word) {
            setScore(s => s + 1);
        } else {
            setScore(0); // Reset streak
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#fafafa]">
            <div className="flex justify-between items-center p-5 border-b border-black shrink-0 bg-white">
                <h2 className="font-serif italic text-lg text-black">Test Knowledge</h2>
                <div className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-black border border-black px-3 py-1">
                    Streak {score}
                </div>
            </div>

            <div className="flex-1 flex flex-col relative overflow-hidden p-6 pb-24">
                <div className="mb-8 border border-black p-6 bg-white min-h-[160px] flex flex-col justify-center shadow-[4px_4px_0_0_#000]">
                    <h3 className="text-[10px] text-[#555] font-bold uppercase tracking-[0.2em] mb-4 border-b border-black pb-2 inline-block self-start">Definition</h3>
                    <p className="font-serif text-2xl text-black leading-snug">
                        {currentQuestion.definition}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-auto z-10">
                    {options.map((opt, i) => {
                        const isSelected = selected === opt;
                        const isCorrect = opt === currentQuestion.word;

                        let btnClass = "bg-white text-black border-black hover:bg-black hover:text-white";

                        if (selected) {
                            if (isCorrect) {
                                btnClass = "bg-green-500 text-black border-black shadow-[4px_4px_0_0_#000]";
                            } else if (isSelected && !isCorrect) {
                                btnClass = "bg-red-500 text-white border-black";
                            } else {
                                btnClass = "bg-[#f5f5f5] text-[#999] border-[#e5e5e5]";
                            }
                        }

                        return (
                            <motion.button
                                key={opt}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                disabled={!!selected}
                                onClick={() => handleSelect(opt)}
                                className={`p-4 text-left font-sans text-sm font-bold tracking-widest uppercase border transition-all ${btnClass}`}
                            >
                                {opt}
                            </motion.button>
                        );
                    })}
                </div>

                {selected && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-6 left-6 right-6 flex justify-center z-20"
                    >
                        <button
                            onClick={generateQuestion}
                            className="bg-black text-white px-8 py-4 font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black border border-black transition-colors w-full flex items-center justify-between"
                        >
                            <span>Next Question</span>
                            <span>→</span>
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
