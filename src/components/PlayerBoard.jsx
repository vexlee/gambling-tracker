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
}) {
  const [baseInput, setBaseInput] = useState(baseAmount > 0 ? String(baseAmount) : '');
  const [baseConfirmed, setBaseConfirmed] = useState(baseAmount > 0);

  // Positive multipliers (win)
  const positiveMultipliers = [1, 2, 3, 5, 10];
  // Negative multipliers (loss)
  const negativeMultipliers = [-1, -2, -3, -5, -10];

  /** Confirm the base amount */
  const handleConfirmBase = () => {
    const val = parseFloat(baseInput);
    if (isNaN(val) || val <= 0) return;
    onSetBase(val);
    setBaseConfirmed(true);
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">闲 Player</h1>
          {roomId && (
            <p className="text-green-300 text-sm mt-0.5">
              Room: <span className="font-mono font-bold">{roomId}</span>
            </p>
          )}
        </div>
        <button
          onClick={onExit}
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
            Set your base amount to start
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              inputMode="decimal"
              value={baseInput}
              onChange={(e) => setBaseInput(e.target.value)}
              placeholder="e.g. 2"
              className="flex-1 bg-green-950/60 border border-green-600/40 rounded-xl px-4 py-3 text-lg text-white placeholder-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-400/50"
            />
            <button
              onClick={handleConfirmBase}
              className="px-6 py-3 bg-green-500 hover:bg-green-400 text-green-950 font-bold rounded-xl transition-colors"
            >
              Set
            </button>
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
                <button
                  key={`pos-${m}`}
                  onClick={() => onAction(m)}
                  className="aspect-square flex items-center justify-center bg-green-600 hover:bg-green-500 active:bg-green-400 rounded-2xl text-lg font-bold transition-colors shadow-lg active:scale-95"
                >
                  x{m}
                </button>
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
                <button
                  key={`neg-${m}`}
                  onClick={() => onAction(m)}
                  className="aspect-square flex items-center justify-center bg-red-700/80 hover:bg-red-600 active:bg-red-500 rounded-2xl text-lg font-bold transition-colors shadow-lg active:scale-95"
                >
                  x{Math.abs(m)}
                </button>
              ))}
            </div>
          </div>

          {/* Undo button */}
          <div className="mt-auto pt-4">
            <button
              onClick={onUndo}
              disabled={lastActionAmount === 0}
              className={`w-full py-4 rounded-2xl text-lg font-bold transition-colors ${lastActionAmount !== 0
                ? 'bg-yellow-500/90 hover:bg-yellow-400 text-yellow-950'
                : 'bg-green-800/40 text-green-600/40 cursor-not-allowed'
                }`}
            >
              Undo
              {lastActionAmount !== 0 && (
                <span className="ml-2 text-sm font-normal opacity-80">
                  ({lastActionAmount > 0 ? '+' : ''}${lastActionAmount.toFixed(2)})
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
