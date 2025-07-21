import { Debug, Physics, useBox, useCompoundBody, useCylinder, useHingeConstraint, useSphere } from "@react-three/cannon";
import { Canvas, useFrame } from "@react-three/fiber";
import { memo, useEffect, useRef } from "react";
// import { Player } from "./Player";
// import { Sky } from "@react-three/drei";
// import { useParkourStore } from "@/hooks/useParkourStore";
// import FPV from "./FPV";
// import { ModelKennyNLMiniGolfFlagRed } from "@/components/Games/Assets/Kenny/MiniGolf/flag-red";
// import { degToRad } from "three/src/math/MathUtils";

export default function RopeSwing({ args, position, rotation }) {

    const groupRef = useRef();
    const swingSpeed = 2; // Adjust the speed of the swing
    const swingAmplitude = Math.PI / 6; // Adjust the angle range (e.g., 30 degrees)

    const [ref, api] = useCylinder(() => ({
        mass: 0,
        type: 'Dynamic',
        args: args,
        position: position,
    }))

    useFrame(({ clock }) => {
        if (groupRef.current) {
            const time = clock.getElapsedTime();
            // Update rotation on the X-axis to create a back-and-forth motion
            groupRef.current.rotation.z = Math.sin(time * swingSpeed) * swingAmplitude;
        }
    });

    return (
        <group rotation={rotation}>

            <mesh ref={ref} castShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="gray" />
            </mesh>

            <group ref={groupRef} position={position}>
                <mesh position={[0, -args[2] / 2, 0]} castShadow>
                    <cylinderGeometry args={args} />
                    <meshStandardMaterial color="yellow" />
                </mesh>
            </group>

        </group>
    )

}