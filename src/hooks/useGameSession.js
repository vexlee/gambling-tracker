/**
 * useGameSession.js
 * ==================
 * The core hook powering the gambling tracker.
 *
 * Responsibilities:
 * 1. Device UUID — generate once, persist in localStorage.
 * 2. Single-player mode — all state local, no Supabase.
 * 3. Multiplayer mode — create/join rooms, CRUD on `players` table,
 *    and Supabase Realtime subscription for the Banker view.
 *
 * Exports a single hook: useGameSession()
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

// ---------------------------------------------------------------------------
// Helper: get or create the device UUID
// ---------------------------------------------------------------------------
function getDeviceUUID() {
  let id = localStorage.getItem('device_uuid');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('device_uuid', id);
  }
  return id;
}

// ---------------------------------------------------------------------------
// Helper: generate a random 4-6 digit room code
// ---------------------------------------------------------------------------
function generateRoomCode() {
  // 4-6 digits → random number between 1000 and 999999
  const min = 1000;
  const max = 999999;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

// ---------------------------------------------------------------------------
// The Hook
// ---------------------------------------------------------------------------
export function useGameSession() {
  // ---- Identity ----
  const [deviceUUID] = useState(() => getDeviceUUID());

  // ---- Mode selection: null | 'single' | 'multi' ----
  const [mode, setMode] = useState(null);

  // ---- Single-player state ----
  const [singleBase, setSingleBase] = useState(() => {
    const saved = localStorage.getItem('single_base');
    return saved ? Number(saved) : 0;
  });
  const [singleNet, setSingleNet] = useState(() => {
    const saved = localStorage.getItem('single_net');
    return saved ? Number(saved) : 0;
  });
  const [singleLastAction, setSingleLastAction] = useState(() => {
    const saved = localStorage.getItem('single_last_action');
    return saved ? Number(saved) : 0;
  });

  // ---- Multiplayer state ----
  const [roomId, setRoomId] = useState(null);
  const [role, setRole] = useState(null); // 'banker' | 'player'
  const [baseAmount, setBaseAmount] = useState(0);
  const [currentNet, setCurrentNet] = useState(0);
  const [lastActionAmount, setLastActionAmount] = useState(0);
  const [bankerNet, setBankerNet] = useState(0); // for banker view
  const [players, setPlayers] = useState([]); // full player list for banker
  const [roomStatus, setRoomStatus] = useState(null); // 'active' | 'ended'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ref to hold the realtime subscription so we can unsubscribe later
  const realtimeChannelRef = useRef(null);

  // =========================================================================
  // SINGLE-PLAYER ACTIONS
  // =========================================================================

  /** Persist single-player state to localStorage whenever it changes */
  useEffect(() => {
    if (mode === 'single') {
      localStorage.setItem('single_base', String(singleBase));
      localStorage.setItem('single_net', String(singleNet));
      localStorage.setItem('single_last_action', String(singleLastAction));
    }
  }, [mode, singleBase, singleNet, singleLastAction]);

  /** Set the base amount for single-player */
  const setSinglePlayerBase = useCallback((amount) => {
    setSingleBase(amount);
  }, []);

  /** Apply a multiplier in single-player mode */
  const singlePlayerAction = useCallback(
    (multiplier) => {
      if (singleBase <= 0) return;
      const delta = singleBase * multiplier;
      setSingleNet((prev) => prev + delta);
      setSingleLastAction(delta);
    },
    [singleBase]
  );

  /** Undo last single-player action (max 1 step) */
  const singlePlayerUndo = useCallback(() => {
    if (singleLastAction === 0) return;
    setSingleNet((prev) => prev - singleLastAction);
    setSingleLastAction(0);
  }, [singleLastAction]);

  /** Reset single-player session */
  const singlePlayerExit = useCallback(() => {
    setSingleBase(0);
    setSingleNet(0);
    setSingleLastAction(0);
    localStorage.removeItem('single_base');
    localStorage.removeItem('single_net');
    localStorage.removeItem('single_last_action');
    localStorage.removeItem('auto_join_room');
    setMode(null);
  }, []);

  // =========================================================================
  // MULTIPLAYER: CREATE ROOM
  // =========================================================================
  const createRoom = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const code = generateRoomCode();

      // Insert room row — creator is the banker
      const { error: roomErr } = await supabase
        .from('rooms')
        .insert({ id: code, banker_uuid: deviceUUID, status: 'active' });

      if (roomErr) throw roomErr;

      // Upsert the banker as a player record (handles if they were in a previous room)
      const { error: playerErr } = await supabase.from('players').upsert({
        uuid: deviceUUID,
        room_id: code,
        role: 'banker',
        base_amount: 0,
        current_net: 0,
        last_action_amount: 0,
      });

      if (playerErr) throw playerErr;

      setRoomId(code);
      setRole('banker');
      setRoomStatus('active');
      setMode('multi');
      localStorage.setItem('auto_join_room', code);
    } catch (err) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  }, [deviceUUID]);

  // =========================================================================
  // MULTIPLAYER: JOIN ROOM
  // =========================================================================
  const joinRoom = useCallback(
    async (code) => {
      setLoading(true);
      setError(null);
      try {
        // 1. Check if room exists and is active
        const { data: room, error: roomErr } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', code)
          .single();

        if (roomErr || !room) throw new Error('Room not found');
        if (room.status !== 'active') throw new Error('Room has ended');

        // 2. Check for reconnection — does this UUID already exist in the room?
        const { data: existing } = await supabase
          .from('players')
          .select('*')
          .eq('room_id', code)
          .eq('uuid', deviceUUID)
          .maybeSingle();

        if (existing) {
          // Reconnect — restore state
          setRoomId(code);
          setRole(existing.role);
          setBaseAmount(existing.base_amount || 0);
          setCurrentNet(existing.current_net || 0);
          setLastActionAmount(existing.last_action_amount || 0);
          setRoomStatus(room.status);
          setMode('multi');
          localStorage.setItem('auto_join_room', code);
          return;
        }

        // 3. Check player count (max 15)
        const { count } = await supabase
          .from('players')
          .select('uuid', { count: 'exact', head: true })
          .eq('room_id', code);

        if (count >= 15) throw new Error('Room is full (max 15 players)');

        // 4. Determine role — if banker_uuid matches, they're banker; otherwise player
        const assignedRole = room.banker_uuid === deviceUUID ? 'banker' : 'player';

        // 5. Upsert player (handles if they were in a previous room)
        const { error: insertErr } = await supabase.from('players').upsert({
          uuid: deviceUUID,
          room_id: code,
          role: assignedRole,
          base_amount: 0,
          current_net: 0,
          last_action_amount: 0,
        });

        if (insertErr) throw insertErr;

        setRoomId(code);
        setRole(assignedRole);
        setRoomStatus(room.status);
        setMode('multi');
        localStorage.setItem('auto_join_room', code);
      } catch (err) {
        setError(err.message || 'Failed to join room');
      } finally {
        setLoading(false);
      }
    },
    [deviceUUID]
  );

  // =========================================================================
  // MULTIPLAYER: AUTO-JOIN ON LOAD
  // =========================================================================
  useEffect(() => {
    const savedRoom = localStorage.getItem('auto_join_room');
    if (savedRoom && !mode && !loading && !roomId) {
      joinRoom(savedRoom);
    }
  }, [joinRoom]);

  // =========================================================================
  // MULTIPLAYER: PLAYER ACTIONS
  // =========================================================================

  /** Set the player's base amount and persist to Supabase */
  const setPlayerBase = useCallback(
    async (amount) => {
      setBaseAmount(amount);
      if (roomId) {
        await supabase
          .from('players')
          .update({ base_amount: amount, room_id: roomId })
          .eq('uuid', deviceUUID)
          .eq('room_id', roomId);
      }
    },
    [deviceUUID, roomId]
  );

  /** Apply a multiplier action in multiplayer mode */
  const playerAction = useCallback(
    async (multiplier) => {
      if (baseAmount <= 0 || role !== 'player') return;
      const delta = baseAmount * multiplier;
      const newNet = currentNet + delta;

      // Optimistic update
      setCurrentNet(newNet);
      setLastActionAmount(delta);

      const { error: updateErr } = await supabase
        .from('players')
        .update({
          current_net: newNet,
          last_action_amount: delta,
          room_id: roomId,
          updated_at: new Date().toISOString(),
        })
        .eq('uuid', deviceUUID)
        .eq('room_id', roomId);

      if (updateErr) {
        // Rollback optimistic update on error
        setCurrentNet(currentNet);
        setLastActionAmount(lastActionAmount);
        setError('Failed to update. Please try again.');
      }
    },
    [baseAmount, role, currentNet, lastActionAmount, deviceUUID, roomId]
  );

  /** Undo the last multiplayer action (max 1 step) */
  const playerUndo = useCallback(async () => {
    if (lastActionAmount === 0 || role !== 'player') return;
    const newNet = currentNet - lastActionAmount;

    // Optimistic update
    setCurrentNet(newNet);
    const prevLastAction = lastActionAmount;
    setLastActionAmount(0);

    const { error: updateErr } = await supabase
      .from('players')
      .update({
        current_net: newNet,
        last_action_amount: 0,
        room_id: roomId,
        updated_at: new Date().toISOString(),
      })
      .eq('uuid', deviceUUID)
      .eq('room_id', roomId);

    if (updateErr) {
      // Rollback
      setCurrentNet(currentNet);
      setLastActionAmount(prevLastAction);
      setError('Undo failed. Please try again.');
    }
  }, [lastActionAmount, role, currentNet, deviceUUID, roomId]);

  // =========================================================================
  // MULTIPLAYER: REALTIME SUBSCRIPTION (Banker View)
  // =========================================================================

  /** Fetch all players in the room and compute banker net */
  const fetchRoomPlayers = useCallback(async () => {
    if (!roomId) return;
    const { data, error: fetchErr } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId);

    if (!fetchErr && data) {
      setPlayers(data);
      // Banker's net = negative sum of all players' current_net
      const totalPlayerNet = data.reduce((sum, p) => sum + (p.current_net || 0), 0);
      setBankerNet(-totalPlayerNet);
    }
  }, [roomId]);

  /** Subscribe to realtime changes on the `players` table for the current room */
  useEffect(() => {
    if (mode !== 'multi' || !roomId || role !== 'banker') return;

    // Initial fetch
    fetchRoomPlayers();

    // Subscribe to INSERT, UPDATE, DELETE on players where room_id matches
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          // On any change, re-fetch the full player list for accuracy
          fetchRoomPlayers();
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    // Cleanup on unmount or room change
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, [mode, roomId, role, fetchRoomPlayers]);

  // =========================================================================
  // MULTIPLAYER: LEAVE / END ROOM
  // =========================================================================
  const leaveRoom = useCallback(async () => {
    // If the Banker leaves, mark the room as ended
    if (role === 'banker' && roomId) {
      await supabase.from('rooms').update({ status: 'ended' }).eq('id', roomId);
    }

    // Cleanup subscription
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
    setRoomId(null);
    setRole(null);
    setBaseAmount(0);
    setCurrentNet(0);
    setLastActionAmount(0);
    setBankerNet(0);
    setPlayers([]);
    setRoomStatus(null);
    setMode(null);
    setError(null);
    localStorage.removeItem('auto_join_room');
  }, [role, roomId]);

  // =========================================================================
  // RETURN API
  // =========================================================================
  return {
    // Identity
    deviceUUID,

    // Mode
    mode,
    setMode,

    // Single-player
    singleBase,
    singleNet,
    singleLastAction,
    setSinglePlayerBase,
    singlePlayerAction,
    singlePlayerUndo,
    singlePlayerExit,

    // Multiplayer
    roomId,
    role,
    baseAmount,
    currentNet,
    lastActionAmount,
    bankerNet,
    players,
    roomStatus,
    error,
    loading,

    // Multiplayer actions
    createRoom,
    joinRoom,
    setPlayerBase,
    playerAction,
    playerUndo,
    leaveRoom,
  };
}
