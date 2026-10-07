import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useParkourStore } from "@/hooks/useParkourStore";

export default function Checkpoint({ args, position, name }) {
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
                args={args.map((size) => size / 2)}
                sensor
                onIntersectionEnter={unlockCheckpoint}
            />
            <mesh castShadow>
                <boxGeometry args={args} />
                <meshStandardMaterial
                    transparent={true}
                    opacity={0.5}
                    color="red"
                />
            </mesh>
        </RigidBody>
    );
}
