import { useState, useEffect } from 'react';
import { useDictionaryStore } from '../lib/store';
import type { WordEntry } from '../lib/store';

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
            <div className="p-8 text-center text-ink flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 border border-ink flex items-center justify-center mb-6">
                    <span className="font-serif text-3xl">{words.length}</span>
                </div>
                <h2 className="text-2xl font-serif italic text-ink mb-2">Insufficient Entries</h2>
                <p className="font-sans text-xs uppercase tracking-widest opacity-60">
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
        <div className="flex flex-col h-full bg-paper">
            <div className="flex justify-between items-center p-5 border-b border-ink shrink-0 bg-paper-dim">
                <h2 className="font-serif italic text-lg text-ink">Test Knowledge</h2>
                <div className="font-sans text-micro font-bold tracking-[0.2em] uppercase text-ink border border-ink px-3 py-1">
                    Streak {score}
                </div>
            </div>

            <div className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden p-5 pb-24">
                <div className="mb-5 border border-ink p-5 bg-paper-dim min-h-[120px] flex flex-col justify-center shadow-brutal shrink-0">
                    <h3 className="text-micro text-ink/60 font-bold uppercase tracking-[0.2em] mb-4 border-b border-ink/30 pb-2 inline-block self-start">Definition</h3>
                    <p className="font-serif text-xl text-ink leading-snug">
                        {currentQuestion.definition}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 mt-auto z-10 shrink-0">
                    {options.map((opt, i) => {
                        const isSelected = selected === opt;
                        const isCorrect = opt === currentQuestion.word;

                        let btnClass = "bg-paper text-ink border-ink hover:bg-ink hover:text-paper";

                        if (selected) {
                            if (isCorrect) {
                                btnClass = "bg-success text-paper border-ink shadow-brutal";
                            } else if (isSelected && !isCorrect) {
                                btnClass = "bg-danger text-paper border-ink";
                            } else {
                                btnClass = "bg-paper-dim border-ink/20 text-ink/40";
                            }
                        }

                        return (
                            <button
                                key={opt}
                                disabled={!!selected}
                                onClick={() => handleSelect(opt)}
                                className={`p-3 text-left font-sans text-sm font-bold tracking-widest uppercase border transition-all duration-200 ease-out animate-slide-in-left ${btnClass}`}
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>

                {selected && (
                    <div className="absolute bottom-5 left-5 right-5 flex justify-center z-20 animate-slide-up">
                        <button
                            onClick={generateQuestion}
                            className="bg-ink text-paper px-6 py-4 font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-paper hover:text-ink border border-ink transition-colors duration-200 ease-out w-full flex items-center justify-between"
                        >
                            <span>Next Question</span>
                            <span>→</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
