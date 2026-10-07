import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useMemo, useState } from "react";
import { getPlatformColor } from "./platformColor";

export default function SpinningPlatform({
    args,
    position,
    rotation,
    obstacleKey,
    colorSeed = 1,
    rotationSpeed,
}) {
    const [angularSpeed] = useState(() => 0.9 + Math.random() * 0.2);
    const speed = rotationSpeed ?? angularSpeed;
    const angularVelocity = useMemo(() => [0, speed, 0], [speed]);
    const color = getPlatformColor(obstacleKey, colorSeed);

    return (
        <RigidBody
            type="kinematicVelocity"
            position={position}
            rotation={rotation}
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
