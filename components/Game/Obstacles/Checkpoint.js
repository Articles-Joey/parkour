import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useParkourStore } from "@/hooks/useParkourStore";

export default function Checkpoint({ args, position, name }) {
    const unlocked = useParkourStore((state) =>
        state.checkpoints.some(
            (checkpoint) => checkpoint.name === name && checkpoint.locked === false,
        ),
    );
    const colliderRef = useRef(null);
    const meshRef = useRef(null);

    useFrame(() => {
        const collider = colliderRef.current;
        const mesh = meshRef.current;
        if (!collider || !mesh) return;

        const { rigidBody: player } = useParkourStore.getState();
        const playerCollider = player?.isValid() ? player.collider(0) : null;
        // Shape overlap also works when fly mode disables player collision groups.
        mesh.visible =
            !playerCollider ||
            !collider.intersectsShape(
                playerCollider.shape,
                playerCollider.translation(),
                playerCollider.rotation(),
            );
    });

    const unlockCheckpoint = ({ other }) => {
        const { rigidBody, checkpoints, setCheckpoints } =
            useParkourStore.getState();
        if (other.rigidBody !== rigidBody) return;

        // Read the latest state so simultaneous intersections cannot relock a checkpoint.
        setCheckpoints(
            checkpoints.map((checkpoint) =>
                checkpoint.name === name
                    ? { ...checkpoint, locked: false }
                    : checkpoint,
            ),
        );
    };

    return (
        <RigidBody
            type="fixed"
            position={position}
            colliders={false}
        >
            <CuboidCollider
                ref={colliderRef}
                args={args.map((size) => size / 2)}
                sensor
                onIntersectionEnter={unlockCheckpoint}
            />
            <mesh ref={meshRef}>
                <boxGeometry args={args} />
                <meshStandardMaterial
                    transparent={true}
                    opacity={0.15}
                    depthWrite={false}
                    color={unlocked ? "green" : "red"}
                />
            </mesh>
        </RigidBody>
    );
}
