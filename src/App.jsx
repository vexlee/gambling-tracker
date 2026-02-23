/**
 * App.jsx
 * ========
 * Root component that orchestrates mode selection and renders the
 * appropriate board (PlayerBoard or BankerBoard) based on game state.
 */

import { useState } from 'react';
import { useGameSession } from './hooks/useGameSession';
import PlayerBoard from './components/PlayerBoard';
import BankerBoard from './components/BankerBoard';

export default function App() {
  const game = useGameSession();
  const [joinCode, setJoinCode] = useState('');

  // =========================================================================
  // MODE: Single-player → PlayerBoard
  // =========================================================================
  if (game.mode === 'single') {
    return (
      <PlayerBoard
        mode="single"
        baseAmount={game.singleBase}
        currentNet={game.singleNet}
        lastActionAmount={game.singleLastAction}
        onSetBase={game.setSinglePlayerBase}
        onAction={game.singlePlayerAction}
        onUndo={game.singlePlayerUndo}
        onExit={game.singlePlayerExit}
        roomId={null}
      />
    );
  }

  // =========================================================================
  // MODE: Multiplayer — Player
  // =========================================================================
  if (game.mode === 'multi' && game.role === 'player') {
    return (
      <PlayerBoard
        mode="multi"
        baseAmount={game.baseAmount}
        currentNet={game.currentNet}
        lastActionAmount={game.lastActionAmount}
        onSetBase={game.setPlayerBase}
        onAction={game.playerAction}
        onUndo={game.playerUndo}
        onExit={game.leaveRoom}
        roomId={game.roomId}
      />
    );
  }

  // =========================================================================
  // MODE: Multiplayer — Banker
  // =========================================================================
  if (game.mode === 'multi' && game.role === 'banker') {
    return (
      <BankerBoard
        bankerNet={game.bankerNet}
        players={game.players}
        roomId={game.roomId}
        onExit={game.leaveRoom}
      />
    );
  }

  // =========================================================================
  // HOME SCREEN — Mode Selection
  // =========================================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white flex flex-col items-center justify-center px-6">
      {/* Logo / Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          🎲 Tracker
        </h1>
        <p className="text-gray-400 text-sm">
          Real-time gambling session tracker
        </p>
      </div>

      {/* Mode Cards */}
      <div className="w-full max-w-sm space-y-4">
        {/* Single Player */}
        <button
          onClick={() => game.setMode('single')}
          className="w-full bg-green-800/40 hover:bg-green-700/50 border border-green-600/30 rounded-2xl p-5 text-left transition-colors"
        >
          <p className="text-lg font-bold text-green-300">Single Player</p>
          <p className="text-green-400/60 text-sm mt-1">
            Track wins & losses locally. No account needed.
          </p>
        </button>

        {/* Create Room */}
        <button
          onClick={game.createRoom}
          disabled={game.loading}
          className="w-full bg-yellow-800/40 hover:bg-yellow-700/50 border border-yellow-600/30 rounded-2xl p-5 text-left transition-colors disabled:opacity-50"
        >
          <p className="text-lg font-bold text-yellow-300">Create Room (Banker)</p>
          <p className="text-yellow-400/60 text-sm mt-1">
            Start a multiplayer session. You'll be the Banker.
          </p>
        </button>

        {/* Join Room */}
        <div className="bg-gray-800/40 border border-gray-600/30 rounded-2xl p-5">
          <p className="text-lg font-bold text-gray-300 mb-3">Join Room</p>
          <div className="flex gap-3">
            <input
              type="text"
              inputMode="numeric"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Room code"
              maxLength={6}
              className="flex-1 bg-gray-900/60 border border-gray-600/30 rounded-xl px-4 py-3 text-lg font-mono text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              onClick={() => joinCode.trim() && game.joinRoom(joinCode.trim())}
              disabled={game.loading || !joinCode.trim()}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-bold transition-colors"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {game.error && (
        <div className="mt-6 px-4 py-3 bg-red-900/50 border border-red-500/30 rounded-xl text-red-300 text-sm max-w-sm w-full text-center">
          {game.error}
        </div>
      )}

      {/* Device ID footer */}
      <p className="mt-12 text-gray-600 text-xs font-mono">
        ID: {game.deviceUUID.slice(0, 8)}...
      </p>
    </div>
  );
}
