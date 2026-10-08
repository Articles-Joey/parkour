import {
    CuboidCollider,
    RigidBody,
    useBeforePhysicsStep,
} from "@react-three/rapier";
import { useRef } from "react";
import { useParkourStore } from "@/hooks/useParkourStore";
import { useStore } from "@/hooks/useStore";
import { getGroundSupport } from "../groundSupport";
import { usePlatformColor } from "./platformColor";

// These durations are in seconds, measured using the physics timestep.
const DISAPPEAR_AFTER = 2;
const RESPAWN_AFTER = 5;

export default function DisappearingPlatform({
    args,
    position,
    rotation,
    obstacleKey,
    platformColor,
    disappearAfter = DISAPPEAR_AFTER,
    respawnAfter = RESPAWN_AFTER,
}) {
    const color = usePlatformColor(obstacleKey, platformColor);
    const colliderRef = useRef(null);
    const meshRef = useRef(null);
    const materialRef = useRef(null);
    const phase = useRef("ready");
    const elapsed = useRef(0);

    useBeforePhysicsStep((world) => {
        const collider = colliderRef.current;
        const mesh = meshRef.current;
        const material = materialRef.current;
        if (!collider || !mesh || !material) return;

        if (phase.current === "ready") {
            const { rigidBody: player, ropeAttachment } =
                useParkourStore.getState();
            const { debug, flyMode } = useStore.getState();
            if (!player?.isValid() || (debug && flyMode) || ropeAttachment)
                return;
            // Side contacts and other obstacles cannot start the countdown.
            const support = getGroundSupport(world, player.collider(0));
            if (support?.handle !== collider.handle || player.linvel().y > 0.1)
                return;
            phase.current = "countdown";
            elapsed.current = 0;
        }

        elapsed.current += world.timestep;
        if (phase.current === "countdown") {
            const progress = Math.min(1, elapsed.current / disappearAfter);
            material.opacity = 1 - progress * 0.55;
            material.emissiveIntensity = 0.2 + progress * 0.5;
            if (elapsed.current >= disappearAfter) {
                // Disable immediately so the player falls during this physics step.
                collider.setEnabled(false);
                mesh.visible = false;
                phase.current = "hidden";
                elapsed.current = 0;
            }
        } else if (elapsed.current >= respawnAfter) {
            collider.setEnabled(true);
            mesh.visible = true;
            material.opacity = 1;
            material.emissiveIntensity = 0;
            phase.current = "ready";
            elapsed.current = 0;
        }
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
            />
            <mesh
                ref={meshRef}
                castShadow
                receiveShadow
            >
                <boxGeometry args={args} />
                <meshStandardMaterial
                    ref={materialRef}
                    color={color}
                    transparent
                    emissive="#f59e0b"
                    emissiveIntensity={0}
                />
            </mesh>
        </RigidBody>
    );
}
