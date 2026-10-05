import { CuboidCollider, Physics, RigidBody } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import { memo, Suspense, useEffect, useMemo, useState } from "react";
import { Player } from "./Player";
import { Sky } from "@react-three/drei";
import { useParkourStore } from "@/hooks/useParkourStore";
import FPV from "./FPV";
import { ModelKennyNLMiniGolfFlagRed } from "@/components/Models/flag-red";
import { degToRad } from "three/src/math/MathUtils";
import SwingingBall from "./SwingingBall";
import RopeSwing from "./RopeSwing";
import { useStore } from "@/hooks/useStore";

function GameCanvas() {
    const controlType = useParkourStore((state) => state.controlType);
    const debug = useParkourStore((state) => state.debug);

    const darkMode = useStore((state) => state.darkMode);

    let gameContent = (
        <>
            <Player />

            {[...Array(10)].map((item, i) => {
                return (
                    <Ground
                        key={i}
                        args={[2.5, 0.5, 2.5]}
                        position={[0, 0, 0 + i * -4]}
                    />
                );
            })}

            {[...Array(10)].map((item, i) => {
                return (
                    <Ground
                        key={i}
                        args={[2.5, 0.5, 2.5]}
                        position={[0, i * 0.5, -40 + i * -4]}
                    />
                );
            })}

            <Checkpoint
                name={"1"}
                args={[2.5, 2.5, 2.5]}
                position={[0, 6, -76]}
            />

            <ModelKennyNLMiniGolfFlagRed
                position={[0, 4.5, -76]}
                scale={2}
            />

            {[...Array(10)].map((item, i) => {
                return (
                    <Ground
                        key={i}
                        args={[2.5, 0.5, 2.5]}
                        position={[-5 + i * -6, 5 + i * 0.5, -76]}
                    />
                );
            })}

            <Checkpoint
                name={"2"}
                args={[2.5, 2.5, 2.5]}
                position={[-59, 11, -76]}
            />

            <ModelKennyNLMiniGolfFlagRed
                position={[-59, 9.5, -76]}
                scale={2}
            />

            {/* {[...Array(10)].map((item, i) => {
    return (
        <Ground
            key={i}
            args={[.5, 0.5, 2.5]}
            position={[
                -59,
                9.5,
                -76 - (i * -6)
            ]}
        />
    )
})} */}

            {[...Array(10)].map((item, i) => {
                return (
                    <Wheel
                        key={i}
                        args={[2.5, 0.5, 0.5]}
                        position={[-59, 9.5, -73 - i * -6]}
                    />
                );
            })}

            <group>
                <Ground
                    args={[2.5, 0.5, 2.5]}
                    position={[-59, 9.5, -15]}
                />

                <Checkpoint
                    name={"3"}
                    args={[2.5, 2.5, 2.5]}
                    position={[-59, 11, -15]}
                />

                <ModelKennyNLMiniGolfFlagRed
                    position={[-59, 9.5, -15]}
                    scale={2}
                />
            </group>

            {/* Walkway */}
            <Ground
                args={[50, 0.5, 0.5]}
                position={[-59 + 25, 9.5, -15]}
            />

            {[...Array(7)].map((item, i) => {
                return (
                    <SwingingBall
                        key={i}
                        args={[0.1, 0.1, 7, 8]}
                        position={[-14 + i * -6, 18, -15]}
                        i={i}
                    />
                );
            })}

            <group>
                <Ground
                    args={[2.5, 0.5, 2.5]}
                    position={[-9, 9.5, -15]}
                />

                <Checkpoint
                    name={"4"}
                    args={[2.5, 2.5, 2.5]}
                    position={[-9, 11, -15]}
                />

                <ModelKennyNLMiniGolfFlagRed
                    position={[-9, 9.5, -15]}
                    scale={2}
                />
            </group>

            <RopeSwing
                position={[0, 18, -15]}
                args={[0.1, 0.1, 9, 8]}
            />

            <Ground
                args={[2.5, 0.5, 2.5]}
                position={[10, 9.5, -15]}
            />

            <RopeSwing
                rotation={[0, degToRad(90), 0]}
                args={[0.1, 0.1, 9, 8]}
                position={[7.5, 18, 12.5]}
            />

            <group position={[10, 9.5, 0]}>
                <Ground
                    args={[2.5, 0.5, 2.5]}
                    position={[0, 0, 0]}
                />

                <Checkpoint
                    name={"4"}
                    args={[2.5, 2.5, 2.5]}
                    position={[0, 1.5, 0]}
                />

                <ModelKennyNLMiniGolfFlagRed
                    position={[0, 0, 0]}
                    scale={2}
                />
            </group>

            {/* Plank back to start */}
            <Ground
                args={[10, 0.5, 0.5]}
                position={[5, 10, 0]}
            />
        </>
    );

    return (
        <Canvas
        // camera={{ position: [-10, 40, 40], fov: 50 }}
        >
            <Sky sunPosition={[100, darkMode ? -10 : 10, 20]} />
            <ambientLight intensity={1} />

            {controlType == "Mouse and Keyboard" && (
                <FPV
                // location={location}
                // setLocation={setLocation}
                // menuOpen={menuOpen}
                />
            )}

            <Suspense fallback={null}>
                <Physics
                    debug={debug}
                    gravity={[0, -9.81, 0]}
                    timeStep={1 / 60}
                    updatePriority={-1}
                >
                    {gameContent}
                </Physics>
            </Suspense>
        </Canvas>
    );
}

export default memo(GameCanvas);

function Ground({ args, position, disappearing }) {
    const [activated, setActivated] = useState(false);
    const [hasDisappeared, setHasDisappeared] = useState(false);

    useEffect(() => {
        if (!activated) return;
        const timeout = setTimeout(
            () => {
                if (hasDisappeared) {
                    setActivated(false);
                    setHasDisappeared(false);
                } else {
                    setHasDisappeared(true);
                }
            },
            hasDisappeared ? 5000 : 1000,
        );
        return () => clearTimeout(timeout);
    }, [activated, hasDisappeared]);

    return (
        <RigidBody
            type="fixed"
            position={position}
            colliders={false}
            onCollisionEnter={() => {
                if (disappearing) setActivated(true);
            }}
        >
            {!hasDisappeared && (
                <CuboidCollider
                    args={args.map((size) => size / 2)}
                    friction={0.3}
                />
            )}
            <mesh
                castShadow
                visible={!hasDisappeared}
            >
                <boxGeometry args={args} />
                <meshStandardMaterial color="gray" />
            </mesh>
        </RigidBody>
    );
}

function Wheel({ args, position }) {
    const [angularSpeed] = useState(() => 0.9 + Math.random() * 0.2);
    const angularVelocity = useMemo(() => [0, angularSpeed, 0], [angularSpeed]);

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
                <meshStandardMaterial color="gray" />
            </mesh>
        </RigidBody>
    );
}

function Checkpoint({ args, position, name }) {
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
