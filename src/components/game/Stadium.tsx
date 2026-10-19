import { useMemo } from "react";
import * as THREE from "three";
import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";
import { GOAL, PITCH, STADIUM, SURROUND } from "@/game/constants";

function makePitchTexture() {
  const ppm = 16;
  const W = SURROUND.length * ppm;
  const H = SURROUND.width * ppm;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  // mowing stripes
  const stripes = 20;
  for (let i = 0; i < stripes; i++) {
    g.fillStyle = i % 2 ? "#3f8a3a" : "#367f33";
    g.fillRect((i * W) / stripes, 0, W / stripes + 1, H);
  }
  // subtle noise
  for (let i = 0; i < 40000; i++) {
    g.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`;
    g.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  const X = (m: number) => (m + SURROUND.length / 2) * ppm;
  const Y = (m: number) => (m + SURROUND.width / 2) * ppm;
  const L = PITCH.length / 2;
  const Wd = PITCH.width / 2;
  g.strokeStyle = "#f4f4ef";
  g.fillStyle = "#f4f4ef";
  g.lineWidth = PITCH.line * ppm * 1.4;
  const rect = (x0: number, y0: number, x1: number, y1: number) => g.strokeRect(X(x0), Y(y0), X(x1) - X(x0), Y(y1) - Y(y0));
  const arc = (x: number, y: number, r: number, a0 = 0, a1 = Math.PI * 2) => {
    g.beginPath();
    g.arc(X(x), Y(y), r * ppm, a0, a1);
    g.stroke();
  };
  const spot = (x: number, y: number) => {
    g.beginPath();
    g.arc(X(x), Y(y), 0.2 * ppm, 0, Math.PI * 2);
    g.fill();
  };
  rect(-L, -Wd, L, Wd);
  g.beginPath();
  g.moveTo(X(0), Y(-Wd));
  g.lineTo(X(0), Y(Wd));
  g.stroke();
  arc(0, 0, 9.15);
  spot(0, 0);
  for (const s of [-1, 1]) {
    const gx = s * L;
    rect(Math.min(gx, gx - s * 16.5), -20.16, Math.max(gx, gx - s * 16.5), 20.16);
    rect(Math.min(gx, gx - s * 5.5), -9.16, Math.max(gx, gx - s * 5.5), 9.16);
    spot(gx - s * 11, 0);
    const a = Math.acos(5.5 / 9.15);
    if (s > 0) arc(gx - 11, 0, 9.15, Math.PI - a, Math.PI + a);
    else arc(gx + 11, 0, 9.15, -a, a);
  }
  arc(-L, -Wd, 1, 0, Math.PI / 2);
  arc(L, -Wd, 1, Math.PI / 2, Math.PI);
  arc(L, Wd, 1, Math.PI, Math.PI * 1.5);
  arc(-L, Wd, 1, Math.PI * 1.5, Math.PI * 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function makeNetTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.strokeStyle = "rgba(255,255,255,0.9)";
  g.lineWidth = 3;
  g.strokeRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function Goal({ side }: { side: 1 | -1 }) {
  const net = useMemo(makeNetTexture, []);
  const x = side * (PITCH.length / 2);
  const d = GOAL.depth;
  const hw = GOAL.width / 2;
  const h = GOAL.height;
  const r = GOAL.post;
  const netMat = (rx: number, ry: number) => {
    const t = net.clone();
    t.needsUpdate = true;
    t.repeat.set(rx, ry);
    return <meshStandardMaterial map={t} transparent alphaTest={0.3} side={THREE.DoubleSide} color="#ffffff" />;
  };
  return (
    <group position={[x, 0, 0]}>
      {/* frame */}
      {[-hw, hw].map((z) => (
        <mesh key={z} position={[0, h / 2, z]} castShadow>
          <cylinderGeometry args={[r, r, h, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, h, 0]} rotation-x={Math.PI / 2} castShadow>
        <cylinderGeometry args={[r, r, GOAL.width + r * 2, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* nets */}
      <mesh position={[side * d, h / 2, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[GOAL.width, h]} />
        {netMat(60, 20)}
      </mesh>
      <mesh position={[side * (d / 2), h, 0]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[d, GOAL.width]} />
        {netMat(18, 60)}
      </mesh>
      {[-hw, hw].map((z) => (
        <mesh key={z} position={[side * (d / 2), h / 2, z]}>
          <planeGeometry args={[d, h]} />
          {netMat(18, 20)}
        </mesh>
      ))}
      {/* physics: posts + net walls */}
      <RigidBody type="fixed" colliders={false} restitution={0.5}>
        {[-hw, hw].map((z) => (
          <CylinderCollider key={z} args={[h / 2, r]} position={[0, h / 2, z]} />
        ))}
        <CuboidCollider args={[r, r, hw]} position={[0, h, 0]} />
      </RigidBody>
      <RigidBody type="fixed" colliders={false} restitution={0.05} friction={1}>
        <CuboidCollider args={[0.05, h / 2, hw]} position={[side * d, h / 2, 0]} />
        <CuboidCollider args={[d / 2, 0.05, hw]} position={[side * (d / 2), h + 0.05, 0]} />
        {[-hw, hw].map((z) => (
          <CuboidCollider key={z} args={[d / 2, h / 2, 0.05]} position={[side * (d / 2), h / 2, z]} />
        ))}
      </RigidBody>
    </group>
  );
}

function CornerFlag({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.5, 6]} />
        <meshStandardMaterial color="#f2f2f2" />
      </mesh>
      <mesh position={[Math.sign(-x) * 0.2, 1.35, 0]}>
        <planeGeometry args={[0.4, 0.28]} />
        <meshStandardMaterial color="#ffcf2e" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** One side of the bowl: stepped tiers with coloured seat bands, back wall and cantilever roof. */
function Stand({ length, offset, rotY }: { length: number; offset: number; rotY: number }) {
  const { tiers, tierDepth, tierRise, roofHeight, seatColors } = STADIUM;
  const depth = tiers * tierDepth;
  return (
    <group rotation-y={rotY}>
      <group position={[0, 0, offset]}>
        {/* advertising boards */}
        <mesh position={[0, 0.5, -1.2]} castShadow>
          <boxGeometry args={[length - 6, 1, 0.15]} />
          <meshStandardMaterial color="#14213d" emissive="#1e3a8a" emissiveIntensity={0.6} />
        </mesh>
        {Array.from({ length: tiers }, (_, i) => {
          const hgt = 1.2 + i * tierRise;
          return (
            <mesh key={i} position={[0, hgt / 2, i * tierDepth + tierDepth / 2]} receiveShadow castShadow={i % 3 === 0}>
              <boxGeometry args={[length + i * 2 * tierDepth, hgt, tierDepth]} />
              <meshStandardMaterial color={seatColors[Math.floor(i / 5) % seatColors.length] ?? "#888"} roughness={0.85} />
            </mesh>
          );
        })}
        {/* concourse wall */}
        <mesh position={[0, roofHeight / 2, depth + 0.5]}>
          <boxGeometry args={[length + depth * 2 + 2, roofHeight, 1]} />
          <meshStandardMaterial color="#5c6370" roughness={0.9} />
        </mesh>
        {/* roof */}
        <mesh position={[0, roofHeight, depth / 2 - 2]} rotation-x={-0.08} castShadow>
          <boxGeometry args={[length + depth * 2 + 2, 0.4, depth + 6]} />
          <meshStandardMaterial color="#cfd3d8" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, roofHeight - 0.35, -4.8]}>
          <boxGeometry args={[length + depth * 2, 0.3, 0.3]} />
          <meshStandardMaterial color="#fff6d8" emissive="#fff6d8" emissiveIntensity={2} />
        </mesh>
      </group>
    </group>
  );
}

function Floodlight({ x, z }: { x: number; z: number }) {
  const h = 34;
  const look = Math.atan2(-x, -z);
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.35, 0.6, h, 8]} />
        <meshStandardMaterial color="#8a9099" metalness={0.6} roughness={0.4} />
      </mesh>
      <group position={[0, h, 0]} rotation={[0, look, 0]}>
        <mesh rotation-x={-0.5}>
          <boxGeometry args={[6, 3.5, 0.4]} />
          <meshStandardMaterial color="#fffbe8" emissive="#fffbe8" emissiveIntensity={3} />
        </mesh>
      </group>
    </group>
  );
}

export function Stadium() {
  const pitchTex = useMemo(makePitchTexture, []);
  const hl = SURROUND.length / 2;
  const hw = SURROUND.width / 2;
  const g = STADIUM.gap;
  const outer = STADIUM.tiers * STADIUM.tierDepth + 8;
  return (
    <group>
      {/* pitch surface + ground collider */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[SURROUND.length, SURROUND.width]} />
        <meshStandardMaterial map={pitchTex} roughness={0.95} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[SURROUND.length + outer * 2, SURROUND.width + outer * 2]} />
        <meshStandardMaterial color="#3a3f47" roughness={1} />
      </mesh>
      <RigidBody type="fixed" colliders={false} friction={0.9} restitution={0.5}>
        <CuboidCollider args={[hl + 20, 0.5, hw + 20]} position={[0, -0.5, 0]} />
        {/* invisible perimeter walls at the advertising boards */}
        <CuboidCollider args={[hl, 3, 0.3]} position={[0, 3, hw + g - 1]} />
        <CuboidCollider args={[hl, 3, 0.3]} position={[0, 3, -hw - g + 1]} />
        <CuboidCollider args={[0.3, 3, hw]} position={[hl + g - 1, 3, 0]} />
        <CuboidCollider args={[0.3, 3, hw]} position={[-hl - g + 1, 3, 0]} />
      </RigidBody>

      <Goal side={1} />
      <Goal side={-1} />
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <CornerFlag key={`${sx}${sz}`} x={(sx * PITCH.length) / 2} z={(sz * PITCH.width) / 2} />))}

      <Stand length={SURROUND.length} offset={hw + g} rotY={0} />
      <Stand length={SURROUND.length} offset={hw + g} rotY={Math.PI} />
      <Stand length={SURROUND.width} offset={hl + g} rotY={Math.PI / 2} />
      <Stand length={SURROUND.width} offset={hl + g} rotY={-Math.PI / 2} />

      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <Floodlight key={`f${sx}${sz}`} x={sx * (hl + 18)} z={sz * (hw + 18)} />))}
    </group>
  );
}
