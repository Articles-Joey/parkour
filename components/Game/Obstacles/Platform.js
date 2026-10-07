import { CuboidCollider, RigidBody } from "@react-three/rapier";
import DisappearingPlatform from "./DisappearingPlatform";
import { getPlatformColor } from "./platformColor";

export default function Platform({
    args,
    position,
    rotation,
    disappearing,
    obstacleKey,
    colorSeed = 1,
}) {
    if (disappearing) {
        return (
            <DisappearingPlatform
                args={args}
                position={position}
                rotation={rotation}
                obstacleKey={obstacleKey}
                colorSeed={colorSeed}
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
                <meshStandardMaterial
                    color={getPlatformColor(obstacleKey, colorSeed)}
                />
            </mesh>
        </RigidBody>
    );
}
