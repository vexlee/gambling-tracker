import { useState } from 'react';

const PLAYER_TEXTS = [
    "杀庄祭旗！ (PEK 9 Banker!)",
    "我还活着！（I'm Still Steady Bom Bi Bi)",
    "庄家变平民。 (Banker becomes a commoner.)",
    "截胡不商量。 (Intercepting without mercy.)",
    "庄家发红包。 (Banker give Ang Bao!)",
    "把你打成闲。 (Beat you into a player.)",
    "你印堂发黑。 (You're Yan Tong Black Black.)",
    "看我收了你。 (Watch me bit you down.)",
    "庄家泪两行。 (Banker in cry cry.)",
    "财神跟我走。 (God of Money follows me.)",
    "换位克死你。 (Change places to curse you.)",
    "庄家钱留下。 (Leave your money here, Banker.)",
    "把你赢到底。 (Winning everything from you.)",
    "庄家变冤家。 (Banker becomes meow meow.)",
    "借钱买米不？ (Need to borrow money?)",
    "庄家在做梦。 (Banker is dreaming.)",
    "你的龙断了。 (Your winning streak is broken.)",
    "庄家洗洗睡。 (BankerGo wash up and sleep)",
    "赢了请吃饭。 (Treating for dinner after winning.)",
    "庄家大散财。 (Banker giving away money.)",
    "功德圆满啦。 (Happy Ending.)"
];

export default function LedDisplay({ role = 'player' }) {
    const texts = role === 'player' ? PLAYER_TEXTS : [
        "庄家通吃！ (Win 9 you ALL!!)",
        "闲家送钱来。 (Take all your money come!)",
        "庄家稳如山。 (Banker steady Bom Bi Bi)",
        "还有谁不服？ (Who else dares to object?)",
        "大家别客气。 (Don't hold back, everyone.)",
        "我就是财神。 (I am God of Money.)",
        "连庄到天亮。 (Winning streak until dawn.)",
        "梭哈我接了！ (Come all-in!)",
        "闲家变路人。 (Players become bystanders.)",
        "庄家不差钱。 (Banker got money.)",
        "你们太嫩了。 (You guys are too green.)",
        "庄家气场强。 (Banker aura Kuat Kuat!)",
        "谁是送财童子？ (Who brings me money?)",
        "庄家也要过年。 (Banker needs to celebrate New Year too.)",
        "闲家全带走！ (Take all money from you guys!)",
        "敢不敢加注？ (Dare to raise the bet?)",
        "庄家不倒翁。 (Banker never falls.)",
        "你们在偷鸡？ (Are you guys bluffing?)",
        "庄家收租啦。 (Banker is collecting rent.)",
        "承让，承让！ (Thanks for yielding!)",
        "只图开心！（I want happy only!)"
    ];
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNextText = () => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
    };

    const colorHex = role === 'banker' ? '#facc15' : '#ff2a2a';
    const dropShadowClass = role === 'banker'
        ? 'drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]'
        : 'drop-shadow-[0_0_8px_rgba(255,42,42,0.8)]';
    const textShadowValue = role === 'banker'
        ? '1px 1px 0px #713f12, -1px -1px 0px #713f12, 1px -1px 0px #713f12, -1px 1px 0px #713f12'
        : '1px 1px 0px #4a0000, -1px -1px 0px #4a0000, 1px -1px 0px #4a0000, -1px 1px 0px #4a0000';

    return (
        <div
            className="w-full bg-black/80 border-2 border-gray-800 rounded-xl overflow-hidden relative shadow-[inset_0_0_15px_rgba(0,0,0,1)] cursor-pointer group"
            onClick={handleNextText}
            title="Click to change text"
        >
            {/* Glossy overlay mimicking glass/plastic */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />

            {/* LED Container */}
            <div className="py-3 px-4 relative flex items-center overflow-hidden h-14">
                {/* Glow effect back layer */}
                <div
                    className="absolute whitespace-nowrap text-xl font-bold tracking-widest opacity-50 blur-[4px] animate-scroll"
                    style={{ color: colorHex }}
                    onAnimationIteration={handleNextText}
                >
                    {texts[currentIndex]}
                </div>

                {/* Main sharp LED text front layer */}
                <div
                    className={`absolute whitespace-nowrap text-xl font-bold tracking-widest animate-scroll ${dropShadowClass}`}
                    style={{ color: colorHex, textShadow: textShadowValue }}
                >
                    {texts[currentIndex]}
                </div>
            </div>

            {/* Hint to click */}
            <div className="absolute bottom-0.5 right-2 text-[8px] text-gray-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity z-20">
                Tap to change
            </div>
        </div>
    );
}
