import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useMemo, useState } from "react";
import { getPlatformColor } from "./platformColor";

export default function SpinningPlatform({
    args,
    position,
    obstacleKey,
    colorSeed = 1,
}) {
    const [angularSpeed] = useState(() => 0.9 + Math.random() * 0.2);
    const angularVelocity = useMemo(() => [0, angularSpeed, 0], [angularSpeed]);
    const color = getPlatformColor(obstacleKey, colorSeed);

    return (
        <RigidBody
            type="kinematicVelocity"
            position={position}
            colliders={false}
            angularVelocity={angularVelocity}
            userData={{ parkourSpinningPlatform: true }}
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
