/**
 * BankerBoard.jsx (庄 — Banker View)
 * ====================================
 * Yellow-themed dashboard for the Banker role.
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
import LedDisplay from './LedDisplay';

export default function BankerBoard({
  // Data from useGameSession
  bankerNet,
  players,
  roomId,
  onExit,
  promptPlayerTie,
}) {
  // ---- Timer ----
  const [elapsed, setElapsed] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
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
  const activePlayers = players.filter((p) => p.role === 'player');
  const playerCount = activePlayers.length;

  // Calculate majority rounds
  const roundCounts = activePlayers.map((p) => (p.round_history || []).length);
  let majorityRounds = 0;
  if (roundCounts.length > 0) {
    const counts = {};
    let maxCount = 0;
    for (const rounds of roundCounts) {
      counts[rounds] = (counts[rounds] || 0) + 1;
      if (counts[rounds] > maxCount) {
        maxCount = counts[rounds];
        majorityRounds = rounds;
      } else if (counts[rounds] === maxCount && rounds > majorityRounds) {
        majorityRounds = rounds;
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-800 via-yellow-900 to-yellow-950 text-white flex flex-col">
      {/* ---- Header ---- */}
      <header className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">庄 Banker</h1>
          <p className="text-yellow-300 text-sm mt-0.5">
            Room: <span className="font-mono font-bold text-lg">{roomId}</span>
          </p>
        </div>
        <button
          onClick={() => setShowExitConfirm(true)}
          className="px-4 py-2 bg-yellow-700/60 hover:bg-yellow-600/80 rounded-xl text-sm font-medium transition-colors"
        >
          End Game
        </button>
      </header>

      {/* ---- Timer ---- */}
      <div className="text-center pt-8 pb-2">
        <p className="text-yellow-300/80 text-xs uppercase tracking-widest mb-1">
          Game Duration
        </p>
        <p className="text-4xl font-mono font-bold tabular-nums">
          {formatTime(elapsed)}
        </p>
      </div>

      {/* ---- Banker Net (the big number) ---- */}
      <div className="text-center py-6">
        <p className="text-yellow-300 text-sm uppercase tracking-widest mb-2">
          Your Net (Banker)
        </p>
        <p className={`text-6xl font-extrabold tabular-nums ${netColor}`}>
          {formatNet(bankerNet)}
        </p>
        <p className="text-yellow-400/60 text-xs mt-3 mb-6">
          = −(sum of all player nets)
        </p>

        <p className="text-yellow-300 text-sm uppercase tracking-widest mb-1">
          Majority Rounds
        </p>
        <p className="text-3xl font-bold tabular-nums text-white">
          {majorityRounds}
        </p>
      </div>

      {/* ---- LED Scrolling Display ---- */}
      <div className="px-6 mb-6">
        <LedDisplay role="banker" />
      </div>

      {/* ---- Room Stats ---- */}
      <div className="px-6">
        <div className="bg-yellow-950/50 rounded-2xl p-5 border border-yellow-700/30">
          <div className="flex justify-between items-center mb-4">
            <span className="text-yellow-300/80 text-sm">Active Players</span>
            <span className="text-2xl font-bold">{playerCount}</span>
          </div>

          {/* Player breakdown list */}
          {players.length > 0 && (
            <div className="border-t border-yellow-700/30 pt-4 mt-2">
              <p className="text-yellow-400/60 text-xs uppercase tracking-wider mb-2">
                Player Nets
              </p>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {activePlayers.map((p, idx) => {
                  const pRounds = (p.round_history || []).length;
                  const isBehind = pRounds < majorityRounds;
                  return (
                    <div
                      key={p.uuid}
                      className="flex justify-between items-center py-2 border-b border-yellow-700/20 last:border-0"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-yellow-200 text-sm font-medium truncate max-w-[120px]">
                          {p.name || `Player ${idx + 1}`}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${isBehind ? 'bg-red-900/40 text-red-300 border border-red-700/50' : 'bg-yellow-900/30 text-yellow-500/80'}`}>
                            {pRounds} R
                          </span>
                          {isBehind && (
                            <button
                              onClick={() => promptPlayerTie(p.uuid, majorityRounds - pRounds)}
                              className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                              title={`Prompt player to log ${majorityRounds - pRounds} missing round(s)`}
                            >
                              Off Track
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-mono text-base font-bold ${p.current_net > 0
                            ? 'text-green-400'
                            : p.current_net < 0
                              ? 'text-red-400'
                              : 'text-yellow-200/50'
                            }`}
                        >
                          {formatNet(p.current_net || 0)}
                        </span>
                        {p.base_amount > 0 && (
                          <div className="text-yellow-500/40 text-xs font-mono mt-0.5">
                            B: ${p.base_amount}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {playerCount === 0 && (
            <p className="text-yellow-400/50 text-sm text-center pt-2">
              Waiting for players to join...
            </p>
          )}
        </div>
      </div>

      {/* ---- Share prompt ---- */}
      <div className="mt-auto px-6 py-6 text-center">
        <p className="text-yellow-400/60 text-sm">
          Share room code{' '}
          <span className="font-mono font-bold text-yellow-200">{roomId}</span>{' '}
          with players
        </p>
      </div>

      {/* ---- Exit Confirmation Modal ---- */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-yellow-950 border border-yellow-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">End Game?</h3>
            <p className="text-yellow-200/70 mb-6 font-medium">
              Are you sure you want to end this game? All players will be disconnected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-4 py-3 bg-yellow-900/50 hover:bg-yellow-800/50 text-white rounded-xl font-medium transition-colors border border-yellow-700/30"
              >
                Cancel
              </button>
              <button
                onClick={onExit}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors shadow-lg"
              >
                End Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
