import {
    CuboidCollider,
    RigidBody,
    useBeforePhysicsStep,
} from "@react-three/rapier";
import { useMemo, useRef } from "react";
import { DoubleSide, Quaternion, Vector3 } from "three";
import { useParkourStore } from "@/hooks/useParkourStore";
import { useStore } from "@/hooks/useStore";
import { getGroundSupport } from "../groundSupport";
import { getPlatformColor } from "./platformColor";

const TILT_SPEED = 0.7; // Radians per second at the edge.
const MAX_TILT = Math.PI / 3;
const RETURN_SPEED = 1.5;
const CENTER_DEADZONE = 0.05;
const DEFAULT_PLATFORM_ARGS = [2.5, 0.5, 2.5];

export default function GravityPlatform({
    args = DEFAULT_PLATFORM_ARGS,
    position,
    rotation,
    obstacleKey,
    colorSeed = 1,
    tiltSpeed = TILT_SPEED,
    maxTilt = MAX_TILT,
    returnSpeed = RETURN_SPEED,
}) {
    const bodyRef = useRef(null);
    const colliderRef = useRef(null);
    const baseRotation = useRef(null);
    const tilt = useMemo(() => new Vector3(), []);
    const localPlayer = useMemo(() => new Vector3(), []);
    const inverseRotation = useMemo(() => new Quaternion(), []);
    const tiltRotation = useMemo(() => new Quaternion(), []);
    const nextRotation = useMemo(() => new Quaternion(), []);
    const tiltAxis = useMemo(() => new Vector3(), []);

    useBeforePhysicsStep((world) => {
        const body = bodyRef.current;
        const collider = colliderRef.current;
        if (!body || !collider) return;
        if (!baseRotation.current)
            baseRotation.current = new Quaternion().copy(body.rotation());

        const { rigidBody: player, ropeAttachment } =
            useParkourStore.getState();
        const { debug, flyMode } = useStore.getState();
        let occupied = false;
        if (player?.isValid() && !(debug && flyMode) && !ropeAttachment) {
            const support = getGroundSupport(world, player.collider(0), 0.1);
            localPlayer
                .copy(player.translation())
                .sub(body.translation())
                .applyQuaternion(
                    inverseRotation.copy(body.rotation()).invert(),
                );
            occupied =
                support?.handle === collider.handle && localPlayer.y >= args[1];
        }

        if (occupied) {
            // Offsets use the level platform's axes so tilt always lowers the
            // side under the player, even if the obstacle is initially rotated.
            localPlayer
                .copy(player.translation())
                .sub(body.translation())
                .applyQuaternion(
                    inverseRotation.copy(baseRotation.current).invert(),
                );
            const offsetX = Math.max(
                -1,
                Math.min(1, localPlayer.x / (args[0] / 2)),
            );
            const offsetZ = Math.max(
                -1,
                Math.min(1, localPlayer.z / (args[2] / 2)),
            );
            if (Math.abs(offsetX) > CENTER_DEADZONE)
                tilt.z -= offsetX * tiltSpeed * world.timestep;
            if (Math.abs(offsetZ) > CENTER_DEADZONE)
                tilt.x += offsetZ * tiltSpeed * world.timestep;
            tilt.clampLength(0, maxTilt);
        } else {
            tilt.multiplyScalar(Math.exp(-returnSpeed * world.timestep));
            if (tilt.lengthSq() < 0.000001) tilt.set(0, 0, 0);
        }

        const angle = tilt.length();
        if (angle > 0) {
            tiltAxis.copy(tilt).divideScalar(angle);
            tiltRotation.setFromAxisAngle(tiltAxis, angle);
        } else {
            tiltRotation.identity();
        }
        nextRotation.copy(baseRotation.current).multiply(tiltRotation);
        body.setNextKinematicRotation(nextRotation);
    });

    return (
        <group
            position={position}
            rotation={rotation}
        >
            {/* A fixed ball joint and stem make the center balance point visible. */}
            <mesh
                position={[0, -args[1] / 2, 0]}
                castShadow
            >
                <sphereGeometry args={[args[1] * 0.5, 16, 12]} />
                <meshStandardMaterial
                    color="#475569"
                    metalness={0.6}
                    roughness={0.4}
                />
            </mesh>
            <mesh
                position={[0, -args[1] / 2 - 0.45, 0]}
                castShadow
            >
                <cylinderGeometry args={[0.12, 0.18, 0.9, 12]} />
                <meshStandardMaterial
                    color="#334155"
                    metalness={0.5}
                    roughness={0.5}
                />
            </mesh>
            <RigidBody
                ref={bodyRef}
                type="kinematicPosition"
                position={[0, -args[1] / 2, 0]}
                colliders={false}
                userData={{
                    parkourGravityPlatform: true,
                    parkourSurfaceHeight: args[1],
                }}
            >
                <CuboidCollider
                    ref={colliderRef}
                    args={args.map((size) => size / 2)}
                    position={[0, args[1] / 2, 0]}
                    friction={0.3}
                />
                <mesh
                    position={[0, args[1] / 2, 0]}
                    castShadow
                    receiveShadow
                >
                    <boxGeometry args={args} />
                    <meshStandardMaterial
                        color={getPlatformColor(obstacleKey, colorSeed)}
                    />
                </mesh>
                <mesh
                    position={[0, args[1] + 0.012, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <ringGeometry args={[0.14, 0.18, 32]} />
                    <meshStandardMaterial
                        color="#f8fafc"
                        side={DoubleSide}
                    />
                </mesh>
            </RigidBody>
        </group>
    );
}
