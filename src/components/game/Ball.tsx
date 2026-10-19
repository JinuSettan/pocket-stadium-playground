import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BallCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { BALL } from "@/game/constants";
import { telemetry } from "@/game/store";

function makeBallTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f7f7f2";
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = "#1a1a1a";
  for (let i = 0; i < 12; i++) {
    const x = (i % 6) * 44 + (i >= 6 ? 22 : 0);
    const y = i >= 6 ? 88 : 40;
    g.beginPath();
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
      g.lineTo(x + Math.cos(a) * 12, y + Math.sin(a) * 12);
    }
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function Ball() {
  const body = useRef<RapierRigidBody>(null);
  const tex = useMemo(makeBallTexture, []);
  useFrame(() => {
    const b = body.current;
    if (!b) return;
    const p = b.translation();
    const v = b.linvel();
    telemetry.ballPos.set(p.x, p.y, p.z);
    telemetry.ballSpeed = Math.hypot(v.x, v.y, v.z);
    if (p.y < -3 || Math.abs(p.x) > 80 || Math.abs(p.z) > 60) {
      b.setTranslation({ x: BALL.spawn[0], y: BALL.spawn[1], z: BALL.spawn[2] }, true);
      b.setLinvel({ x: 0, y: 0, z: 0 }, true);
      b.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  });
  return (
    <RigidBody
      ref={body}
      position={BALL.spawn}
      colliders={false}
      ccd
      linearDamping={BALL.linearDamping}
      angularDamping={BALL.angularDamping}
    >
      <BallCollider args={[BALL.radius]} mass={BALL.mass} restitution={BALL.restitution} friction={BALL.friction} />
      <mesh castShadow>
        <sphereGeometry args={[BALL.radius, 24, 16]} />
        <meshStandardMaterial map={tex} roughness={0.45} />
      </mesh>
    </RigidBody>
  );
}
