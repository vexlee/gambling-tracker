import { motion } from 'framer-motion';

export default function GoldenDragon() {
    // Use a majestic transparent animated Chinese golden dragon GIF
    const dragonGifUrl = "https://media.tenor.com/Dhv7SzrKz6MAAAAC/chinese-dragon-dragon.gif";

    return (
        <div className="absolute inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-visible">
            {/* Golden Aura/God-rays background */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: 8, ease: "easeInOut" }}
                className="absolute inset-0 bg-yellow-500/10 mix-blend-screen"
            />

            <motion.div
                initial={{ y: '120vh', opacity: 0 }}
                animate={{
                    y: '-120vh',
                    opacity: [0, 1, 1, 1, 0]
                }}
                transition={{ duration: 8, ease: 'easeOut' }}
                className="absolute z-[100] flex items-center justify-center pointer-events-none drop-shadow-2xl"
                style={{
                    // Intense golden glowing aura
                    filter: 'drop-shadow(0 0 60px rgba(250, 204, 21, 1)) sepia(0.8) hue-rotate(-15deg) saturate(3) brightness(1.2)'
                }}
            >
                <motion.div
                    animate={{
                        x: ['-20vw', '15vw', '-10vw', '20vw', '-5vw', '0vw'],
                        rotate: [-15, 15, -10, 10, -5, 0], // Gentle wiggle, no 90-deg rotation
                    }}
                    transition={{
                        duration: 8,
                        ease: 'easeInOut'
                    }}
                    className="origin-center w-[300px] h-[300px] md:w-[600px] md:h-[600px]"
                >
                    {/* 
            Since the dragon GIF might be facing left or right originally,
            rotate(90deg) flips it upward. scale-x-[-1] handles mirroring if needed.
          */}
                    <img
                        src={dragonGifUrl}
                        alt="Majestic Golden Dragon"
                        className="w-full h-full object-contain"
                    />
                </motion.div>
            </motion.div>
        </div>
    )
}
