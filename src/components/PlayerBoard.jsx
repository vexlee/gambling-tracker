/**
 * PlayerBoard.jsx (闲 — Player View)
 * ====================================
 * Green-themed game board for the Player role.
 *
 * Features:
 * - Base amount input (must be set before playing)
 * - 10 fat-finger-friendly multiplier buttons: x1..x10 and -x1..-x10
 * - Current net display (win/loss)
 * - Undo button (reverts last action, max 1 step)
 * - Exit button
 *
 * Works in BOTH single-player and multiplayer modes.
 * The parent passes in the correct action handlers depending on mode.
 */

import { useState } from 'react';
import LedDisplay from './LedDisplay';
import { motion } from 'framer-motion';

export default function PlayerBoard({
  // Current state
  baseAmount,
  currentNet,
  lastActionAmount,
  // Actions — these are either single-player or multiplayer handlers
  onSetBase,
  onAction,
  onUndo,
  onExit,
  // Optional: room info for multiplayer display
  roomId,
  mode, // 'single' | 'multi'
  playerName,
  onSetName,
}) {
  const [baseInput, setBaseInput] = useState(baseAmount > 0 ? String(baseAmount) : '');
  const [baseConfirmed, setBaseConfirmed] = useState(baseAmount > 0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName || '');

  // Round history from local storage
  const [roundHistory, setRoundHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('player_round_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleAction = (m) => {
    onAction(m);
    const amount = m * baseAmount;
    const newRecord = {
      id: Date.now(),
      multiplier: m,
      amount: amount,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    const updatedHistory = [newRecord, ...roundHistory];
    setRoundHistory(updatedHistory);
    localStorage.setItem('player_round_history', JSON.stringify(updatedHistory));
  };

  const handleUndo = () => {
    onUndo();
    if (roundHistory.length > 0) {
      const updatedHistory = roundHistory.slice(1);
      setRoundHistory(updatedHistory);
      localStorage.setItem('player_round_history', JSON.stringify(updatedHistory));
    }
  };

  const handleExit = () => {
    onExit();
    localStorage.removeItem('player_round_history');
    setRoundHistory([]);
  };

  // Positive multipliers (win)
  const positiveMultipliers = [1, 2, 3, 4, 5];
  // Negative multipliers (loss)
  const negativeMultipliers = [-1, -2, -3, -4, -5];

  /** Confirm the base amount */
  const handleConfirmBase = () => {
    const val = parseFloat(baseInput);
    if (isNaN(val) || val <= 0) return;
    onSetBase(val);

    // Also save name if they entered one during initial setup
    if (nameInput.trim() !== playerName) {
      onSetName(nameInput.trim());
    }

    setBaseConfirmed(true);
  };

  /** Save edited name */
  const handleSaveName = () => {
    onSetName(nameInput.trim());
    setIsEditingName(false);
  };

  /** Format net amount with +/- sign and color */
  const formatNet = (amount) => {
    if (amount === 0) return '$0.00';
    const sign = amount > 0 ? '+' : '';
    return `${sign}$${amount.toFixed(2)}`;
  };

  const netColor =
    currentNet > 0
      ? 'text-yellow-300'
      : currentNet < 0
        ? 'text-red-300'
        : 'text-white';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 via-green-900 to-green-950 text-white flex flex-col">
      {/* ---- Header ---- */}
      <header className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div className="flex-1 mr-4">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="bg-green-950/60 border border-green-600/40 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 w-full max-w-[150px]"
                placeholder="Enter name..."
                maxLength={20}
              />
              <button
                onClick={handleSaveName}
                className="p-1.5 bg-green-600 hover:bg-green-500 rounded text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight truncate max-w-[180px]">
                {playerName || '闲 Player'}
              </h1>
              <button
                onClick={() => {
                  setNameInput(playerName || '');
                  setIsEditingName(true);
                }}
                className="text-green-400/60 hover:text-green-300 transition-colors shrink-0"
                title="Edit Name"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
              </button>
            </div>
          )}

          {roomId && (
            <p className="text-green-300 text-sm mt-0.5">
              Room: <span className="font-mono font-bold">{roomId}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => setShowExitConfirm(true)}
          className="px-4 py-2 bg-green-700/60 hover:bg-green-600/80 rounded-xl text-sm font-medium transition-colors"
        >
          Exit
        </button>
      </header>

      {/* ---- Net Display ---- */}
      <div className="text-center py-6">
        <p className="text-green-300 text-sm uppercase tracking-widest mb-1">
          Current Net
        </p>
        <p className={`text-5xl font-extrabold tabular-nums ${netColor}`}>
          {formatNet(currentNet)}
        </p>
        {baseConfirmed && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <p className="text-green-400/70 text-sm font-medium">
              Base: ${baseAmount.toFixed(2)}
            </p>
            <button
              onClick={() => setBaseConfirmed(false)}
              className="p-1.5 bg-green-800/40 hover:bg-green-700/60 rounded-lg text-green-300 transition-colors"
              title="Change Base Amount"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ---- LED Scrolling Display ---- */}
      <div className="px-4 mb-6">
        <LedDisplay role="player" />
      </div>

      {/* ---- Base Amount Setup (shown until confirmed) ---- */}
      {!baseConfirmed && (
        <div className="px-6 pb-6">
          <label className="block text-green-300 text-sm mb-2 font-medium">
            Set your name and base amount to start
          </label>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your Name (Optional)"
              maxLength={20}
              className="w-full bg-green-950/60 border border-green-600/40 rounded-xl px-4 py-3 text-lg text-white placeholder-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-400/50"
            />
            <div className="flex gap-3">
              <input
                type="number"
                inputMode="decimal"
                value={baseInput}
                onChange={(e) => setBaseInput(e.target.value)}
                placeholder="Base Amount (e.g. 2)"
                className="flex-1 bg-green-950/60 border border-green-600/40 rounded-xl px-4 py-3 text-lg text-white placeholder-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-400/50"
              />
              <button
                onClick={handleConfirmBase}
                className="px-6 py-3 bg-green-500 hover:bg-green-400 text-green-950 font-bold rounded-xl transition-colors shrink-0"
              >
                Set
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Action Buttons (shown after base is set) ---- */}
      {baseConfirmed && (
        <div className="flex-1 px-4 pb-4 flex flex-col gap-4">
          {/* Win buttons (positive) */}
          <div>
            <p className="text-green-400/80 text-xs uppercase tracking-wider mb-2 px-1">
              Win (+)
            </p>
            <div className="grid grid-cols-5 gap-2">
              {positiveMultipliers.map((m) => (
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  key={`pos-${m}`}
                  onClick={() => handleAction(m)}
                  className="aspect-square flex items-center justify-center bg-green-600 hover:bg-green-500 active:bg-green-400 rounded-2xl text-lg font-bold transition-colors shadow-lg"
                >
                  x{m}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Loss buttons (negative) */}
          <div>
            <p className="text-red-400/80 text-xs uppercase tracking-wider mb-2 px-1">
              Loss (-)
            </p>
            <div className="grid grid-cols-5 gap-2">
              {negativeMultipliers.map((m) => (
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  key={`neg-${m}`}
                  onClick={() => handleAction(m)}
                  className="aspect-square flex items-center justify-center bg-red-700/80 hover:bg-red-600 active:bg-red-500 rounded-2xl text-lg font-bold transition-colors shadow-lg"
                >
                  x{Math.abs(m)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Round History */}
          {roundHistory.length > 0 && (
            <div className="mt-2 bg-green-950/50 rounded-2xl p-4 border border-green-700/30 flex-1 min-h-[120px] max-h-[200px] flex flex-col">
              <div className="flex justify-between items-center mb-3 shrink-0">
                <h3 className="text-green-300/80 text-sm font-bold uppercase tracking-wider">Round History</h3>
                <span className="text-xs text-green-500/50 font-medium">{roundHistory.length} rounds</span>
              </div>
              <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {roundHistory.map((record) => (
                  <div key={record.id} className="flex justify-between items-center text-sm py-1.5 border-b border-green-800/30 last:border-0">
                    <span className="text-green-500/60 font-mono text-xs">{record.time}</span>
                    <span className="font-medium text-white/90">
                      x{Math.abs(record.multiplier)} {record.multiplier > 0 ? '(Win)' : '(Loss)'}
                    </span>
                    <span className={`font-bold tabular-nums ${record.amount > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {record.amount > 0 ? '+' : ''}${record.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Undo button */}
          <div className="mt-auto pt-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleUndo}
              disabled={lastActionAmount === 0}
              className={`w-full py-4 rounded-2xl text-lg font-bold transition-colors ${lastActionAmount !== 0
                ? 'bg-yellow-500/90 hover:bg-yellow-400 text-yellow-950 shadow-lg'
                : 'bg-green-800/40 text-green-600/40 cursor-not-allowed'
                }`}
            >
              Undo
              {lastActionAmount !== 0 && (
                <span className="ml-2 text-sm font-normal opacity-80">
                  ({lastActionAmount > 0 ? '+' : ''}${lastActionAmount.toFixed(2)})
                </span>
              )}
            </motion.button>
          </div>
        </div>
      )}

      {/* ---- Exit Confirmation Modal ---- */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-green-950 border border-green-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Exit Game?</h3>
            <p className="text-green-200/70 mb-6 font-medium">
              Are you sure you want to leave the game? Your current net will be lost unless you rejoin.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-4 py-3 bg-green-900/50 hover:bg-green-800/50 text-white rounded-xl font-medium transition-colors border border-green-700/30"
              >
                Cancel
              </button>
              <button
                onClick={handleExit}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors shadow-lg"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
