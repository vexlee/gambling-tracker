import { forwardRef } from 'react';

const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return hrs > 0
        ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
        : `${pad(mins)}:${pad(secs)}`;
};

const formatNet = (amount) => {
    if (amount === 0) return '$0.00';
    const sign = amount > 0 ? '+' : '';
    return `${sign}$${amount.toFixed(2)}`;
};

const GameSummaryReport = forwardRef(({ bankerNet, players, roomId, elapsed }, ref) => {
    const activePlayers = players.filter((p) => p.role === 'player');
    const playerCount = activePlayers.length;

    const netColor =
        bankerNet > 0
            ? 'text-green-400'
            : bankerNet < 0
                ? 'text-red-400'
                : 'text-white';

    const dateStr = new Date().toLocaleString();

    return (
        <div
            ref={ref}
            // Fixed aspect ratio/width for a clean receipt/report look.
            // We use inline styles for dimension guarantees during html2canvas render.
            className="bg-gradient-to-b from-yellow-900 via-yellow-950 to-black text-white p-10 font-sans"
            style={{ width: '800px', minHeight: '1000px', boxSizing: 'border-box' }}
        >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-yellow-700/50 pb-8 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-yellow-400 tracking-tight flex items-center gap-3">
                        <span>LatteLedger</span>
                        <span className="text-yellow-600 font-light px-2">|</span>
                        <span className="text-white">Game Summary</span>
                    </h1>
                    <p className="text-yellow-500/80 mt-2 text-lg">
                        Room ID: <span className="font-mono font-bold text-yellow-200">{roomId}</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-yellow-600 uppercase tracking-widest text-sm font-bold mb-1">
                        Generated On
                    </p>
                    <p className="text-yellow-200/80 font-mono text-sm">{dateStr}</p>
                </div>
            </div>

            {/* Main Stats */}
            <div className="flex gap-6 mb-12">
                <div className="flex-1 bg-yellow-900/40 border border-yellow-700/30 rounded-2xl p-6 text-center">
                    <p className="text-yellow-500 uppercase tracking-widest text-sm font-bold mb-2">
                        Game Duration
                    </p>
                    <p className="text-4xl font-mono text-white font-bold tabular-nums">
                        {formatTime(elapsed)}
                    </p>
                </div>
                <div className="flex-1 bg-yellow-900/40 border border-yellow-700/30 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(234,179,8,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
                    <p className="text-yellow-500 uppercase tracking-widest text-sm font-bold mb-2">
                        Total Banker Net
                    </p>
                    <p className={`text-5xl font-extrabold tabular-nums ${netColor}`}>
                        {formatNet(bankerNet)}
                    </p>
                </div>
            </div>

            {/* Player Breakdown */}
            <div>
                <div className="flex justify-between items-end mb-4 px-2">
                    <h2 className="text-2xl font-bold text-yellow-500 border-l-4 border-yellow-500 pl-3">
                        Player Performance
                    </h2>
                    <p className="text-yellow-600 font-medium text-sm">
                        Total Players: <span className="text-white font-bold">{playerCount}</span>
                    </p>
                </div>

                <div className="bg-yellow-950/50 rounded-2xl border border-yellow-700/50 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-yellow-900/40 border-b border-yellow-700/50 text-yellow-500 text-sm uppercase tracking-wider">
                                <th className="py-4 px-6 font-semibold">Player Name</th>
                                <th className="py-4 px-6 font-semibold text-center">Rounds</th>
                                <th className="py-4 px-6 font-semibold text-right">Final Net</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-yellow-700/30">
                            {activePlayers.map((p, idx) => {
                                const pRounds = (p.round_history || []).length;
                                const pNet = p.current_net || 0;
                                const isPositive = pNet > 0;
                                const isNegative = pNet < 0;

                                return (
                                    <tr key={p.uuid} className="hover:bg-yellow-900/20 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold text-yellow-50">
                                                    {p.name || `Player ${idx + 1}`}
                                                </span>
                                                {p.base_amount > 0 && (
                                                    <span className="text-xs text-yellow-600 font-mono mt-0.5">
                                                        Base: ${p.base_amount}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center align-middle">
                                            <span className="inline-block bg-yellow-900/60 text-yellow-300 font-mono px-3 py-1 rounded-full text-sm font-bold">
                                                {pRounds}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right align-middle">
                                            <span
                                                className={`text-2xl font-extrabold font-mono tabular-nums ${isPositive
                                                        ? 'text-green-400'
                                                        : isNegative
                                                            ? 'text-red-400'
                                                            : 'text-yellow-500/50'
                                                    }`}
                                            >
                                                {formatNet(pNet)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {activePlayers.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="py-12 text-center text-yellow-600/50 font-medium">
                                        No players found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 text-center border-t border-yellow-700/30 pt-6">
                <p className="text-yellow-600/60 text-sm">
                    Keep track of your games perfectly with <span className="font-bold text-yellow-500/80">LatteLedger</span>.
                </p>
            </div>
        </div>
    );
});

GameSummaryReport.displayName = 'GameSummaryReport';

export default GameSummaryReport;
