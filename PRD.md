# Gambling Tracker — PRD

## Overview
Mobile-first, zero-registration, real-time gambling tracker PWA.

## Tech Stack
- React (Vite) + TailwindCSS
- Supabase (PostgreSQL + Realtime)
- `uuid` for anonymous device identity

## Core Features

### Authentication & Identity
- Zero registration. Generate UUID on first load, persist in `localStorage` as `device_uuid`.

### Database Schema (Supabase)
- **rooms**: `id` (text, 4-6 digit code, PK), `banker_uuid` (uuid), `created_at` (timestamptz), `status` (text: active/ended)
- **players**: `uuid` (uuid, PK), `room_id` (text, FK), `role` (text: banker/player), `base_amount` (numeric), `current_net` (numeric, default 0), `last_action_amount` (numeric, default 0), `updated_at` (timestamptz)

### Game Modes
- **Mode A (Single Player)**: Local state + localStorage only. No Supabase.
- **Mode B (Multiplayer)**: Real-time via Supabase. Max 15 players per room.

### UI Requirements
- **Player (闲)**: Green theme. 10 fat-finger buttons (x1–x10, -x1–-x10). Undo (1 step). Shows own net only.
- **Banker (庄)**: Red theme. Timer + total room net. Real-time subscription.

### Business Logic
- Player net: `current_net += base_amount * multiplier`
- Banker net: `-(SUM of all players' current_net)`
- Undo: `current_net -= last_action_amount`, then `last_action_amount = 0`
