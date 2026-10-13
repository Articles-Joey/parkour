import { Physics } from "@react-three/rapier";
import { Canvas, useFrame } from "@react-three/fiber";
import { memo, Suspense, useMemo, useRef } from "react";
import { Sky, Stats } from "@react-three/drei";
import { Object3D } from "three";
import { useParkourStore } from "@/hooks/useParkourStore";
import { useStore } from "@/hooks/useStore";
import { useLevelEditorStore } from "@/hooks/useLevelEditorStore";
import FPV from "./FPV";
import MapObstacle from "./MapObstacle";
import MapEditorControls from "./MapEditorControls";
import { LevelColorSeedContext } from "./Obstacles/platformColor";

function SceneLighting({ editMode }) {
    const sunRef = useRef(null);
    const target = useMemo(() => new Object3D(), []);

    useFrame(({ camera }) => {
        const sun = sunRef.current;
        if (!sun) return;

        // Keep a detailed shadow map around the player throughout the course.
        if (editMode) target.position.copy(camera.position);
        else target.position.fromArray(useParkourStore.getState().position);
        sun.position.copy(target.position);
        sun.position.x += 20;
        sun.position.y += 40;
        sun.position.z += 15;
        target.updateMatrixWorld();
    });

    return (
        <>
            <ambientLight intensity={2.5} />
            <hemisphereLight args={["#e0f2fe", "#c7b89e", 0.8]} />
            <primitive object={target} />
            <directionalLight
                ref={sunRef}
                target={target}
                position={[20, 40, 15]}
                color="#fff4df"
                intensity={2.5}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-left={-24}
                shadow-camera-right={24}
                shadow-camera-top={24}
                shadow-camera-bottom={-24}
                shadow-camera-near={0.5}
                shadow-camera-far={100}
                shadow-bias={-0.0001}
                shadow-normalBias={0.02}
            />
        </>
    );
}

function GameCanvas() {
    const controlType = useParkourStore((state) => state.controlType);
    const debug = useStore((state) => state.debug);
    const darkMode = useStore((state) => state.darkMode);
    const level = useLevelEditorStore((state) => state.level);
    const editMode = useLevelEditorStore((state) => state.editMode);
    const sessionVersion = useLevelEditorStore((state) => state.sessionVersion);
    if (!level) return null;

    return (
        <Canvas
            shadows
            onPointerMissed={() => {
                if (editMode)
                    useLevelEditorStore.getState().selectObstacle(null);
            }}
        >
            {debug && <axesHelper args={[5]} />}
            {process.env.NODE_ENV === "development" && (
                <Stats className="stats-overlay" />
            )}
            <Sky sunPosition={[100, darkMode ? -10 : 10, 20]} />
            <SceneLighting editMode={editMode} />
            {editMode ? (
                <MapEditorControls />
            ) : (
                controlType === "Mouse and Keyboard" && <FPV />
            )}
            <LevelColorSeedContext.Provider value={level.colorSeed}>
                <Suspense fallback={null}>
                    <Physics
                        key={`${sessionVersion}-${editMode}`}
                        paused={editMode}
                        debug={debug && !editMode}
                        gravity={[0, -9.81, 0]}
                        timeStep={1 / 60}
                        updatePriority={-1}
                    >
                        {level.mapObstacles.map((obstacle) => (
                            <MapObstacle
                                key={obstacle.id}
                                obstacle={obstacle}
                                editing={editMode}
                            />
                        ))}
                    </Physics>
                </Suspense>
            </LevelColorSeedContext.Provider>
        </Canvas>
    );
}

export default memo(GameCanvas);
