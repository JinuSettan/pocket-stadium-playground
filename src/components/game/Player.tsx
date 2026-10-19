import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CapsuleCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { PLAYER } from "@/game/constants";
import { game, readMove, telemetry } from "@/game/store";

const fwd = new THREE.Vector3();
const right = new THREE.Vector3();
const desired = new THREE.Vector3();

function Limb({ refObj, x, y, len, color, w = 0.13 }: { refObj: React.RefObject<THREE.Group | null>; x: number; y: number; len: number; color: string; w?: number }) {
  return (
    <group ref={refObj} position={[x, y, 0]}>
      <mesh position={[0, -len / 2, 0]} castShadow>
        <boxGeometry args={[w, len, w]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export function Player() {
  const body = useRef<RapierRigidBody>(null);
  const visual = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const yaw = useRef(Math.PI);
  const phase = useRef(0);

  useFrame(({ camera }, raw) => {
    const b = body.current;
    if (!b || game.get().paused || !game.get().started) return;
    const dt = Math.min(raw, 0.05);
    const m = readMove();

    // camera-relative direction on XZ plane
    camera.getWorldDirection(fwd);
    fwd.y = 0;
    fwd.normalize();
    right.set(-fwd.z, 0, fwd.x);
    desired.copy(fwd).multiplyScalar(m.y).addScaledVector(right, m.x);
    const maxSpeed = m.sprint ? PLAYER.sprint : PLAYER.walk;
    desired.multiplyScalar(maxSpeed);

    const v = b.linvel();
    const rate = desired.lengthSq() > 0.01 ? PLAYER.accel : PLAYER.decel;
    const dx = desired.x - v.x;
    const dz = desired.z - v.z;
    const dl = Math.hypot(dx, dz);
    const step = Math.min(dl, rate * dt);
    const nx = dl > 0 ? v.x + (dx / dl) * step : v.x;
    const nz = dl > 0 ? v.z + (dz / dl) * step : v.z;
    b.setLinvel({ x: nx, y: v.y, z: nz }, true);

    const speed = Math.hypot(nx, nz);
    if (speed > 0.3) {
      const target = Math.atan2(nx, nz);
      let diff = target - yaw.current;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      yaw.current += diff * (1 - Math.exp(-PLAYER.turnRate * dt));
    }
    const p = b.translation();
    telemetry.playerPos.set(p.x, p.y, p.z);
    telemetry.playerFacing.set(Math.sin(yaw.current), 0, Math.cos(yaw.current));
    telemetry.playerSpeed = speed;
    telemetry.elapsed += dt;

    // procedural run cycle
    phase.current += dt * speed * 1.6;
    const swing = Math.sin(phase.current) * Math.min(speed / PLAYER.sprint, 1) * 0.9;
    if (visual.current) visual.current.rotation.y = yaw.current;
    if (legL.current) legL.current.rotation.x = swing;
    if (legR.current) legR.current.rotation.x = -swing;
    if (armL.current) armL.current.rotation.x = -swing * 0.8;
    if (armR.current) armR.current.rotation.x = swing * 0.8;
  });

  return (
    <RigidBody ref={body} position={PLAYER.spawn} colliders={false} enabledRotations={[false, false, false]} mass={75} friction={0.2} linearDamping={0.5}>
      <CapsuleCollider args={[PLAYER.halfHeight, PLAYER.radius]} />
      {/* visual origin at feet */}
      <group ref={visual} position={[0, -(PLAYER.halfHeight + PLAYER.radius), 0]}>
        <Limb refObj={legL} x={-0.12} y={0.9} len={0.85} color="#f3f3f3" w={0.15} />
        <Limb refObj={legR} x={0.12} y={0.9} len={0.85} color="#f3f3f3" w={0.15} />
        <mesh position={[0, 0.92, 0]} castShadow>
          <boxGeometry args={[0.36, 0.22, 0.22]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
        <mesh position={[0, 1.3, 0]} castShadow>
          <boxGeometry args={[0.44, 0.58, 0.24]} />
          <meshStandardMaterial color="#c81e2a" />
        </mesh>
        <mesh position={[0, 1.32, -0.125]}>
          <planeGeometry args={[0.2, 0.25]} />
          <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        <Limb refObj={armL} x={-0.3} y={1.55} len={0.6} color="#c81e2a" w={0.11} />
        <Limb refObj={armR} x={0.3} y={1.55} len={0.6} color="#c81e2a" w={0.11} />
        <mesh position={[0, 1.78, 0]} castShadow>
          <sphereGeometry args={[0.14, 16, 12]} />
          <meshStandardMaterial color="#c99a72" />
        </mesh>
        <mesh position={[0, 1.86, -0.02]}>
          <sphereGeometry args={[0.145, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#2b1a10" />
        </mesh>
        {/* boots */}
        {[-0.12, 0.12].map((x) => (
          <mesh key={x} position={[x, 0.05, 0.05]} castShadow>
            <boxGeometry args={[0.13, 0.1, 0.28]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        ))}
      </group>
    </RigidBody>
  );
}
