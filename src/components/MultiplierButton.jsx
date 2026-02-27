import { useState } from 'react';
import { motion } from 'framer-motion';

export default function MultiplierButton({ multiplier, type, onClick }) {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        if (isAnimating) return;
        setIsAnimating(true);

        // Total animation time is 0.7s (0.3s zoom + 0.4s flip)
        setTimeout(() => {
            onClick();
            setIsAnimating(false);
        }, 700);
    };

    const isPositive = type === 'positive';
    const label = isPositive ? `x${multiplier}` : `x${Math.abs(multiplier)}`;

    const frontBgClass = isPositive
        ? 'bg-green-600 hover:bg-green-500 active:bg-green-400'
        : 'bg-red-700/80 hover:bg-red-600 active:bg-red-500';

    return (
        <motion.div
            className="relative aspect-square w-full"
            style={{ perspective: "1000px" }}
            animate={isAnimating ? { zIndex: 50, scale: 1.2 } : { zIndex: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeIn" }}
        >
            <motion.button
                className={`w-full h-full relative outline-none ${isAnimating ? 'cursor-default' : 'cursor-pointer'}`}
                style={{ transformStyle: 'preserve-3d' }}
                onClick={handleClick}
                disabled={isAnimating}
                whileHover={!isAnimating ? { scale: 1.05 } : {}}
                whileTap={!isAnimating ? { scale: 0.95 } : {}}
                animate={isAnimating ? {
                    rotateY: 360,
                    scale: 1.1,
                    z: 30, // translateZ
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                } : {
                    rotateY: 0,
                    scale: 1,
                    z: 0,
                    boxShadow: "0 0px 0px 0px rgba(0, 0, 0, 0)" // reset to let tailwind shadow handle resting state
                }}
                transition={isAnimating ? {
                    rotateY: { delay: 0.3, type: "spring", stiffness: 200, damping: 15, mass: 1 },
                    scale: { duration: 0.3, ease: "easeIn" },
                    z: { duration: 0.3, ease: "easeIn" },
                    boxShadow: { duration: 0.3, ease: "easeIn" }
                } : {
                    duration: 0.2
                }}
            >
                {/* Front Face */}
                <div
                    className={`absolute inset-0 flex items-center justify-center rounded-2xl text-lg font-bold transition-colors shadow-lg ${frontBgClass}`}
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                    {label}
                </div>

                {/* Back Face (Casino Diamond Pattern) */}
                <div
                    className="absolute inset-0 rounded-2xl bg-white border-2 border-red-800 shadow-xl overflow-hidden"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    {/* Diamond Pattern */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                        backgroundImage: `
              linear-gradient(135deg, #b91c1c 25%, transparent 25%),
              linear-gradient(225deg, #b91c1c 25%, transparent 25%),
              linear-gradient(45deg, #b91c1c 25%, transparent 25%),
              linear-gradient(315deg, #b91c1c 25%, #ffffff 25%)
            `,
                        backgroundPosition: `10px 0, 10px 0, 0 0, 0 0`,
                        backgroundSize: `20px 20px`,
                        backgroundRepeat: `repeat`
                    }} />

                    {/* Center Diamond Graphic */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-6 h-6 rotate-45 border-[3px] border-red-800 bg-red-600 shadow-sm flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                    </div>
                </div>
            </motion.button>
        </motion.div>
    );
}
