"use client"
// import { create } from 'zustand'
import { createWithEqualityFn as create } from 'zustand/traditional'
// import { nanoid } from 'nanoid'

const getLocalStorage = (key) => JSON.parse(window.localStorage.getItem(key))
const setLocalStorage = (key, value) => window.localStorage.setItem(key, JSON.stringify(value))

const initialCheckpoints = [
    {
        name: "Start",
        locked: false,
        location: [0, 5, 0]
    },
    {
        name: "1",
        locked: true,
        location: [0, 5, -76]
    },
    {
        name: "2",
        locked: true,
        location: [-59, 11, -76]
    },
    {
        name: "3",
        locked: true,
        location: [-59, 11, -15]
    },
    {
        name: "4",
        locked: true,
        location: [-9, 11, -15]
    },
    {
        name: "5",
        locked: true,
        location: [8, 11, 0]
    },
    {
        name: "End",
        locked: true,
        location: []
    }
]

export const useParkourStore = create((set) => ({

    // Mouse and Keyboard
    // Touch
    controlType: "Mouse and Keyboard",
    setControlType: (newValue) => {
        set((prev) => ({
            controlType: newValue
        }))
    },

    debug: false,
    setDebug: (newValue) => {
        set((prev) => ({
            debug: newValue
        }))
    },

    cameraMode: false,
    setCameraMode: (newValue) => {
        set((prev) => ({
            cameraMode: newValue
        }))
    },

    music: false,
    setMusic: (newValue) => {
        set((prev) => ({
            music: newValue
        }))
    },

    ref: null,
    api: null,
    position: [0, 0, 0], // Initial sphere position
    setPlayer: (ref, api) => set({ ref, api }),
    setPosition: (position) => set({ position }),

    checkpoints: initialCheckpoints,
    setCheckpoints: (newValue) => {
        set((prev) => ({
            checkpoints: newValue
        }))
    },
    resetCheckpoints: (newValue) => {
        set((prev) => ({
            checkpoints: initialCheckpoints
        }))
    },

}))