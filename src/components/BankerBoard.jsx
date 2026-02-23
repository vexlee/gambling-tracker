/**
 * BankerBoard.jsx (庄 — Banker View)
 * ====================================
 * Red-themed dashboard for the Banker role.
 *
 * Features:
 * - Total game duration timer (starts when component mounts)
 * - Total room net amount (banker's net = negative sum of all player nets)
 * - Real-time updates via parent (Supabase subscription lives in the hook)
 * - Player count display
 * - Room code display for sharing
 *
 * The Banker has NO action buttons — they only observe.
 */

import { useState, useEffect, useRef } from 'react';

export default function BankerBoard({
  // Data from useGameSession
  bankerNet,
  players,
  roomId,
  onExit,
}) {
  // ---- Timer ----
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    // Start the game duration timer on mount
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /** Format seconds into HH:MM:SS */
  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return hrs > 0
      ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
      : `${pad(mins)}:${pad(secs)}`;
  };

  /** Format currency with sign */
  const formatNet = (amount) => {
    if (amount === 0) return '$0.00';
    const sign = amount > 0 ? '+' : '';
    return `${sign}$${amount.toFixed(2)}`;
  };

  const netColor =
    bankerNet > 0
      ? 'text-green-300'
      : bankerNet < 0
        ? 'text-red-300'
        : 'text-white';

  // Count active players (non-banker)
  const playerCount = players.filter((p) => p.role === 'player').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-800 via-red-900 to-red-950 text-white flex flex-col">
      {/* ---- Header ---- */}
      <header className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">庄 Banker</h1>
          <p className="text-red-300 text-sm mt-0.5">
            Room: <span className="font-mono font-bold text-lg">{roomId}</span>
          </p>
        </div>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-red-700/60 hover:bg-red-600/80 rounded-xl text-sm font-medium transition-colors"
        >
          End Game
        </button>
      </header>

      {/* ---- Timer ---- */}
      <div className="text-center pt-8 pb-2">
        <p className="text-red-300/80 text-xs uppercase tracking-widest mb-1">
          Game Duration
        </p>
        <p className="text-4xl font-mono font-bold tabular-nums">
          {formatTime(elapsed)}
        </p>
      </div>

      {/* ---- Banker Net (the big number) ---- */}
      <div className="text-center py-10">
        <p className="text-red-300 text-sm uppercase tracking-widest mb-2">
          Your Net (Banker)
        </p>
        <p className={`text-6xl font-extrabold tabular-nums ${netColor}`}>
          {formatNet(bankerNet)}
        </p>
        <p className="text-red-400/60 text-xs mt-3">
          = −(sum of all player nets)
        </p>
      </div>

      {/* ---- Room Stats ---- */}
      <div className="px-6">
        <div className="bg-red-950/50 rounded-2xl p-5 border border-red-700/30">
          <div className="flex justify-between items-center mb-4">
            <span className="text-red-300/80 text-sm">Active Players</span>
            <span className="text-2xl font-bold">{playerCount}</span>
          </div>

          {/* Player breakdown list */}
          {players.length > 0 && (
            <div className="space-y-2 border-t border-red-700/30 pt-4 mt-2">
              <p className="text-red-400/60 text-xs uppercase tracking-wider mb-2">
                Player Nets
              </p>
              {players
                .filter((p) => p.role === 'player')
                .map((p, idx) => (
                  <div
                    key={p.uuid}
                    className="flex justify-between items-center py-1.5"
                  >
                    <span className="text-red-200/70 text-sm">
                      Player {idx + 1}
                    </span>
                    <span
                      className={`font-mono text-sm font-medium ${
                        p.current_net > 0
                          ? 'text-green-400'
                          : p.current_net < 0
                            ? 'text-red-400'
                            : 'text-red-200/50'
                      }`}
                    >
                      {formatNet(p.current_net || 0)}
                    </span>
                  </div>
                ))}
            </div>
          )}

          {playerCount === 0 && (
            <p className="text-red-400/50 text-sm text-center pt-2">
              Waiting for players to join...
            </p>
          )}
        </div>
      </div>

      {/* ---- Share prompt ---- */}
      <div className="mt-auto px-6 py-6 text-center">
        <p className="text-red-400/60 text-sm">
          Share room code{' '}
          <span className="font-mono font-bold text-red-200">{roomId}</span>{' '}
          with players
        </p>
      </div>
    </div>
  );
}
