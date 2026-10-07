import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useLevelEditorStore } from "@/hooks/useLevelEditorStore";
import { useParkourStore } from "@/hooks/useParkourStore";

export default function MapEditorControls() {
    const controlsRef = useRef(null);
    const { camera } = useThree();
    const focusVersion = useLevelEditorStore((state) => state.focusVersion);
    const sessionVersion = useLevelEditorStore((state) => state.sessionVersion);

    useEffect(() => {
        const { level, selectedObstacleId } = useLevelEditorStore.getState();
        const selected = level?.mapObstacles.find(
            (item) => item.id === selectedObstacleId,
        );
        const target =
            selected?.props.position ?? useParkourStore.getState().position;
        camera.position.set(target[0] + 12, target[1] + 12, target[2] + 12);
        camera.lookAt(...target);
        controlsRef.current?.target.set(...target);
        controlsRef.current?.update();
    }, [camera, focusVersion, sessionVersion]);

    return (
        <>
            <OrbitControls
                ref={controlsRef}
                makeDefault
                enableDamping
            />
            <gridHelper
                args={[200, 100, "#64748b", "#334155"]}
                position={[0, -0.3, 0]}
            />
        </>
    );
}
