import {
    CylinderCollider,
    RigidBody,
    useBeforePhysicsStep,
} from "@react-three/rapier";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import {
    DoubleSide,
    Quaternion,
    RepeatWrapping,
    SRGBColorSpace,
    Vector3,
} from "three";
import { usePlatformColor } from "./platformColor";

const LOG_AXIS = new Vector3(0, 1, 0);
const FULL_TURN = Math.PI * 2;

function createSeededRandom(seed) {
    const input = String(seed);
    let state = 2166136261;
    for (let i = 0; i < input.length; i++) {
        state = Math.imul(state ^ input.charCodeAt(i), 16777619);
    }

    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let value = Math.imul(state ^ (state >>> 15), state | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

// Length runs along local X. Rotate the whole obstacle to change its heading.
export default function RotatingLog({
    position,
    rotation,
    radius = 0.75,
    length = 10,
    pegCount = 8,
    seed = 1,
    pegLength = 0.65,
    pegRadius = 0.12,
    rotationSpeed = 0.6, // Radians per second; negative reverses, zero stops.
    obstacleKey = "rotating-log",
    color = "#805238",
}) {
    const bodyRef = useRef(null);
    const baseRotation = useRef(null);
    const angle = useRef(0);
    const spinRotation = useMemo(() => new Quaternion(), []);
    const nextRotation = useMemo(() => new Quaternion(), []);
    const logRadius = Math.max(0.05, radius);
    const logLength = Math.max(0.1, length);
    const pinRadius = Math.max(0.02, pegRadius);
    const pinLength = Math.max(0.05, pegLength);
    const embedDepth = Math.min(pinRadius, logRadius * 0.2);
    const pinHeight = pinLength + embedDepth;
    const count = Math.max(0, Math.floor(pegCount));
    const logColor = usePlatformColor(obstacleKey, color);

    const pegs = useMemo(() => {
        const random = createSeededRandom(seed);
        const endMargin = Math.min(
            logLength / 4,
            Math.max(logRadius, pinRadius * 2),
        );
        const usableLength = logLength - endMargin * 2;
        const distance = logRadius + (pinLength - embedDepth) / 2;
        const orientation = new Quaternion();

        return Array.from({ length: count }, (_, index) => {
            // Jitter within successive sections spreads pegs along the whole log.
            const axialPosition =
                ((index + random()) / count - 0.5) * usableLength;
            const pegAngle = random() * FULL_TURN;
            const outward = new Vector3(
                Math.sin(pegAngle),
                0,
                Math.cos(pegAngle),
            );
            orientation.setFromUnitVectors(LOG_AXIS, outward);
            return {
                key: `${obstacleKey}-peg-${index}`,
                position: [
                    outward.x * distance,
                    axialPosition,
                    outward.z * distance,
                ],
                quaternion: orientation.toArray(),
            };
        });
    }, [
        seed,
        count,
        logLength,
        logRadius,
        pinRadius,
        pinLength,
        embedDepth,
        obstacleKey,
    ]);

    const source = useTexture("/textures/log-grain.svg");
    const grain = useMemo(() => {
        const texture = source.clone();
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(2, logLength / (Math.PI * logRadius));
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = 8;
        texture.needsUpdate = true;
        return texture;
    }, [source, logLength, logRadius]);

    useEffect(() => () => grain.dispose(), [grain]);

    useBeforePhysicsStep((world) => {
        const body = bodyRef.current;
        if (!body) return;
        if (!baseRotation.current) {
            baseRotation.current = new Quaternion().copy(body.rotation());
        }
        angle.current =
            (angle.current + rotationSpeed * world.timestep) % FULL_TURN;
        spinRotation.setFromAxisAngle(LOG_AXIS, angle.current);
        nextRotation.copy(baseRotation.current).multiply(spinRotation);
        body.setNextKinematicRotation(nextRotation);
    });

    return (
        <group
            position={position}
            rotation={rotation}
        >
            <RigidBody
                ref={bodyRef}
                type="kinematicPosition"
                rotation={[0, 0, -Math.PI / 2]}
                colliders={false}
                userData={{ parkourRotatingLog: true }}
            >
                <CylinderCollider
                    args={[logLength / 2, logRadius]}
                    friction={0.3}
                />
                <mesh
                    castShadow
                    receiveShadow
                >
                    <cylinderGeometry
                        args={[logRadius, logRadius, logLength, 48]}
                    />
                    <meshStandardMaterial
                        attach="material-0"
                        color={logColor}
                        map={grain}
                        bumpMap={grain}
                        bumpScale={logRadius * 0.015}
                        roughness={0.9}
                    />
                    <meshStandardMaterial
                        attach="material-1"
                        color={logColor}
                        roughness={0.95}
                    />
                    <meshStandardMaterial
                        attach="material-2"
                        color={logColor}
                        roughness={0.95}
                    />
                </mesh>
                {[-1, 1].flatMap((end) =>
                    [1, 2, 3].map((ring) => (
                        <mesh
                            key={`grain-ring-${end}-${ring}`}
                            position={[0, end * (logLength / 2 + 0.003), 0]}
                            rotation={[Math.PI / 2, 0, 0]}
                        >
                            <ringGeometry
                                args={[
                                    logRadius * ring * 0.22,
                                    logRadius * (ring * 0.22 + 0.015),
                                    48,
                                ]}
                            />
                            <meshStandardMaterial
                                color="#65462a"
                                side={DoubleSide}
                                roughness={1}
                            />
                        </mesh>
                    )),
                )}
                {pegs.map((peg) => (
                    <group
                        key={peg.key}
                        position={peg.position}
                        quaternion={peg.quaternion}
                    >
                        {/* Pegs are solid colliders on the same rotating body. */}
                        <CylinderCollider
                            args={[pinHeight / 2, pinRadius]}
                            friction={0.3}
                        />
                        <mesh
                            castShadow
                            receiveShadow
                        >
                            <cylinderGeometry
                                args={[pinRadius, pinRadius, pinHeight, 12]}
                            />
                            <meshStandardMaterial
                                color="#67432c"
                                roughness={0.85}
                            />
                        </mesh>
                        <mesh
                            position={[0, pinHeight / 2 - pinRadius * 0.3, 0]}
                        >
                            <cylinderGeometry
                                args={[
                                    pinRadius * 1.01,
                                    pinRadius * 1.01,
                                    pinRadius * 0.6,
                                    12,
                                ]}
                            />
                            <meshStandardMaterial
                                color="#9a7254"
                                roughness={0.7}
                            />
                        </mesh>
                    </group>
                ))}
            </RigidBody>
        </group>
    );
}
