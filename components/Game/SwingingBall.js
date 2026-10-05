import {
    BallCollider,
    CylinderCollider,
    RigidBody,
    useRevoluteJoint,
} from "@react-three/rapier";
import { useRef } from "react";

export default function SwingingBall({ args, position, i }) {
    const anchorRef = useRef(null);
    const rigidBodyRef = useRef(null);

    // Both anchors are local to their bodies; the joint only permits X-axis rotation.
    useRevoluteJoint(anchorRef, rigidBodyRef, [
        [0, -0.25, 0],
        [0, 0, 0],
        [1, 0, 0],
    ]);

    return (
        <>
            <RigidBody
                ref={anchorRef}
                type="fixed"
                position={position}
                colliders={false}
            >
                <BallCollider
                    args={[0.1]}
                    friction={0.3}
                />
            </RigidBody>
            <RigidBody
                ref={rigidBodyRef}
                position={position}
                colliders={false}
                angularVelocity={[i % 2 === 1 ? 5 : -5, 0, 0]}
                angularDamping={0.01}
                canSleep={false}
                ccd
            >
                {/* Collider dimensions use half-height and radius, unlike cylinderGeometry. */}
                <CylinderCollider
                    args={[args[2] / 2, args[0]]}
                    position={[0, -3.6, 0]}
                    mass={40}
                    friction={0.3}
                />
                <BallCollider
                    args={[1]}
                    position={[0, -6.5, 0]}
                    mass={10}
                    friction={0.3}
                />
                <mesh
                    position={[0, -args[2] / 2, 0]}
                    castShadow
                >
                    <cylinderGeometry args={args} />
                    <meshStandardMaterial color="black" />
                </mesh>
                <mesh
                    position={[0, -6.5, 0]}
                    castShadow
                >
                    <sphereGeometry args={[1]} />
                    <meshStandardMaterial color="black" />
                </mesh>
            </RigidBody>
        </>
    );
}
