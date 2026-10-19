import { useEffect, useState } from "react";
import { game, telemetry, useGame } from "@/game/store";
import { Joystick, SprintButton } from "./Joystick";

function useTicker() {
  const [, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set((n) => n + 1), 150);
    return () => clearInterval(id);
  }, []);
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function Help() {
  return (
    <div className="help-grid">
      <div>
        <h3>Phone / tablet</h3>
        <p>Drag the left joystick to run. Hold SPRINT on the right to go faster. Run into the ball to push it.</p>
      </div>
      <div>
        <h3>Keyboard</h3>
        <p>WASD / Arrows move · Shift sprint · C camera · P / Esc pause · R reset · H help</p>
      </div>
      <p className="help-note">Phase 1 prototype: one player and a physics ball. Passing, shooting, goalkeeper and matches are not yet available.</p>
    </div>
  );
}

export function HUD() {
  const s = useGame();
  useTicker();

  if (!s.started) {
    return (
      <div className="overlay">
        <div className="panel panel-hero">
          <p className="eyebrow">Phase 1 · Training ground</p>
          <h1 className="title">Real Football Simulator</h1>
          <Help />
          <button className="cta" onClick={() => game.set({ started: true, paused: false })}>
            Kick off
          </button>
          <p className="rotate-hint">Tip: turn your phone sideways for the best view.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hud">
      <div className="hud-top">
        <div className="scorebug">
          <span className="scorebug-team">TRAINING</span>
          <span className="scorebug-clock">{fmt(telemetry.elapsed)}</span>
        </div>
        <div className="hud-actions">
          <button className="touch-btn" onClick={() => game.toggleCamera()}>
            CAM: {s.camera === "broadcast" ? "TV" : "CHASE"}
          </button>
          <button className="touch-btn" onClick={() => game.reset()}>
            RESET
          </button>
          <button className="touch-btn" onClick={() => game.togglePause()}>
            {s.paused ? "▶" : "❚❚"}
          </button>
        </div>
      </div>
      <div className="hud-stats">
        <span>Player {(telemetry.playerSpeed * 3.6).toFixed(0)} km/h</span>
        <span>Ball {(telemetry.ballSpeed * 3.6).toFixed(0)} km/h</span>
      </div>
      <div className="hud-bottom">
        <Joystick />
        <div className="hud-right">
          <button className="touch-btn touch-btn-disabled" disabled title="Coming in Phase 2">
            SHOOT
            <small>Phase 2</small>
          </button>
          <SprintButton />
        </div>
      </div>
      {s.paused && (
        <div className="overlay">
          <div className="panel">
            <h2 className="title title-sm">Paused</h2>
            <Help />
            <div className="row">
              <button className="cta" onClick={() => game.set({ paused: false, showHelp: false })}>
                Resume
              </button>
              <button
                className="cta cta-ghost"
                onClick={() => {
                  game.reset();
                  game.set({ paused: false, showHelp: false });
                }}
              >
                Reset positions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
