import { useFrame, useThree } from "@react-three/fiber";
import {
    CapsuleCollider,
    RigidBody,
    useAfterPhysicsStep,
    useBeforePhysicsStep,
    useRapier,
} from "@react-three/rapier";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Quaternion, Vector3 } from "three";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useParkourStore } from "@/hooks/useParkourStore";
import { useStore } from "@/hooks/useStore";
import useTouchControlsStore from "@/hooks/useTouchControlsStore";
import SpacesuitModel from "@/components/Models/Spacesuit";
import { SPRINT_SPEED_MULTIPLIER } from "./sprintSettings";
import { getGroundSupport } from "./groundSupport";

const JUMP_FORCE = 4;
const SPEED = 4;
const FLY_SPEED = 8;
const PLAYER_MASS = 1;
const PLAYER_COLLISION_GROUPS = 0xffffffff;
const CONTROLLER_DEADZONE = 0.15;
const LOOK_SENSITIVITY = 0.04;
const THIRD_PERSON_MIN_DISTANCE = 2;
const THIRD_PERSON_MAX_DISTANCE = 20;
const THIRD_PERSON_HEIGHT = 0.5;
const GROUND_Y = -1;
const CAMERA_GROUND_OFFSET = 0.3;
const SCROLL_SENSITIVITY = 0.5;
const ROPE_CLIMB_SPEED = 2.5;
const ROPE_TOP_MARGIN = 1;
const ROPE_BOTTOM_MARGIN = 0.45;

function PlayerBase() {
    const {
        moveBackward,
        moveForward,
        moveRight,
        moveLeft,
        jump,
        shift,
        crouch,
        cameraView,
    } = useKeyboard();
    const { camera, gl } = useThree();
    const { rapier } = useRapier();
    const rigidBodyRef = useRef(null);
    const visualRef = useRef(null);
    const modelRef = useRef(null);
    const prevCameraView = useRef(false);
    const prevControllerView = useRef(false);
    const groundedSteps = useRef(0);
    const isJumping = useRef(false);
    const elapsedTime = useRef(0);
    const lastJumpTime = useRef(0);
    const prevJumpInput = useRef(false);
    const lastTeleportVersion = useRef(
        useParkourStore.getState().teleportVersion,
    );
    const ropeJumpActive = useRef(false);
    const appliedFlightState = useRef({ body: null, flying: null });
    const direction = useMemo(() => new Vector3(), []);
    const ropeJumpMomentum = useMemo(() => new Vector3(), []);
    const downhillVelocity = useMemo(() => new Vector3(), []);
    const surfaceNormal = useMemo(() => new Vector3(), []);
    const surfaceOffset = useMemo(() => new Vector3(), []);
    const ropeRotation = useMemo(() => new Quaternion(), []);
    const playerPosition = useMemo(() => new Vector3(), []);
    const playerCenter = useMemo(() => new Vector3(), []);
    const forward = useMemo(() => new Vector3(), []);
    const cameraPosition = useMemo(() => new Vector3(), []);
    const [animation, setAnimation] = useState({ action: "Idle", speed: 1 });
    const animationRef = useRef(animation);
    const updateAnimation = (action, speed = 1) => {
        if (
            animationRef.current.action === action &&
            animationRef.current.speed === speed
        )
            return;
        const nextAnimation = { action, speed };
        animationRef.current = nextAnimation;
        setAnimation(nextAnimation);
    };
    const isThirdPerson = useParkourStore((state) => state.isThirdPerson);
    const setPlayer = useParkourStore((state) => state.setPlayer);
    const setPosition = useParkourStore((state) => state.setPosition);
    const teleportPlayer = useParkourStore((state) => state.teleportPlayer);
    const touchControlsEnabled = useTouchControlsStore(
        (state) => state.enabled,
    );
    const touchControls = useTouchControlsStore((state) => state.touchControls);

    useEffect(() => {
        setPlayer(rigidBodyRef.current);
        camera.rotation.set(0, 0, 0, "YXZ");
        return () => setPlayer(null);
    }, [camera, setPlayer]);

    // Like Tag, toggle on the press edge so holding V does not switch repeatedly.
    useEffect(() => {
        const pressed =
            cameraView || (touchControlsEnabled && touchControls.cameraView);
        if (pressed && !prevCameraView.current) {
            useParkourStore.getState().toggleThirdPerson();
        }
        prevCameraView.current = pressed;
    }, [cameraView, touchControlsEnabled, touchControls.cameraView]);

    useEffect(() => {
        const handleWheel = (event) => {
            const state = useParkourStore.getState();
            if (!state.isThirdPerson) return;
            state.setCameraDistance(
                Math.min(
                    THIRD_PERSON_MAX_DISTANCE,
                    Math.max(
                        THIRD_PERSON_MIN_DISTANCE,
                        state.cameraDistance +
                            event.deltaY * SCROLL_SENSITIVITY * 0.01,
                    ),
                ),
            );
        };
        const canvas = gl.domElement;
        canvas.addEventListener("wheel", handleWheel, { passive: true });
        return () => canvas.removeEventListener("wheel", handleWheel);
    }, [gl]);

    useBeforePhysicsStep((world) => {
        const body = rigidBodyRef.current;
        if (!body) return;
        const collider = body.collider(0);
        if (!collider) return;
        elapsedTime.current += world.timestep;

        const store = useParkourStore.getState();
        const { debug, flyMode } = useStore.getState();
        const flying = debug && flyMode;
        const gravityScale = flying ? 0 : 1;
        const collisionGroups = flying ? 0 : PLAYER_COLLISION_GROUPS;
        const modeChanged =
            appliedFlightState.current.body !== body ||
            appliedFlightState.current.flying !== flying;
        const physicsOutOfSync =
            body.bodyType() !== rapier.RigidBodyType.Dynamic ||
            body.gravityScale() !== gravityScale ||
            !body.isEnabled() ||
            !collider.isEnabled() ||
            collider.collisionGroups() !== collisionGroups ||
            body.mass() <= 0;

        if (modeChanged || physicsOutOfSync) {
            if (flying) store.releaseRope();

            // Keep the collider enabled so its mass is initialized even when
            // persisted fly mode is active before the first physics step.
            // Filtering collisions permits flight through the map without
            // changing the player into a kinematic or massless body.
            body.setEnabled(true);
            collider.setEnabled(true);
            collider.setCollisionGroups(collisionGroups);
            collider.setMass(PLAYER_MASS);
            body.setBodyType(rapier.RigidBodyType.Dynamic, true);
            body.setEnabledTranslations(true, true, true, true);
            body.recomputeMassPropertiesFromColliders();
            body.setGravityScale(gravityScale, true);
            body.wakeUp();

            if (modeChanged) {
                body.setLinvel({ x: 0, y: 0, z: 0 }, true);
                groundedSteps.current = 0;
                isJumping.current = false;
                ropeJumpActive.current = false;
                ropeJumpMomentum.set(0, 0, 0);
                downhillVelocity.set(0, 0, 0);
            }
            appliedFlightState.current = { body, flying };
        }
        if (store.teleportVersion !== lastTeleportVersion.current) {
            lastTeleportVersion.current = store.teleportVersion;
            groundedSteps.current = 0;
            isJumping.current = false;
            ropeJumpActive.current = false;
            ropeJumpMomentum.set(0, 0, 0);
            downhillVelocity.set(0, 0, 0);
        }

        let forwardInput = (moveBackward ? 1 : 0) - (moveForward ? 1 : 0);
        let sideInput = (moveRight ? 1 : 0) - (moveLeft ? 1 : 0);
        let sprintInput = shift;
        let jumpInput = jump;
        let descendInput = crouch;
        let rotationX = 0;
        let rotationY = 0;

        if (touchControlsEnabled) {
            forwardInput +=
                (touchControls.down ? 1 : 0) - (touchControls.up ? 1 : 0);
            sideInput +=
                (touchControls.right ? 1 : 0) - (touchControls.left ? 1 : 0);
            forwardInput -= touchControls.moveY || 0;
            sideInput += touchControls.moveX || 0;
            sprintInput ||= touchControls.sprint;
            jumpInput ||= touchControls.jump;
            descendInput ||= touchControls.crouch;
            rotationY -= (touchControls.lookX || 0) * LOOK_SENSITIVITY;
            rotationX += (touchControls.lookY || 0) * LOOK_SENSITIVITY;
        }

        const gamepad = navigator.getGamepads?.()[0];
        if (gamepad) {
            const [moveX = 0, moveY = 0, lookX = 0, lookY = 0] = gamepad.axes;
            if (Math.abs(moveX) > CONTROLLER_DEADZONE) sideInput += moveX;
            if (Math.abs(moveY) > CONTROLLER_DEADZONE) forwardInput += moveY;
            if (Math.abs(lookX) > CONTROLLER_DEADZONE)
                rotationY -= lookX * LOOK_SENSITIVITY;
            if (Math.abs(lookY) > CONTROLLER_DEADZONE)
                rotationX -= lookY * LOOK_SENSITIVITY;
            jumpInput ||= gamepad.buttons[0]?.pressed;
            descendInput ||= gamepad.buttons[1]?.pressed;
            sprintInput ||=
                gamepad.buttons[7]?.pressed || gamepad.buttons[7]?.value > 0.1;
        }

        const jumpPressed = !!jumpInput && !prevJumpInput.current;
        prevJumpInput.current = !!jumpInput;

        // Tag's controller sensitivity is measured per 60 Hz frame.
        const lookStep = world.timestep * 60;
        camera.rotation.y += rotationY * lookStep;
        camera.rotation.x = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, camera.rotation.x + rotationX * lookStep),
        );

        const moving = forwardInput !== 0 || sideInput !== 0;
        if (flying) {
            store.updateSprint(false, world.timestep);
            direction
                .set(sideInput, 0, forwardInput)
                .applyEuler(camera.rotation);
            direction.y += (jumpInput ? 1 : 0) - (descendInput ? 1 : 0);
            direction
                .normalize()
                .multiplyScalar(FLY_SPEED * (sprintInput ? 2 : 1));
            body.setLinvel(direction, true);
            updateAnimation(direction.lengthSq() > 0 ? "Walk" : "Idle");
            return;
        }
        const isSprinting = store.updateSprint(
            !!sprintInput && moving && !store.ropeAttachment,
            world.timestep,
        );
        direction
            .set(sideInput, 0, forwardInput)
            .normalize()
            .applyEuler(camera.rotation);
        // Match Tag: looking up or down must not reduce horizontal movement speed.
        direction.y = 0;
        direction
            .normalize()
            .multiplyScalar(
                SPEED * (isSprinting ? SPRINT_SPEED_MULTIPLIER : 1),
            );

        const attachment = store.ropeAttachment;
        if (attachment) {
            const { ropeBody, length } = attachment;
            if (
                !ropeBody.isValid() ||
                (attachment.joint && !attachment.joint.isValid())
            ) {
                store.releaseRope();
            } else {
                if (!attachment.joint) {
                    // Keep the grab height in rope-local space, including rotated ropes.
                    const anchor = new Vector3()
                        .copy(body.translation())
                        .sub(ropeBody.translation())
                        .applyQuaternion(
                            ropeRotation.copy(ropeBody.rotation()).invert(),
                        );
                    anchor.y = Math.max(
                        -length + ROPE_BOTTOM_MARGIN,
                        Math.min(-ROPE_TOP_MARGIN, anchor.y),
                    );
                    // Attach to the rope's centerline rather than the capsule's edge.
                    anchor.x = 0;
                    anchor.z = 0;
                    const grabPosition = anchor
                        .clone()
                        .applyQuaternion(ropeRotation.copy(ropeBody.rotation()))
                        .add(ropeBody.translation());
                    body.setTranslation(grabPosition, true);
                    body.setLinvel(
                        ropeBody.velocityAtPoint(grabPosition),
                        true,
                    );
                    const joint = world.createImpulseJoint(
                        rapier.JointData.spherical(anchor, {
                            x: 0,
                            y: 0,
                            z: 0,
                        }),
                        ropeBody,
                        body,
                        true,
                    );
                    // Allow the character to overlap the rope without collision jitter.
                    joint.setContactsEnabled(false);
                    attachment.joint = joint;
                    attachment.world = world;
                    attachment.anchor = anchor;
                    groundedSteps.current = 0;
                    isJumping.current = false;
                    ropeJumpActive.current = false;
                    downhillVelocity.set(0, 0, 0);
                }

                if (jumpPressed) {
                    const velocity = body.linvel();
                    ropeJumpMomentum.set(velocity.x, 0, velocity.z);
                    ropeJumpActive.current = true;
                    store.releaseRope();
                    body.setLinvel(
                        {
                            x: direction.x + ropeJumpMomentum.x,
                            y: Math.max(0, velocity.y) + JUMP_FORCE,
                            z: direction.z + ropeJumpMomentum.z,
                        },
                        true,
                    );
                    groundedSteps.current = 0;
                    isJumping.current = true;
                    lastJumpTime.current = elapsedTime.current;
                    updateAnimation("Run", 3);
                } else {
                    // W/Up/left-stick forward climbs toward the pivot; backward climbs down.
                    const climbInput = Math.max(-1, Math.min(1, -forwardInput));
                    attachment.anchor.y = Math.max(
                        -length + ROPE_BOTTOM_MARGIN,
                        Math.min(
                            -ROPE_TOP_MARGIN,
                            attachment.anchor.y +
                                climbInput * ROPE_CLIMB_SPEED * world.timestep,
                        ),
                    );
                    attachment.joint.setAnchor1(attachment.anchor);
                    body.wakeUp();
                    updateAnimation(climbInput === 0 ? "Idle" : "Walk");
                }
                // Skip normal walking and ground-jump velocity overrides while on a rope.
                return;
            }
        }

        const velocity = body.linvel();
        surfaceNormal.set(0, 1, 0);
        const groundCollider = getGroundSupport(
            world,
            body.collider(0),
            undefined,
            surfaceNormal,
        );
        let supportCollider = groundCollider;
        if (!supportCollider) {
            const steepSupport = getGroundSupport(world, body.collider(0), 0.1);
            const steepPlatform = steepSupport?.parent();
            if (steepPlatform?.userData?.parkourGravityPlatform) {
                surfaceOffset
                    .copy(body.translation())
                    .sub(steepPlatform.translation())
                    .applyQuaternion(
                        ropeRotation.copy(steepPlatform.rotation()).invert(),
                    );
                if (
                    surfaceOffset.y >=
                    steepPlatform.userData.parkourSurfaceHeight
                ) {
                    supportCollider = steepSupport;
                }
            }
        }
        const platform = supportCollider?.parent();
        const onGravityPlatform = !!platform?.userData?.parkourGravityPlatform;
        const onRotatingLog = !!platform?.userData?.parkourRotatingLog;
        if (!groundCollider && platform) {
            surfaceNormal.set(0, 1, 0).applyQuaternion(platform.rotation());
        }
        surfaceOffset
            .copy(body.translation())
            .addScaledVector(surfaceNormal, -0.45);
        // Carry the player with rotating surfaces.
        const platformVelocity =
            platform?.userData?.parkourSpinningPlatform ||
            onGravityPlatform ||
            onRotatingLog
                ? platform.velocityAtPoint(
                      onRotatingLog ? surfaceOffset : body.translation(),
                  )
                : null;
        const normalVelocity =
            (velocity.x - (platformVelocity?.x || 0)) * surfaceNormal.x +
            (velocity.y - (platformVelocity?.y || 0)) * surfaceNormal.y +
            (velocity.z - (platformVelocity?.z || 0)) * surfaceNormal.z;
        const grounded = !!groundCollider && Math.abs(normalVelocity) < 0.15;
        if (onGravityPlatform) {
            // Preserve downhill acceleration instead of cancelling it with the
            // walking velocity override. Keep this momentum after sliding off.
            const acceleration =
                -world.gravity.y * surfaceNormal.y * world.timestep;
            downhillVelocity.x += surfaceNormal.x * acceleration;
            downhillVelocity.z += surfaceNormal.z * acceleration;
        } else if (groundCollider) {
            downhillVelocity.set(0, 0, 0);
        }
        if (grounded) groundedSteps.current += 1;
        else groundedSteps.current = 0;

        if (groundedSteps.current > 2) {
            ropeJumpActive.current = false;
            ropeJumpMomentum.set(0, 0, 0);
        }

        if (
            isJumping.current &&
            groundedSteps.current > 4 &&
            elapsedTime.current - lastJumpTime.current > 0.5
        ) {
            isJumping.current = false;
        }

        let verticalVelocity = velocity.y;
        if (jumpInput && groundedSteps.current > 2 && !isJumping.current) {
            verticalVelocity = JUMP_FORCE;
            groundedSteps.current = 0;
            isJumping.current = true;
            lastJumpTime.current = elapsedTime.current;
        }
        body.setLinvel(
            {
                x:
                    direction.x +
                    downhillVelocity.x +
                    (platformVelocity?.x || 0) +
                    (ropeJumpActive.current ? ropeJumpMomentum.x : 0),
                y: verticalVelocity,
                z:
                    direction.z +
                    downhillVelocity.z +
                    (platformVelocity?.z || 0) +
                    (ropeJumpActive.current ? ropeJumpMomentum.z : 0),
            },
            true,
        );

        const action = isJumping.current
            ? "Run"
            : moving
              ? isSprinting
                  ? "Run"
                  : "Walk"
              : "Idle";
        const speed = isJumping.current ? 3 : 1;
        updateAnimation(action, speed);
    });

    useAfterPhysicsStep(() => {
        const body = rigidBodyRef.current;
        if (!body) return;

        const position = body.translation();
        const { debug, flyMode } = useStore.getState();
        if (position.y < -10 && !(debug && flyMode)) {
            let latestCheckpoint = [0, 5, 0];
            for (const checkpoint of useParkourStore.getState().checkpoints) {
                if (!checkpoint.locked && checkpoint.location.length === 3) {
                    latestCheckpoint = checkpoint.location;
                }
            }
            teleportPlayer(latestCheckpoint);
            groundedSteps.current = 0;
            isJumping.current = false;
            camera.lookAt(0, 0, -50);
            return;
        }

        setPosition([position.x, position.y, position.z]);
    });

    useFrame(() => {
        const body = rigidBodyRef.current;
        if (!body || !visualRef.current) return;

        const gamepad = navigator.getGamepads?.()[0];
        const controllerView = !!gamepad?.buttons[3]?.pressed;
        if (controllerView && !prevControllerView.current) {
            useParkourStore.getState().toggleThirdPerson();
        }
        prevControllerView.current = controllerView;

        const { isThirdPerson: thirdPerson, cameraDistance } =
            useParkourStore.getState();
        // Follow the interpolated visual transform after Rapier has updated it.
        visualRef.current.getWorldPosition(playerPosition);
        const { debug, flyMode } = useStore.getState();
        const flying = debug && flyMode;
        const cameraHeight = playerPosition.y / (crouch && !flying ? 2 : 1);
        if (thirdPerson) {
            playerCenter.set(
                playerPosition.x,
                cameraHeight + THIRD_PERSON_HEIGHT,
                playerPosition.z,
            );
            forward.set(0, 0, -1).applyEuler(camera.rotation);
            let distance = cameraDistance;
            cameraPosition
                .copy(playerCenter)
                .addScaledVector(forward, -distance);

            // Preserve Tag's camera floor safeguard.
            const minY = GROUND_Y + CAMERA_GROUND_OFFSET;
            if (cameraPosition.y < minY) {
                if (forward.y > 0) {
                    distance = Math.min(
                        distance,
                        (playerCenter.y - minY) / forward.y,
                    );
                }
                cameraPosition
                    .copy(playerCenter)
                    .addScaledVector(forward, -distance);
                cameraPosition.y = Math.max(cameraPosition.y, minY);
            }
            camera.position.copy(cameraPosition);
            camera.lookAt(playerCenter);
        } else {
            camera.position.set(
                playerPosition.x,
                cameraHeight + 0.4,
                playerPosition.z,
            );
        }

        if (modelRef.current && direction.lengthSq() > 0) {
            modelRef.current.rotation.y = Math.atan2(direction.x, direction.z);
        }
    });

    return (
        <RigidBody
            ref={rigidBodyRef}
            type="dynamic"
            position={[0, 5, 0]}
            colliders={false}
            canSleep={false}
            lockRotations
            ccd
        >
            {/* Rapier's capsule matches Tag's two spheres and center cylinder. */}
            <CapsuleCollider
                args={[0.33, 0.13]}
                mass={PLAYER_MASS}
                collisionGroups={PLAYER_COLLISION_GROUPS}
                friction={0}
                frictionCombineRule={rapier.CoefficientCombineRule.Min}
            />
            <group ref={visualRef}>
                <group
                    ref={modelRef}
                    position={[0, -0.45, 0]}
                    visible={isThirdPerson}
                >
                    <SpacesuitModel
                        scale={0.5}
                        action={animation.action}
                        speed={animation.speed}
                    />
                </group>
            </group>
        </RigidBody>
    );
}

export const Player = memo(PlayerBase);
