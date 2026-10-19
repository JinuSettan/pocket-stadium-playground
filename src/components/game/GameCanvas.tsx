import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Stadium } from "./Stadium";
import { Ball } from "./Ball";
import { Player } from "./Player";
import { CameraRig } from "./CameraRig";
import { HUD } from "./HUD";
import { game, input, useGame } from "@/game/store";

function useKeyboard() {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code.startsWith("Arrow") || e.code === "Space") e.preventDefault();
      input.keys.add(e.code);
      if (e.repeat) return;
      if (e.code === "KeyP" || e.code === "Escape") game.togglePause();
      if (e.code === "KeyC") game.toggleCamera();
      if (e.code === "KeyR") game.reset();
      if (e.code === "KeyH") game.set({ showHelp: !game.get().showHelp, paused: true });
    };
    const up = (e: KeyboardEvent) => input.keys.delete(e.code);
    const clear = () => input.keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);
}

export default function GameCanvas() {
  const { paused, started, resetKey } = useGame();
  useKeyboard();
  return (
    <div className="game-root">
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: [60, 30, 50], fov: 50, near: 0.1, far: 600 }}>
        <color attach="background" args={["#0d1626"]} />
        <fog attach="fog" args={["#0d1626", 110, 260]} />
        <hemisphereLight args={["#cfe3ff", "#2d4a2a", 0.7]} />
        <directionalLight
          position={[30, 60, 25]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-70}
          shadow-camera-right={70}
          shadow-camera-top={55}
          shadow-camera-bottom={-55}
          shadow-camera-far={160}
          shadow-bias={-0.0004}
        />
        <Environment resolution={64}>
          <Lightformer intensity={2} position={[0, 20, 0]} rotation-x={Math.PI / 2} scale={[40, 40, 1]} />
          <Lightformer intensity={1.2} color="#fff3d6" position={[-30, 10, -10]} rotation-y={Math.PI / 2} scale={[40, 4, 1]} />
          <Lightformer intensity={1.2} color="#d6e8ff" position={[30, 10, 10]} rotation-y={-Math.PI / 2} scale={[40, 4, 1]} />
        </Environment>
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]} paused={paused || !started} timeStep={1 / 60}>
            <Stadium />
            <group key={resetKey}>
              <Ball />
              <Player />
            </group>
          </Physics>
        </Suspense>
        <CameraRig />
      </Canvas>
      <HUD />
    </div>
  );
}
