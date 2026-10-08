import { useRef } from "react";
import { TransformControls } from "@react-three/drei";
import { Player } from "./Player";
import Text from "./Text";
import Platform from "./Obstacles/Platform";
import SpinningPlatform from "./Obstacles/SpinningPlatform";
import DisappearingPlatform from "./Obstacles/DisappearingPlatform";
import GravityPlatform from "./Obstacles/GravityPlatform";
import RotatingLog from "./Obstacles/RotatingLog";
import SpringPlatform from "./Obstacles/SpringPlatform";
import RopeSwing from "./Obstacles/RopeSwing";
import SwingingBall from "./Obstacles/SwingingBall";
import Checkpoint from "./Obstacles/Checkpoint";
import { ModelKennyNLMiniGolfFlagRed } from "@/components/Models/flag-red";
import { useLevelEditorStore } from "@/hooks/useLevelEditorStore";

const components = {
    Player,
    Text,
    Platform,
    SpinningPlatform,
    DisappearingPlatform,
    GravityPlatform,
    RotatingLog,
    SpringPlatform,
    RopeSwing,
    SwingingBall,
    Checkpoint,
    Flag: ModelKennyNLMiniGolfFlagRed,
};

export default function MapObstacle({ obstacle, editing }) {
    const groupRef = useRef(null);
    const selected = useLevelEditorStore(
        (state) => state.selectedObstacleId === obstacle.id,
    );
    const transformMode = useLevelEditorStore((state) => state.transformMode);
    const { position, rotation, ...props } = obstacle.props;
    const Component = components[obstacle.component];
    // Remount physics bodies after edits so parent transforms are applied.
    const componentKey = JSON.stringify(obstacle.props);

    const commitTransform = () => {
        const group = groupRef.current;
        if (!group) return;
        const rounded = (values) =>
            values.map((value) => Math.round(value * 1000000) / 1000000);
        useLevelEditorStore.getState().updateObstacleProps(obstacle.id, {
            position: rounded(group.position.toArray()),
            rotation: rounded(group.rotation.toArray().slice(0, 3)),
        });
    };

    // The moving avatar uses world coordinates; its editor marker represents the spawn.
    if (!editing && obstacle.component === "Player")
        return <Player position={position} />;

    return (
        <>
            <group
                ref={groupRef}
                position={position}
                rotation={rotation}
                onClick={
                    editing
                        ? (event) => {
                              event.stopPropagation();
                              useLevelEditorStore
                                  .getState()
                                  .selectObstacle(obstacle.id);
                          }
                        : undefined
                }
            >
                {editing && obstacle.component === "Player" ? (
                    <mesh>
                        <capsuleGeometry args={[0.25, 0.5, 4, 12]} />
                        <meshStandardMaterial
                            color="#38bdf8"
                            wireframe
                        />
                    </mesh>
                ) : (
                    <Component
                        key={componentKey}
                        {...props}
                        position={[0, 0, 0]}
                        rotation={[0, 0, 0]}
                        obstacleKey={obstacle.id}
                        checkpointId={obstacle.id}
                    />
                )}
            </group>
            {editing && selected && (
                <TransformControls
                    object={groupRef}
                    mode={transformMode}
                    onMouseUp={commitTransform}
                />
            )}
        </>
    );
}
