// FIFA-standard pitch proportions (metres). Tune stadium architecture here.
export const PITCH = { length: 105, width: 68, line: 0.12 };
export const SURROUND = { length: 125, width: 88 }; // grass run-off area
export const GOAL = { width: 7.32, height: 2.44, depth: 2.2, post: 0.06 };

export const STADIUM = {
  tiers: 14,
  tierDepth: 1.1,
  tierRise: 0.65,
  gap: 2, // distance from surround edge to first row
  roofHeight: 16,
  seatColors: ["#b3262e", "#e8e4dc", "#1d3557"],
};

export const PLAYER = {
  walk: 6.5,
  sprint: 9.5,
  accel: 28,
  decel: 22,
  turnRate: 12,
  radius: 0.35,
  halfHeight: 0.55,
  spawn: [0, 1.2, 6] as [number, number, number],
};

export const BALL = {
  radius: 0.11,
  mass: 0.43,
  restitution: 0.62,
  friction: 0.6,
  linearDamping: 0.35,
  angularDamping: 0.6,
  spawn: [0, 0.6, 0] as [number, number, number],
};
