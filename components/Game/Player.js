import { useFrame, useThree } from "@react-three/fiber"
import { useSphere } from "@react-three/cannon"
import { useEffect, useRef } from "react"
import { Vector3 } from "three"
import { useKeyboard } from "@/hooks/useKeyboard"

import { useParkourStore } from '@/hooks/useParkourStore';

const JUMP_FORCE = 4;
const SPEED = 4;

export const Player = () => {

    const { moveBackward, moveForward, moveRight, moveLeft, jump, shift, crouch } = useKeyboard()

    const { camera } = useThree()

    const [ref, api] = useSphere(() => ({
        mass: 1,
        type: 'Dynamic',
        position: [0, 5, 0],
        args: [0.5, 0.5, 0.5]
    }))

    const setPlayer = useParkourStore((state) => state.setPlayer);
    const setPosition = useParkourStore((state) => state.setPosition);
    const position = useParkourStore((state) => state.position);
    const checkpoints = useParkourStore((state) => state.checkpoints);

    useEffect(() => {
        // Save ref and api to the store
        setPlayer(ref, api);

        // Subscribe to the position updates
        const unsubscribe = api.position.subscribe((position) => {
            setPosition([...position]); // Update position in the store
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [ref, api, setPlayer, setPosition]);

    const vel = useRef([0, 0, 0])
    useEffect(() => {
        api.velocity.subscribe((v) => vel.current = v)
    }, [api.velocity])

    const pos = useRef([0, 0, 0])

    useEffect(() => {

        api.position.subscribe((p) => {

            pos.current = p

            if (p[1] < -10) {
                console.log("Y position below 0. Reset player.");

                let latestCheckpoint = [0, 10, 0]

                let updatedCheckpoints = useParkourStore.getState().checkpoints

                updatedCheckpoints.map(checkpoint => {

                    if (checkpoint.locked == false) {
                        console.log("Found unlocked checkpoint!", checkpoint)
                        latestCheckpoint = checkpoint?.location
                    }

                })

                console.log("latestCheckpoint lookup was", latestCheckpoint)

                api.position.set(
                    // 0, 5, 0
                    latestCheckpoint[0],
                    latestCheckpoint[1],
                    latestCheckpoint[2],
                );

                camera.lookAt(0, 0, -50);

                // api.mass.set(0); // Set mass to 0 to deactivate physics
                api.velocity.set(0, 0, 0); // Stop all motion
                // api.angularVelocity.set(0, 0, 0); // Stop rotation
            }

        })

    }, [api.position])

    useEffect(() => {
        console.log("Shift", shift)
    }, [shift])

    // useEffect(() => {
    // 	console.log("pos", pos.current)
    // }, [pos.current])

    useFrame(() => {

        // return

        // camera.position.copy(new Vector3(pos.current[0], (pos.current[1] / (crouch ? 2 : 1)), pos.current[2]))

        // Update the camera position using the global state
        camera.position.copy(
            new Vector3(
                position[0],
                position[1] / (crouch ? 2 : 1), // Adjust height for crouch
                position[2]
            )
        );

        // console.log(pos)

        const direction = new Vector3()

        const frontVector = new Vector3(
            0,
            0,
            (moveBackward ? 1 : 0) - (moveForward ? 1 : 0)
        )

        const sideVector = new Vector3(
            (moveLeft ? 1 : 0) - (moveRight ? 1 : 0),
            0,
            0,
        )

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(SPEED * (shift ? 2 : 1))
            .applyEuler(camera.rotation)

        api.velocity.set(direction.x, vel.current[1], direction.z)

        if (jump && Math.abs(vel.current[1]) < 0.05) {
            api.velocity.set(vel.current[0], JUMP_FORCE, vel.current[2])
        }

    })

    return (
        <mesh ref={ref}></mesh>
    )
}