import { useState, useEffect } from 'react';
import { useDictionaryStore } from '../lib/store';
import type { WordEntry } from '../lib/store';
import { motion } from 'framer-motion';
import { Trophy, ArrowRight } from 'lucide-react';

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
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                <Trophy size={48} className="text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-700 mb-2">Save More Words</h2>
                <p className="text-sm">You need at least 4 words in your dictionary to play the game.</p>
                <p className="font-semibold mt-2">{words.length} / 4</p>
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
        <div className="p-4 flex flex-col h-full bg-slate-50">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-700">Practice</h2>
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm text-sm font-semibold text-orange-500">
                    <Trophy size={16} /> Streak: {score}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col relative overflow-hidden">
                <h3 className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Definition</h3>
                <p className="text-lg text-slate-800 leading-relaxed font-medium">
                    "{currentQuestion.definition}"
                </p>

                <div className="mt-auto grid grid-cols-2 gap-3 pb-8">
                    {options.map((opt, i) => {
                        const isSelected = selected === opt;
                        const isCorrect = opt === currentQuestion.word;

                        let btnClass = "bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent";

                        if (selected) {
                            if (isCorrect) {
                                btnClass = "bg-green-100 text-green-700 border-green-300 shadow-sm";
                            } else if (isSelected && !isCorrect) {
                                btnClass = "bg-red-100 text-red-700 border-red-300";
                            } else {
                                btnClass = "bg-slate-50 text-slate-400 border-transparent opacity-50";
                            }
                        }

                        return (
                            <motion.button
                                key={opt}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                disabled={!!selected}
                                onClick={() => handleSelect(opt)}
                                className={`p-4 rounded-xl font-bold text-sm border-2 transition-all ${btnClass}`}
                            >
                                {opt}
                            </motion.button>
                        );
                    })}
                </div>

                {selected && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-4 left-0 right-0 flex justify-center"
                    >
                        <button
                            onClick={generateQuestion}
                            className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-blue-700 flex items-center gap-2"
                        >
                            Next Round <ArrowRight size={18} />
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
