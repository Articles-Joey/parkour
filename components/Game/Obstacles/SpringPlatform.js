import {
    CuboidCollider,
    RigidBody,
    useAfterPhysicsStep,
} from "@react-three/rapier";
import { useRef } from "react";
import { useParkourStore } from "@/hooks/useParkourStore";
import { useStore } from "@/hooks/useStore";
import { getGroundSupport } from "../groundSupport";
import { getPlatformColor } from "./platformColor";

const DEFAULT_ARGS = [2.5, 0.5, 2.5];

export default function SpringPlatform({
    args = DEFAULT_ARGS,
    position,
    rotation,
    obstacleKey,
    colorSeed = 1,
    // Vertical launch speed in meters per second, matching Player's jump force.
    force = 15,
}) {
    const colliderRef = useRef(null);
    const launched = useRef(false);
    const padRadius = Math.min(args[0], args[2]) * 0.32;

    useAfterPhysicsStep((world) => {
        const collider = colliderRef.current;
        const { rigidBody: player, ropeAttachment } =
            useParkourStore.getState();
        const { debug, flyMode } = useStore.getState();
        const playerCollider = player?.isValid() ? player.collider(0) : null;
        if (
            !collider ||
            !playerCollider ||
            (debug && flyMode) ||
            ropeAttachment
        ) {
            launched.current = false;
            return;
        }

        // Only a landing on the top can launch the player; sides cannot trigger it.
        const support = getGroundSupport(world, playerCollider);
        if (support?.handle !== collider.handle) {
            launched.current = false;
            return;
        }

        const velocity = player.linvel();
        if (launched.current || velocity.y > 0.1 || force <= 0) return;

        // Apply after collision resolution so falling speed cannot weaken the launch.
        // Keep horizontal movement and rearm only once the player leaves the pad.
        player.setLinvel({ x: velocity.x, y: force, z: velocity.z }, true);
        launched.current = true;
    });

    return (
        <RigidBody
            type="fixed"
            position={position}
            rotation={rotation}
            colliders={false}
        >
            <CuboidCollider
                ref={colliderRef}
                args={args.map((size) => size / 2)}
                friction={0.3}
                restitution={0}
            />
            <mesh
                castShadow
                receiveShadow
            >
                <boxGeometry args={args} />
                <meshStandardMaterial
                    color={getPlatformColor(obstacleKey, colorSeed)}
                />
            </mesh>
            <mesh
                position={[0, args[1] / 2 + 0.015, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            >
                <ringGeometry args={[padRadius * 0.75, padRadius, 32]} />
                <meshStandardMaterial
                    color="#fbbf24"
                    emissive="#f59e0b"
                    emissiveIntensity={0.3}
                />
            </mesh>
        </RigidBody>
    );
}
