import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { Quaternion, Vector3 } from "three";

const DIRECTION_COLOR = "#38bdf8";
const LIMIT_COLOR = "#fbbf24";
const ignoreRaycast = () => null;

// A hanging rope rotated around local Z has its tip at [L sin(a), -L cos(a), 0].
const tipPosition = (length, angle) => [
    length * Math.sin(angle),
    -length * Math.cos(angle),
    0,
];

function arcPoints(length, from, to, segments = 32) {
    return Array.from({ length: segments + 1 }, (_, index) =>
        tipPosition(length, from + ((to - from) * index) / segments),
    );
}

export default function RopeSwingGuides({ length, amplitude, position }) {
    const guides = useMemo(() => {
        const headLength = Math.min(length * 0.06, 0.5);
        const arrows = [-1, 1].map((direction) => {
            const from = direction * amplitude * 0.2;
            const to = direction * amplitude * 0.75;
            const tangent = new Vector3(
                direction * Math.cos(to),
                direction * Math.sin(to),
                0,
            );
            const headPosition = new Vector3(
                ...tipPosition(length, to),
            ).addScaledVector(tangent, -headLength / 2);
            return {
                direction,
                points: arcPoints(length, from, to, 12),
                headPosition,
                headRotation: new Quaternion().setFromUnitVectors(
                    new Vector3(0, 1, 0),
                    tangent,
                ),
            };
        });
        return {
            headLength,
            arrows,
            arc: arcPoints(length, -amplitude, amplitude),
            limits: [-amplitude, amplitude].map((angle) => [
                [0, 0, 0],
                tipPosition(length, angle),
            ]),
        };
    }, [length, amplitude]);

    return (
        // Keep guides outside the moving rigid body so they mark the fixed swing range.
        <group position={position}>
            {guides.limits.map((points, index) => (
                <Line
                    key={index}
                    points={points}
                    color={LIMIT_COLOR}
                    lineWidth={2}
                    depthTest={false}
                    depthWrite={false}
                    toneMapped={false}
                    renderOrder={10}
                    raycast={ignoreRaycast}
                />
            ))}
            <Line
                points={guides.arc}
                color={DIRECTION_COLOR}
                lineWidth={1.5}
                transparent
                opacity={0.45}
                depthTest={false}
                depthWrite={false}
                toneMapped={false}
                renderOrder={10}
                raycast={ignoreRaycast}
            />
            {guides.arrows.map((arrow) => (
                <group key={arrow.direction}>
                    <Line
                        points={arrow.points}
                        color={DIRECTION_COLOR}
                        lineWidth={3}
                        depthTest={false}
                        depthWrite={false}
                        toneMapped={false}
                        renderOrder={11}
                        raycast={ignoreRaycast}
                    />
                    <mesh
                        position={arrow.headPosition}
                        quaternion={arrow.headRotation}
                        renderOrder={11}
                        raycast={ignoreRaycast}
                    >
                        <coneGeometry
                            args={[
                                guides.headLength * 0.4,
                                guides.headLength,
                                12,
                            ]}
                        />
                        <meshBasicMaterial
                            color={DIRECTION_COLOR}
                            depthTest={false}
                            depthWrite={false}
                            toneMapped={false}
                        />
                    </mesh>
                </group>
            ))}
        </group>
    );
}
