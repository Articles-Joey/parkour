import { Physics } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import { memo, Suspense } from "react";
import { Player } from "./Player";
import { Sky } from "@react-three/drei";
import { useParkourStore } from "@/hooks/useParkourStore";
import FPV from "./FPV";
import { ModelKennyNLMiniGolfFlagRed } from "@/components/Models/flag-red";
import { degToRad } from "three/src/math/MathUtils";
import SwingingBall from "./Obstacles/SwingingBall";
import RopeSwing from "./Obstacles/RopeSwing";
import { useStore } from "@/hooks/useStore";
import Platform from "./Obstacles/Platform";
import SpinningPlatform from "./Obstacles/SpinningPlatform";
import DisappearingPlatform from "./Obstacles/DisappearingPlatform";
import GravityPlatform from "./Obstacles/GravityPlatform";
import RotatingLog from "./Obstacles/RotatingLog";
import SpringPlatform from "./Obstacles/SpringPlatform";
import Checkpoint from "./Obstacles/Checkpoint";

// Change this seed to generate a new, repeatable set of platform colors.
const PLATFORM_COLOR_SEED = 1;

function GameCanvas() {
    const controlType = useParkourStore((state) => state.controlType);
    const debug = useStore((state) => state.debug);

    const darkMode = useStore((state) => state.darkMode);

    let gameContent = (
        <>
            <Player />

            {[...Array(10)].map((item, i) => {
                const obstacleKey = `start-platform-${i}`;
                const Obstacle =
                    i === 4
                        ? DisappearingPlatform
                        : i === 7
                          ? GravityPlatform
                          : Platform;
                return (
                    <Obstacle
                        key={obstacleKey}
                        obstacleKey={obstacleKey}
                        colorSeed={PLATFORM_COLOR_SEED}
                        args={[2.5, 0.5, 2.5]}
                        position={[0, 0, 0 + i * -4]}
                    />
                );
            })}

            {[...Array(10)].map((item, i) => {
                const obstacleKey = `climb-platform-${i}`;
                return (
                    <Platform
                        key={obstacleKey}
                        obstacleKey={obstacleKey}
                        colorSeed={PLATFORM_COLOR_SEED}
                        args={[2.5, 0.5, 2.5]}
                        position={[0, i * 0.5, -40 + i * -4]}
                    />
                );
            })}

            <Checkpoint
                key="checkpoint-1"
                name={"1"}
                args={[2.5, 2.5, 2.5]}
                position={[0, 6, -76]}
            />

            <ModelKennyNLMiniGolfFlagRed
                position={[0, 4.5, -76]}
                scale={2}
            />

            {[...Array(10)].map((item, i) => {
                const obstacleKey = `turn-platform-${i}`;
                return (
                    <Platform
                        key={obstacleKey}
                        obstacleKey={obstacleKey}
                        colorSeed={PLATFORM_COLOR_SEED}
                        args={[2.5, 0.5, 2.5]}
                        position={[-5 + i * -6, 5 + i * 0.5, -76]}
                    />
                );
            })}

            <Checkpoint
                key="checkpoint-2"
                name={"2"}
                args={[2.5, 2.5, 2.5]}
                position={[-59, 11, -76]}
            />

            <ModelKennyNLMiniGolfFlagRed
                position={[-59, 9.5, -76]}
                scale={2}
            />

            {[...Array(10)].map((item, i) => {
                const obstacleKey = `spinning-platform-${i}`;
                return (
                    <SpinningPlatform
                        key={obstacleKey}
                        obstacleKey={obstacleKey}
                        colorSeed={PLATFORM_COLOR_SEED}
                        args={[2.5, 0.5, 0.5]}
                        position={[-59, 9.5, -73 - i * -6]}
                    />
                );
            })}

            <group>
                <Platform
                    key="checkpoint-3-platform"
                    obstacleKey="checkpoint-3-platform"
                    colorSeed={PLATFORM_COLOR_SEED}
                    args={[2.5, 0.5, 2.5]}
                    position={[-59, 9.5, -15]}
                />

                <Checkpoint
                    key="checkpoint-3"
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
            <Platform
                key="walkway-platform"
                obstacleKey="walkway-platform"
                colorSeed={PLATFORM_COLOR_SEED}
                args={[47, 0.25, 0.25]}
                position={[-59 + 25, 9.5, -15]}
            />

            {[...Array(7)].map((item, i) => {
                return (
                    <SwingingBall
                        key={`swinging-ball-${i}`}
                        args={[0.1, 0.1, 7, 8]}
                        position={[-14 + i * -6, 18, -15]}
                        i={i}
                    />
                );
            })}

            <group>
                <Platform
                    key="checkpoint-4-platform"
                    obstacleKey="checkpoint-4-platform"
                    colorSeed={PLATFORM_COLOR_SEED}
                    args={[2.5, 0.5, 2.5]}
                    position={[-9, 9.5, -15]}
                />

                <Checkpoint
                    key="checkpoint-4"
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
                key="rope-swing-1"
                position={[0, 18, -15]}
                args={[0.1, 0.1, 9, 8]}
            />

            <Platform
                key="rope-landing-platform"
                obstacleKey="rope-landing-platform"
                colorSeed={PLATFORM_COLOR_SEED}
                args={[2.5, 0.5, 2.5]}
                position={[10, 9.5, -15]}
            />

            <RopeSwing
                key="rope-swing-2"
                rotation={[0, degToRad(90), 0]}
                args={[0.1, 0.1, 9, 8]}
                position={[7.5, 18, 10]}
            />

            <group position={[10, 9.5, 0]}>
                <Platform
                    key="return-platform"
                    obstacleKey="return-platform"
                    colorSeed={PLATFORM_COLOR_SEED}
                    args={[2.5, 0.5, 2.5]}
                    position={[0, 0, 0]}
                />

                <Checkpoint
                    key="return-checkpoint"
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
            <Platform
                key="return-plank-platform"
                obstacleKey="return-plank-platform"
                colorSeed={PLATFORM_COLOR_SEED}
                args={[8, 0.5, 0.5]}
                position={[3.5, 9.5, 0]}
            />

            <GravityPlatform
                key="gravity-platform-near-start"
                obstacleKey="gravity-platform-near-start"
                colorSeed={PLATFORM_COLOR_SEED}
                position={[-2.51, 9.78, -0.03]}
            />

            {[...Array(7)].map((item, i) => {
                return (
                    <DisappearingPlatform
                        key={`disappearing-platform-${i}`}
                        obstacleKey={`disappearing-platform-${i}`}
                        args={[1, 0.1, 1]}
                        position={[-5.55 + i * -2, 9.96, -0.0]}
                        i={i}
                    />
                );
            })}
            <RotatingLog
                key="rotating-log-1"
                obstacleKey="rotating-log-1"
                colorSeed={PLATFORM_COLOR_SEED}
                position={[-24.55, 9.26, 0]}
                radius={0.75}
                length={10}
                pegCount={12}
                seed={7}
                rotationSpeed={0.6}
            />
            <RotatingLog
                key="rotating-log-2"
                obstacleKey="rotating-log-2"
                colorSeed={PLATFORM_COLOR_SEED}
                position={[-36.55, 9.26, 0]}
                radius={0.75}
                length={10}
                pegCount={12}
                seed={7}
                rotationSpeed={1.2}
            />
            <RotatingLog
                key="rotating-log-2"
                obstacleKey="rotating-log-2"
                colorSeed={PLATFORM_COLOR_SEED}
                position={[-48.55, 9.26, 0]}
                radius={0.75}
                length={10}
                pegCount={12}
                seed={7}
                rotationSpeed={2}
            />
            <SpringPlatform
                key="spring-platform-1"
                obstacleKey="spring-platform-1"
                colorSeed={PLATFORM_COLOR_SEED}
                position={[-56, 10, 0]}
                force={15}
            />
            <SpringPlatform
                key="spring-platform-1"
                obstacleKey="spring-platform-1"
                colorSeed={PLATFORM_COLOR_SEED}
                position={[-59, 20, 0]}
                force={15}
            />
            <SpringPlatform
                key="spring-platform-1"
                obstacleKey="spring-platform-1"
                colorSeed={PLATFORM_COLOR_SEED}
                position={[-62, 30, 0]}
                force={15}
            />
        </>
    );

    return (
        <Canvas
        // camera={{ position: [-10, 40, 40], fov: 50 }}
        >
            <Sky sunPosition={[100, darkMode ? -10 : 10, 20]} />
            <ambientLight intensity={2} />

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
