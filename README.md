# Parkour

Parkour web game build with React Three Fiber and react-three/rapier.

![Preview](public/img/preview.webp)

## Getting Started

First, run the development server:

```bash
npm run dev
```

## Multiplayer

Aiming to have multiplayer via P2P and Websockets. Websocket backend code is not in this repo or available at this time. P2P code will be included here.

## Obstacles Guide

Obstacle components live in `components/Game/Obstacles`. Place them using `position={[x, y, z]}` in `GameCanvas.js`. Platform colors are repeatable using `obstacleKey` and `colorSeed`.

| Obstacle                 | Description                                                                                                                                                          |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Platform**             | Fixed box platform for walking and landing. Set `args={[width, height, depth]}` to change its size.                                                                  |
| **SpinningPlatform**     | Rotates around its vertical axis and carries the player as they stand on it.                                                                                         |
| **DisappearingPlatform** | Disappears 2 seconds after the player lands, then returns 5 seconds later. Adjust `disappearAfter` and `respawnAfter`.                                               |
| **GravityPlatform**      | Balances on a center pivot and tilts toward the player's offset until they slide off. Adjust `tiltSpeed`, `maxTilt`, and `returnSpeed`.                              |
| **RotatingLog**          | Rolling wooden cylinder with pegs distributed using a repeatable `seed`. Adjust `radius`, `length`, `rotationSpeed`, and `pegCount`; set `pegCount={0}` for no pegs. |
| **SpringPlatform**       | Launches the player upward when they land on top. Adjust `force` to change the vertical launch speed.                                                                |
| **RopeSwing**            | Swinging rope the player automatically grabs on contact, allowing them to climb and jump off.                                                                        |
| **SwingingBall**         | Heavy ball suspended from a swinging rope that players must dodge.                                                                                                   |
| **Checkpoint**           | Sensor that unlocks a saved respawn location when the player enters it.                                                                                              |

For map building, enable Debug Mode and press **G** to toggle fly mode. This setting persists in the Zustand store. Fly with WASD or arrow keys, rise with Space, descend with C, and hold Shift to move faster.

## Attributions

[Parkour Icon](https://www.flaticon.com/free-icon/parkour_3163705)
