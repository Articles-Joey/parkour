import {
    CuboidCollider,
    CylinderCollider,
    RigidBody,
    useBeforePhysicsStep,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import { Quaternion, Vector3 } from "three";
import { useParkourStore } from "@/hooks/useParkourStore";

const SWING_SPEED = 2;
const SWING_AMPLITUDE = Math.PI / 6;

export default function RopeSwing({ args, position, rotation }) {
    const rigidBodyRef = useRef(null);
    const initialRotation = useRef(null);
    const elapsedTime = useRef(0);
    const swingAxis = useMemo(() => new Vector3(0, 0, 1), []);
    const swingRotation = useMemo(() => new Quaternion(), []);
    const nextRotation = useMemo(() => new Quaternion(), []);

    useEffect(() => {
        const ropeBody = rigidBodyRef.current;
        return () => {
            const state = useParkourStore.getState();
            if (state.ropeAttachment?.ropeBody === ropeBody) state.releaseRope();
        };
    }, []);

    const handlePlayerContact = ({ other }) => {
        const state = useParkourStore.getState();
        const ropeBody = rigidBodyRef.current;
        if (ropeBody && other.rigidBody === state.rigidBody) {
            state.requestRopeGrab(ropeBody, args[2], args[0]);
        }
    };

    useBeforePhysicsStep((world) => {
        const body = rigidBodyRef.current;
        if (!body) return;

        // Preserve the parent's world rotation, including the second rope's 90-degree turn.
        if (!initialRotation.current) {
            initialRotation.current = new Quaternion().copy(body.rotation());
        }
        elapsedTime.current += world.timestep;
        const angle =
            Math.sin(elapsedTime.current * SWING_SPEED) * SWING_AMPLITUDE;
        swingRotation.setFromAxisAngle(swingAxis, angle);
        nextRotation.copy(initialRotation.current).multiply(swingRotation);
        body.setNextKinematicRotation(nextRotation);
    });

    return (
        <group rotation={rotation}>
            <RigidBody
                type="fixed"
                position={position}
                colliders={false}
            >
                <CuboidCollider
                    args={[0.5, 0.5, 0.5]}
                    friction={0.3}
                />
                <mesh castShadow>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="gray" />
                </mesh>
            </RigidBody>
            <RigidBody
                ref={rigidBodyRef}
                type="kinematicPosition"
                position={position}
                colliders={false}
            >
                <CylinderCollider
                    args={[args[2] / 2, args[0]]}
                    position={[0, -args[2] / 2, 0]}
                    friction={0.3}
                    sensor
                    onIntersectionEnter={handlePlayerContact}
                />
                <mesh
                    position={[0, -args[2] / 2, 0]}
                    castShadow
                >
                    <cylinderGeometry args={args} />
                    <meshStandardMaterial color="yellow" />
                </mesh>
            </RigidBody>
        </group>
    );
}
