import { Debug, Physics, useBox, useCompoundBody, useCylinder, useHingeConstraint, useSphere } from "@react-three/cannon";
import { Canvas, useFrame } from "@react-three/fiber";
import { memo, useEffect, useRef, useState } from "react";
import { Player } from "./Player";
import { Sky } from "@react-three/drei";
import { useParkourStore } from "@/hooks/useParkourStore";
import FPV from "./FPV";
import { ModelKennyNLMiniGolfFlagRed } from "@/components/Models/flag-red";
import { degToRad } from "three/src/math/MathUtils";
import SwingingBall from "./SwingingBall";
import RopeSwing from "./RopeSwing";

function GameCanvas(props) {

    const {
        controlType,
        debug
    } = useParkourStore(state => ({
        controlType: state.controlType,
        debug: state.debug
    }))

    let gameContent = (
        <>
            <Player />

            {[...Array(10)].map((item, i) => {
                return (
                    <Ground
                        key={i}
                        args={[2.5, 0.5, 2.5]}
                        position={[0, 0, 0 + (i * -4)]}
                    />
                )
            })}

            {[...Array(10)].map((item, i) => {
                return (
                    <Ground
                        key={i}
                        args={[2.5, 0.5, 2.5]}
                        position={[0, (i * 0.5), -40 + (i * -4)]}
                    />
                )
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
                        position={[-5 + (i * -6), 5 + (i * 0.5), -76]}
                    />
                )
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
                        args={[2.5, 0.5, .5]}
                        position={[
                            -59,
                            9.5,
                            -73 - (i * -6)
                        ]}
                    />
                )
            })}

            <group>
                <Ground
                    args={[2.5, 0.5, 2.5]}
                    position={[
                        -59,
                        9.5,
                        -15
                    ]}
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
                position={[
                    -59 + 25,
                    9.5,
                    -15
                ]}
            />

            {[...Array(7)].map((item, i) => {
                return (
                    <SwingingBall
                        key={i}
                        args={[0.1, 0.1, 7, 8]}
                        position={[-14 + (i * -6), 18, -15]}
                        i={i}
                    />
                )
            })}

            <group>
                <Ground
                    args={[2.5, 0.5, 2.5]}
                    position={[
                        -9,
                        9.5,
                        -15
                    ]}
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
                position={[
                    0,
                    18,
                    -15
                ]}
                args={[0.1, 0.1, 8, 8]}
            />

            <Ground
                args={[2.5, 0.5, 2.5]}
                position={[
                    10,
                    9.5,
                    -15
                ]}
            />

            <RopeSwing
                rotation={[0, degToRad(90), 0]}
                args={[0.1, 0.1, 8, 8]}
                position={[
                    7.5,
                    18,
                    12.5
                ]}
            />

            <group
                position={[
                    10,
                    9.5,
                    0
                ]}
            >
                <Ground
                    args={[2.5, 0.5, 2.5]}
                    position={[
                        0,
                        0,
                        0
                    ]}
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
                position={[
                    5,
                    10,
                    0
                ]}
            />
        </>
    )

    let physicsContent
    if (debug) {
        physicsContent = (
            <Debug>
                {gameContent}
            </Debug>
        )
    } else {
        physicsContent = (
            gameContent
        )
    }

    return (
        <Canvas
        // camera={{ position: [-10, 40, 40], fov: 50 }}
        >

            <Sky sunPosition={[100, 100, 20]} />
            <ambientLight intensity={1} />

            {controlType == "Mouse and Keyboard" &&
                <FPV
                // location={location}
                // setLocation={setLocation}
                // menuOpen={menuOpen}
                />
            }

            <Physics>
                {physicsContent}
            </Physics>

        </Canvas>
    )

}

export default memo(GameCanvas)

function Ground({ args, position, disappearing }) {

    const [activated, setActivated] = useState(false);
    const [hasDisappeared, setHasDisappeared] = useState(false);

    const [ref, api] = useBox(() => ({
        mass: 0,
        type: 'Static',
        args: args,
        position: position,
        onCollide: () => {
            if (disappearing) {

                setActivated(true)

                setTimeout(() => {
                    setHasDisappeared(true)
                }, 1000)

            }
        }
    }))

    useEffect(() => {

        if (hasDisappeared) {
            setTimeout(() => {
                setActivated(false)
                setHasDisappeared(false)
            }, 5000)
        }

    }, [hasDisappeared])

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={args} />
            {/* <BeachBall /> */}
            <meshStandardMaterial color="gray" />
        </mesh>
    )

}

function Wheel({ args, position }) {

    const [ref, api] = useBox(() => ({
        mass: 0,
        type: 'Dynamic',
        args: args,
        position: position,
    }))

    useEffect(() => {
        api.angularVelocity.set(0, 1, 0); // Spins the wheel along the X-axis
    }, []);

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={args} />
            {/* <BeachBall /> */}
            <meshStandardMaterial color="gray" />
        </mesh>
    )

}

function Checkpoint({ args, position, name }) {

    const {
        checkpoints,
        setCheckpoints
    } = useParkourStore()

    const [ref, api] = useBox(() => ({
        mass: 0,
        isTrigger: true,
        args: args,
        position: position,
        onCollide: () => {
            console.log(`Checkpoint ${name} was collided with!`)

            let newCheckpoints = checkpoints

            newCheckpoints = newCheckpoints.map(obj => {

                if (obj.name == name) {
                    return {
                        ...obj,
                        locked: false
                    }
                } else {
                    return obj
                }

            })

            setCheckpoints(newCheckpoints)
        }
    }))

    return (
        <mesh ref={ref} castShadow>
            <boxGeometry args={args} />
            {/* <BeachBall /> */}
            <meshStandardMaterial transparent={true} opacity={0.5} color="red" />
        </mesh>
    )

}

function Cylinder(props) {
    const [ref, api] = useCylinder(
        () => ({
            args: [1, 1, 2, 8],
            mass: 0,
            ...props
        }),
        useRef()
    )

    return (
        <mesh ref={ref} castShadow onPointerDown={() => api.velocity.set(0, 5, 0)}>
            <cylinderGeometry args={[1, 1, 2, 8]} />
            <meshNormalMaterial />
        </mesh>
    )
}