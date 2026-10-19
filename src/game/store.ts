import { useSyncExternalStore } from "react";
import * as THREE from "three";

export type CameraMode = "broadcast" | "chase";

export interface GameState {
  started: boolean;
  paused: boolean;
  camera: CameraMode;
  resetKey: number;
  showHelp: boolean;
}

let state: GameState = { started: false, paused: false, camera: "broadcast", resetKey: 0, showHelp: false };
const listeners = new Set<() => void>();

export const game = {
  get: () => state,
  set(patch: Partial<GameState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  togglePause() {
    if (state.started) game.set({ paused: !state.paused });
  },
  toggleCamera() {
    game.set({ camera: state.camera === "broadcast" ? "chase" : "broadcast" });
  },
  reset() {
    game.set({ resetKey: state.resetKey + 1 });
    telemetry.elapsed = 0;
  },
};

export function useGame() {
  return useSyncExternalStore(game.subscribe, game.get, game.get);
}

/** Mutable per-frame data shared between scene systems (never triggers React renders). */
export const telemetry = {
  playerPos: new THREE.Vector3(0, 1, 6),
  playerFacing: new THREE.Vector3(0, 0, -1),
  playerSpeed: 0,
  ballPos: new THREE.Vector3(),
  ballSpeed: 0,
  elapsed: 0,
};

/** Unified input: keyboard + touch joystick write here; player reads it. */
export const input = {
  keys: new Set<string>(),
  joy: { x: 0, y: 0 }, // x = right, y = forward, magnitude 0..1
  sprintTouch: false,
};

export function readMove(): { x: number; y: number; sprint: boolean } {
  const k = input.keys;
  let x = input.joy.x;
  let y = input.joy.y;
  if (k.has("KeyA") || k.has("ArrowLeft")) x -= 1;
  if (k.has("KeyD") || k.has("ArrowRight")) x += 1;
  if (k.has("KeyW") || k.has("ArrowUp")) y += 1;
  if (k.has("KeyS") || k.has("ArrowDown")) y -= 1;
  const len = Math.hypot(x, y);
  if (len > 1) {
    x /= len;
    y /= len;
  }
  return { x, y, sprint: input.sprintTouch || k.has("ShiftLeft") || k.has("ShiftRight") };
}
