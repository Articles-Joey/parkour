import { Physics } from "@react-three/rapier";
import { Canvas } from "@react-three/fiber";
import { memo, Suspense } from "react";
import { Sky } from "@react-three/drei";
import { useParkourStore } from "@/hooks/useParkourStore";
import { useStore } from "@/hooks/useStore";
import { useLevelEditorStore } from "@/hooks/useLevelEditorStore";
import FPV from "./FPV";
import MapObstacle from "./MapObstacle";
import MapEditorControls from "./MapEditorControls";
import { LevelColorSeedContext } from "./Obstacles/platformColor";

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
            onPointerMissed={() => {
                if (editMode)
                    useLevelEditorStore.getState().selectObstacle(null);
            }}
        >
            <Sky sunPosition={[100, darkMode ? -10 : 10, 20]} />
            <ambientLight intensity={2} />
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
