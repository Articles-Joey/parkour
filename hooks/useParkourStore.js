"use client";
// import { create } from 'zustand'
import { createWithEqualityFn as create } from "zustand/traditional";
import { useStore } from "./useStore";
import {
    SPRINT_RECHARGE_DELAY,
    stepSprint,
} from "@/components/Game/sprintSettings";
import { getMapCheckpoints, getMapProgressKey } from "@/data/mapUtils";

export const useParkourStore = create((set, get) => ({
    mapName: null,
    activeMapKey: null,
    spawnPosition: [0, 5, 0],
    spawnRotation: [0, 0, 0],
    editMode: false,
    activateLevel: (level) => {
        get().releaseRope();
        const activeMapKey = getMapProgressKey(level);
        const completed =
            useStore.getState().checkpointProgress[activeMapKey] ?? [];
        const checkpoints = getMapCheckpoints(level, completed);
        set({
            mapName: level.mapName,
            activeMapKey,
            checkpoints,
            spawnPosition: checkpoints[0].location,
            spawnRotation: level.mapObstacles.find(
                (item) => item.component === "Player",
            )?.props.rotation ?? [0, 0, 0],
        });
    },
    // Mouse and Keyboard
    // Touch
    controlType: "Mouse and Keyboard",
    setControlType: (newValue) => {
        set((prev) => ({
            controlType: newValue,
        }));
    },

    isThirdPerson: false,
    setThirdPerson: (isThirdPerson) => set({ isThirdPerson }),
    toggleThirdPerson: () =>
        set((state) => ({ isThirdPerson: !state.isThirdPerson })),
    cameraDistance: 6,
    setCameraDistance: (cameraDistance) => set({ cameraDistance }),

    sprintEnergy: 1,
    sprintIdleSeconds: SPRINT_RECHARGE_DELAY,
    isSprinting: false,
    updateSprint: (requestingSprint, delta) => {
        const state = get();
        const next = stepSprint(state, requestingSprint, delta);
        if (
            next.sprintEnergy !== state.sprintEnergy ||
            next.sprintIdleSeconds !== state.sprintIdleSeconds ||
            next.isSprinting !== state.isSprinting
        ) {
            set(next);
        }
        return next.isSprinting;
    },

    music: false,
    setMusic: (newValue) => {
        set((prev) => ({
            music: newValue,
        }));
    },

    rigidBody: null,
    ropeAttachment: null,
    ropeGrabBlockedUntil: 0,
    teleportVersion: 0,
    position: [0, 0, 0], // Initial sphere position
    setPlayer: (rigidBody) => {
        if (!rigidBody) get().releaseRope();
        set({
            rigidBody,
            isSprinting: false,
            ...(rigidBody
                ? { sprintEnergy: 1, sprintIdleSeconds: SPRINT_RECHARGE_DELAY }
                : {}),
        });
    },
    requestRopeGrab: (ropeBody, length, radius) => {
        const { rigidBody, ropeAttachment, ropeGrabBlockedUntil } = get();
        const { debug, flyMode } = useStore.getState();
        if (
            !rigidBody ||
            ropeAttachment ||
            (debug && flyMode) ||
            Date.now() < ropeGrabBlockedUntil
        )
            return;

        // The player creates the joint before the next step, outside collision callbacks.
        set({
            ropeAttachment: {
                ropeBody,
                length,
                radius,
                joint: null,
                world: null,
                anchor: null,
            },
        });
    },
    releaseRope: () => {
        const { ropeAttachment } = get();
        if (!ropeAttachment) return;

        const { joint, world } = ropeAttachment;
        if (joint?.isValid()) world.removeImpulseJoint(joint, true);
        set({ ropeAttachment: null, ropeGrabBlockedUntil: Date.now() + 650 });
    },
    setPosition: (position) => set({ position }),
    teleportPlayer: (location) => {
        const { rigidBody } = get();
        if (!rigidBody?.isValid() || !location || location.length !== 3) return;

        get().releaseRope();

        rigidBody.setTranslation(
            { x: location[0], y: location[1], z: location[2] },
            true,
        );
        rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
        set((state) => ({
            position: [...location],
            teleportVersion: state.teleportVersion + 1,
        }));
    },

    checkpoints: [],
    unlockCheckpoint: (id) => {
        const { activeMapKey, checkpoints, editMode } = get();
        const checkpoint = checkpoints.find((item) => item.id === id);
        if (editMode || !checkpoint?.locked) return;
        useStore.getState().completeMapCheckpoint(activeMapKey, id);
        set({
            checkpoints: checkpoints.map((item) =>
                item.id === id ? { ...item, locked: false } : item,
            ),
        });
    },
    setCheckpoints: (newValue) => {
        useStore.getState().setMapCheckpointProgress(
            get().activeMapKey,
            newValue
                .filter((item) => item.id !== "__start__" && !item.locked)
                .map((item) => item.id),
        );
        set({ checkpoints: newValue });
    },
    resetCheckpoints: () => {
        useStore.getState().setMapCheckpointProgress(get().activeMapKey, []);
        set({
            checkpoints: get().checkpoints.map((item) => ({
                ...item,
                locked: item.id !== "__start__",
            })),
        });
    },
}));
