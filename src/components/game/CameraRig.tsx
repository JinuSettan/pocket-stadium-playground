import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { game, telemetry } from "@/game/store";

const goal = new THREE.Vector3();
const look = new THREE.Vector3();
const lookCur = new THREE.Vector3();

export function CameraRig() {
  useFrame(({ camera }, raw) => {
    const dt = Math.min(raw, 0.05);
    const p = telemetry.playerPos;
    const started = game.get().started;
    if (!started) {
      // slow orbit on title screen
      const t = performance.now() / 9000;
      goal.set(Math.sin(t) * 70, 30, Math.cos(t) * 55);
      look.set(0, 0, 0);
    } else if (game.get().camera === "broadcast") {
      goal.set(p.x * 0.85, 20, p.z + 26);
      look.set(p.x, 0.5, p.z - 2);
    } else {
      const f = telemetry.playerFacing;
      goal.set(p.x - f.x * 7, p.y + 3.2, p.z - f.z * 7);
      look.set(p.x + f.x * 4, 1, p.z + f.z * 4);
    }
    const k = 1 - Math.exp(-(started ? 4 : 1.5) * dt);
    camera.position.lerp(goal, k);
    lookCur.lerp(look, k);
    camera.lookAt(lookCur);
  });
  return null;
}
