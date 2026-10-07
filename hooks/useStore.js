// import { create } from 'zustand'
import { createWithEqualityFn as create } from "zustand/traditional";
import { persist, createJSONStorage } from "zustand/middleware";

import typicalZustandStoreExcludes from "@articles-media/articles-dev-box/typicalZustandStoreExcludes";
import typicalZustandStoreStateSlice from "@articles-media/articles-dev-box/typicalZustandStoreStateSlice";

import generateRandomNickname from "@/util/generateRandomNickname";

export const useStore = create()(
    persist(
        (set, get) => ({
            ...typicalZustandStoreStateSlice(set, get, generateRandomNickname),

            // Debug already comes from the shared slice. Both flags are persisted.
            flyMode: false,
            setFlyMode: (enabled) => {
                set({ flyMode: Boolean(enabled) && get().debug });
            },
            toggleFlyMode: () => get().setFlyMode(!get().flyMode),
            setDebug: (enabled) => {
                const debug = Boolean(enabled);
                set((state) => ({ debug, flyMode: debug && state.flyMode }));
            },
            toggleDebug: () => get().setDebug(!get().debug),

            touchControls: {
                jump: false,
                left: false,
                right: false,
                up: false,
                down: false,
            },
            setTouchControls: (newValue) => {
                set((prev) => ({
                    touchControls: newValue,
                }));
            },
            touchControlsEnabled: false,
            toggleTouchControlsEnabled: () => {
                set((prev) => ({
                    touchControlsEnabled: !prev.touchControlsEnabled,
                }));
            },
            setTouchControlsEnabled: (newValue) => {
                set((prev) => ({
                    touchControlsEnabled: newValue,
                }));
            },

            audioSettings: {
                enabled: true,
                game_volume: 50,
                music_volume: 50,
                sfx_volume: 50,
            },
            setAudioSettings: (newValue) => {
                set((prev) => ({
                    audioSettings: newValue,
                }));
            },

            // Fixed or Orbit
            cameraMode: "Fixed",
            setCameraMode: (newValue) => {
                set((prev) => ({
                    cameraMode: newValue,
                }));
            },
        }),
        {
            name: `${process.env.NEXT_PUBLIC_GAME_KEY}-store`,
            storage: createJSONStorage(() => localStorage),
            version: 1,
            merge: (persistedState, currentState) => {
                const state = { ...currentState, ...persistedState };
                return {
                    ...state,
                    flyMode: Boolean(state.debug && state.flyMode),
                };
            },
            onRehydrateStorage: (state) => {
                return () => state.setHasHydrated(true);
            },
            partialize: (state) =>
                Object.fromEntries(
                    Object.entries(state).filter(
                        ([key]) =>
                            ![...typicalZustandStoreExcludes].includes(key),
                    ),
                ),
        },
    ),
);
