import { Debug, Physics, useBox, useCompoundBody, useCylinder, useHingeConstraint, useSphere } from "@react-three/cannon";
// import { Canvas, useFrame } from "@react-three/fiber";
import { memo, useEffect, useRef } from "react";
// import { Player } from "./Player";
// import { Sky } from "@react-three/drei";
// import { useParkourStore } from "@/hooks/useParkourStore";
// import FPV from "./FPV";
// import { ModelKennyNLMiniGolfFlagRed } from "@/components/Games/Assets/Kenny/MiniGolf/flag-red";
// import { degToRad } from "three/src/math/MathUtils";

export default function SwingingBall({ args, position, i }) {

    const [ref, api] = useCompoundBody(
        () => ({
            mass: 50,
            type: "Dynamic",
            position,
            // rotation: [degToRad(180), 0, 0],
            shapes: [
                { args: args, position: [0, -3.6, 0], type: 'Cylinder' },
                { args: 1, position: [0, -6.5, 0], type: 'Sphere', mass: 10 }
            ],
            // angularDamping: 0.2,
        }),
        useRef()
    )

    // useEffect(() => {
    //     api.angularVelocity.set(1, 0, 0); // Spins the wheel along the X-axis
    // }, []);

    // Create an anchor (static body) at the pivot point
    // const [anchorRef] = useCompoundBody(() => ({
    //     type: "Static", // The anchor doesn't move
    //     // position, // Same position as the swinging object's pivot
    // }));

    const [anchorRef] = useSphere(() => ({
        args: [0.1],
        position
    }), useRef(null));

    // Add a hinge constraint between the anchor and the swinging object
    useHingeConstraint(anchorRef, ref, {
        pivotA: [0, -0.25, 0], // Attach at the end of the cylinder
        axisA: [1, 0, 0], // Allow rotation along the X-axis
        pivotB: [0, 0, 0],
        axisB: [1, 0, 0],
    });

    useEffect(() => {

        // This is what is needed eventually, back and forth torque swings with damping, can't figure it out right now
        // Apply a small torque to start the pendulum motion
        // api.applyTorque([
        //     i % 2 == 1 ? 80000 : -80000, 
        //     0, 
        //     0
        // ]);

        // This is a constant spin that does not slow down
        api.angularVelocity.set(
            i % 2 == 1 ? 5 : -5,
            0,
            0
        );

    }, [api]);

    // useEffect(() => {
    //     // Limit rotation to simulate a pendulum (optional: apply a constraint)
    //     api.angularVelocity.subscribe((angularVelocity) => {
    //         const maxAngle = Math.PI / 4; // Max swing angle (45 degrees)
    //         const [x] = angularVelocity;
    //         if (x > maxAngle) {
    //             api.angularVelocity.set(maxAngle, 0, 0);
    //         } else if (x < -maxAngle) {
    //             api.angularVelocity.set(-maxAngle, 0, 0);
    //         }
    //     });
    // }, [api]);

    return (
        <group >

            {/* <mesh ref={anchorRef} visible={false} /> */}

            <group>

                <mesh ref={ref}>

                    <mesh position={[0, -args[2] / 2, 0]} castShadow>
                        <cylinderGeometry args={args} />
                        <meshStandardMaterial color="black" />
                    </mesh>

                    <mesh position={[0, -6.5, 0]} castShadow>
                        <sphereGeometry args={[1]} />
                        <meshStandardMaterial color="black" />
                    </mesh>

                </mesh>

            </group>

        </group>
    )

}