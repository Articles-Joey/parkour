import { CuboidCollider, RigidBody } from "@react-three/rapier";
import DisappearingPlatform from "./DisappearingPlatform";
import { usePlatformColor } from "./platformColor";

export default function Platform({
    args,
    position,
    rotation,
    disappearing,
    obstacleKey,
    platformColor,
}) {
    const color = usePlatformColor(obstacleKey, platformColor);
    if (disappearing) {
        return (
            <DisappearingPlatform
                args={args}
                position={position}
                rotation={rotation}
                obstacleKey={obstacleKey}
                platformColor={platformColor}
            />
        );
    }

    return (
        <RigidBody
            type="fixed"
            position={position}
            rotation={rotation}
            colliders={false}
        >
            <CuboidCollider
                args={args.map((size) => size / 2)}
                friction={0.3}
            />
            <mesh castShadow>
                <boxGeometry args={args} />
                <meshStandardMaterial color={color} />
            </mesh>
        </RigidBody>
    );
}
