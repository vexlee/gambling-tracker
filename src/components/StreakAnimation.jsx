import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export default function StreakAnimation({ streak, onComplete }) {
    useEffect(() => {
        if (streak) {
            const timer = setTimeout(() => {
                onComplete();
            }, 2500); // Show popup for 2.5s
            return () => clearTimeout(timer);
        }
    }, [streak, onComplete]);

    return (
        <AnimatePresence>
            {streak && (
                <StreakOverlay key={streak.id} streak={streak} />
            )}
        </AnimatePresence>
    );
}

function StreakOverlay({ streak }) {
    const isWin = streak.type === 'win';
    // If it's 3 consecutive it says '3连胜!' etc.
    const text = isWin ? `${streak.count}连胜!` : `${streak.count}连败!`;
    const subtext = isWin ? 'WIN STREAK' : 'LOSS STREAK';

    // Define colors based on win/loss
    const bgGradient = isWin
        ? 'from-yellow-400 via-orange-500 to-red-600'
        : 'from-slate-400 via-slate-600 to-blue-900';

    const shadowColor = isWin ? 'rgba(251, 146, 60, 0.4)' : 'rgba(56, 189, 248, 0.3)';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)', y: -50 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
            <div className="relative flex flex-col items-center justify-center">
                {/* Animated glow background */}
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{
                        rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
                    }}
                    className={`absolute w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-tr ${bgGradient} blur-3xl opacity-40`}
                    style={{ boxShadow: `0 0 100px ${shadowColor}` }}
                />

                {/* Floating particles background effect */}
                {isWin ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div animate={{ y: [-20, 20], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-10 -left-16 text-3xl">✨</motion.div>
                        <motion.div animate={{ y: [20, -20], opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }} className="absolute bottom-0 right-16 text-4xl">🔥</motion.div>
                        <motion.div animate={{ y: [-10, 30], opacity: [0, 1, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} className="absolute top-10 right-20 text-3xl">💰</motion.div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div animate={{ y: [-20, 20], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-10 -left-16 text-3xl">❄️</motion.div>
                        <motion.div animate={{ y: [20, -20], opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }} className="absolute bottom-0 right-16 text-4xl">💀</motion.div>
                        <motion.div animate={{ y: [-10, 30], opacity: [0, 1, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} className="absolute top-10 right-20 text-3xl">📉</motion.div>
                    </div>
                )}

                {/* Main text container */}
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [0.8, 1.05, 1] }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className={`relative z-10 text-center drop-shadow-2xl px-12 py-8 rounded-3xl bg-black/60 backdrop-blur-md border-2 ${isWin ? 'border-yellow-400/50 shadow-[0_0_30px_rgba(250,204,21,0.4)]' : 'border-blue-400/50 shadow-[0_0_30px_rgba(96,165,250,0.4)]'}`}
                >
                    {/* Main heading */}
                    <h2 className={`text-6xl md:text-8xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-b ${isWin ? 'from-amber-200 via-yellow-400 to-orange-500' : 'from-slate-200 via-blue-300 to-indigo-500'} drop-shadow-sm`}>
                        {text}
                    </h2>

                    {/* Subtext */}
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className={`mt-2 text-xl md:text-3xl font-bold tracking-widest uppercase ${isWin ? 'text-yellow-300' : 'text-blue-300'}`}
                    >
                        {subtext}
                    </motion.p>

                </motion.div>
            </div>
        </motion.div>
    );
}
