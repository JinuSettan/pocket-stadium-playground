# Pocket Stadium Playground

PROJECT: REAL FOOTBALL SIMULATOR 3D — PHASE 1 ONLY.

Inspect the newly created project's files and implement a genuinely interactive, mobile-friendly 3D football prototype, not a static mockup. This is a browser-based prototype, so use React + TypeScript + Three.js (React Three Fiber is acceptable) with a compatible real physics engine such as Rapier. Do not mix in Unreal/native-engine architecture. Keep gameplay local/offline with no login, backend, external API, or network dependency during play. Use procedural/original geometry and materials; do not rely on paid assets.

Scope strictly to Phase 1:
- Build a real 3D stadium environment with a green football pitch, correctly proportioned white field markings, goals and nets, corner flags, visible stands/seating, roof/floodlight structures, lighting and shadows. Use procedural geometry/materials if no image asset is attached. Do not pretend to have inspected a stadium photo if none is available.
- Add a football with a physical collider and gravity, ground collision, rolling friction and bounce using the physics engine.
- Add one controllable humanoid-like football player (procedural low-poly model is fine) with movement, turning and acceleration; ensure movement and collisions are stable.
- Add a smooth follow camera, with a simple camera mode toggle if feasible.
- Add a landscape-friendly match HUD and large touch joystick / movement controls suitable for Android, plus keyboard controls for desktop testing (WASD/arrow keys).
- Add a clear first-run screen or in-game help explaining controls, plus pause/resume and reset.
- Make it visually polished and game-like, but prioritize working controls and actual simulation over decoration.
- Keep modules structured so later phases can add passing/shooting, goals, goalkeeper, AI and full matches.

Important:
1. First inspect the actual scaffold and existing files; then implement Phase 1 in the project.
2. Run the available checks/build and fix errors where possible. Do not claim runtime tests were performed unless they were.
3. Avoid placeholder buttons that do nothing. If a feature cannot be implemented now, label it as not yet available.
4. Optimize for Android phone browsers and support landscape orientation gracefully without blocking portrait users.
5. Deliver a short test guide: how to open the preview, move with touch/keyboard, test ball collisions, reset and check offline behavior.
6. No full-match/11v11 claims in this phase. Phase 1 is only stadium + pitch + ball + camera + one controllable player.
The user mentioned an uploaded stadium photograph, but no stadium image is attached to this initial request payload. Build an original procedural stadium for now and make it straightforward to replace/tune its architecture when the user supplies the photo.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8269cae7-e70b-4ef8-86c7-918cac87d759).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
