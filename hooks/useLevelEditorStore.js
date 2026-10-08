"use client";

import { createWithEqualityFn as create } from "zustand/traditional";
import { useStore } from "./useStore";
import { useParkourStore } from "./useParkourStore";
import { createMapComponent } from "@/data/mapComponents";
import { getLevelMap, levelMaps } from "@/data/levelMaps";
import {
    assertCustomMapUrlFits,
    customMapUrl,
    getMapRouteKey,
    normalizeLevelMap,
    readCustomMap,
} from "@/data/mapUtils";

export const useLevelEditorStore = create((set, get) => ({
    level: null,
    isCustom: false,
    customUrlLength: 0,
    sourceKey: null,
    sessionVersion: 0,
    editMode: false,
    selectedObstacleId: null,
    transformMode: "translate",
    focusVersion: 0,
    dirty: false,
    isSavingCode: false,
    loadError: null,
    message: null,

    initializeRoute: (
        mapParam,
        components,
        editParam,
        colorSeedParam = null,
    ) => {
        const sourceKey = getMapRouteKey(
            mapParam,
            components,
            editParam,
            colorSeedParam,
        );
        if (sourceKey === get().sourceKey) return;
        const mapName = mapParam ?? "Beginner";
        const isCustom = mapName === "Custom";
        try {
            const currentUrl = isCustom ? new URL(window.location.href) : null;
            if (currentUrl) assertCustomMapUrlFits(currentUrl);
            const source = isCustom
                ? readCustomMap(components, colorSeedParam)
                : getLevelMap(mapName, useStore.getState().levelMaps);
            if (!source) throw new Error(`Map "${mapName}" does not exist.`);
            const level = normalizeLevelMap(source);
            const editMode =
                editParam === "1" && (isCustom || useStore.getState().debug);
            useParkourStore.getState().activateLevel(level);
            const checkpoints = useParkourStore.getState().checkpoints;
            const resume = [...checkpoints]
                .reverse()
                .find((item) => !item.locked);
            useParkourStore.setState({
                editMode,
                position: [...resume.location],
            });
            set({
                level,
                sourceKey,
                isCustom,
                customUrlLength: currentUrl?.href.length ?? 0,
                editMode,
                dirty: false,
                selectedObstacleId: null,
                loadError: null,
                message: null,
                sessionVersion: get().sessionVersion + 1,
            });
            if (editMode) useStore.setState({ sidebar: true });
            if (isCustom && editMode && !components) get().saveMap();
        } catch (error) {
            useParkourStore.getState().releaseRope();
            useParkourStore.setState({
                checkpoints: [],
                activeMapKey: null,
                editMode: false,
            });
            set({
                level: null,
                sourceKey,
                isCustom,
                customUrlLength: 0,
                editMode: false,
                loadError: error.message,
                selectedObstacleId: null,
            });
        }
    },

    clearSession: () => {
        useParkourStore.getState().releaseRope();
        useParkourStore.setState({ editMode: false });
        set({
            level: null,
            sourceKey: null,
            isCustom: false,
            customUrlLength: 0,
            editMode: false,
            selectedObstacleId: null,
            loadError: null,
            message: null,
        });
    },

    setEditMode: (editMode) => {
        if (
            !get().level ||
            (editMode && !get().isCustom && !useStore.getState().debug)
        )
            return;
        if (get().isCustom) {
            try {
                assertCustomMapUrlFits(
                    customMapUrl(get().level, window.location.href, editMode),
                );
            } catch (error) {
                set({ message: error.message });
                return;
            }
        }
        if (typeof document !== "undefined" && document.pointerLockElement)
            document.exitPointerLock();
        useParkourStore.getState().activateLevel(get().level);
        useParkourStore.setState({ editMode });
        set({ editMode, selectedObstacleId: null, message: null });
        if (editMode) useStore.setState({ sidebar: true });
        if (get().isCustom) get().saveMap();
    },
    selectObstacle: (id) => set({ selectedObstacleId: id }),
    setTransformMode: (transformMode) => set({ transformMode }),
    focusSelection: () => set({ focusVersion: get().focusVersion + 1 }),

    updateLevel: (changes) => {
        if (!get().editMode) return;
        try {
            const level = normalizeLevelMap({
                ...get().level,
                ...changes,
            });
            // Reject oversized changes before replacing the last working map or URL.
            if (get().isCustom)
                assertCustomMapUrlFits(
                    customMapUrl(level, window.location.href, get().editMode),
                );
            set({ level, dirty: true, message: null });
            if (get().isCustom) get().saveMap();
        } catch (error) {
            set({ message: error.message });
        }
    },
    updateDraft: (mapObstacles) => get().updateLevel({ mapObstacles }),
    setLevelColorSeed: (colorSeed) => get().updateLevel({ colorSeed }),
    updateObstacleProps: (id, props) => {
        if (!get().level) return;
        get().updateDraft(
            get().level.mapObstacles.map((item) =>
                item.id === id
                    ? { ...item, props: { ...item.props, ...props } }
                    : item,
            ),
        );
    },
    addObstacle: (component) => {
        const { level, selectedObstacleId, editMode } = get();
        if (!level || !editMode) return;
        if (component === "Player") {
            get().selectObstacle(
                level.mapObstacles.find((item) => item.component === "Player")
                    ?.id,
            );
            return;
        }
        const selected = level.mapObstacles.find(
            (item) => item.id === selectedObstacleId,
        );
        const position = [...(selected?.props.position ?? [0, 0, 0])];
        position[2] -= 4;
        if (component === "RopeSwing" || component === "SwingingBall")
            position[1] += 8;
        if (component === "Text") position[1] += 2;
        const props = { position };
        if (component === "Checkpoint") {
            const names = new Set(
                level.mapObstacles
                    .filter((item) => item.component === "Checkpoint")
                    .map((item) => item.props.name),
            );
            let number = 1;
            while (names.has(String(number))) number += 1;
            props.name = String(number);
        }
        let id;
        do {
            id = `${component}-${crypto.randomUUID().slice(0, 8)}`;
        } while (level.mapObstacles.some((item) => item.id === id));
        get().updateDraft([
            ...level.mapObstacles,
            createMapComponent(component, id, props),
        ]);
        if (get().level.mapObstacles.some((item) => item.id === id))
            get().selectObstacle(id);
    },
    removeSelectedObstacle: () => {
        const { level, selectedObstacleId, editMode } = get();
        if (!level || !editMode) return;
        const selected = level.mapObstacles.find(
            (item) => item.id === selectedObstacleId,
        );
        if (!selected || selected.component === "Player") return;
        get().updateDraft(
            level.mapObstacles.filter((item) => item.id !== selectedObstacleId),
        );
        set({ selectedObstacleId: null });
    },

    saveMap: () => {
        if (!get().level) return;
        try {
            const level = normalizeLevelMap(get().level);
            if (get().isCustom) {
                const url = customMapUrl(
                    level,
                    window.location.href,
                    get().editMode,
                );
                assertCustomMapUrlFits(url);
                // Next's native history integration updates searchParams without a reload.
                window.history.replaceState(null, "", url);
                set({
                    sourceKey: getMapRouteKey(
                        "Custom",
                        url.searchParams.get("components"),
                        url.searchParams.get("edit"),
                        url.searchParams.get("colorSeed"),
                    ),
                    customUrlLength: url.href.length,
                });
            } else {
                useStore.getState().saveLevelMap(level);
            }
            useParkourStore.getState().activateLevel(level);
            set({
                level,
                dirty: false,
                message: get().isCustom
                    ? "Map URL updated."
                    : "Map saved on this device.",
            });
        } catch (error) {
            set({ message: error.message });
        }
    },
    saveMapToCode: async () => {
        const { level: draft, isCustom, isSavingCode, sessionVersion } = get();
        if (!draft || isCustom || isSavingCode) return;
        if (process.env.NODE_ENV !== "development") {
            set({ message: "Save to code is available in development only." });
            return;
        }
        set({ isSavingCode: true, message: "Saving map to code..." });
        try {
            const level = normalizeLevelMap(draft);
            const response = await fetch("/api/level-maps", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mapName: level.mapName,
                    colorSeed: level.colorSeed,
                    mapObstacles: level.mapObstacles,
                }),
            });
            const result = await response.json().catch(() => null);
            if (!response.ok)
                throw new Error(
                    result?.error ?? "Could not save the map to code.",
                );
            // A previously saved local copy must not override the new source data.
            useStore.getState().removeSavedLevelMap(level.mapName);
            if (
                get().level?.mapName === level.mapName &&
                get().sessionVersion === sessionVersion
            ) {
                const hasNewEdits =
                    JSON.stringify(get().level.mapObstacles) !==
                        JSON.stringify(level.mapObstacles) ||
                    get().level.colorSeed !== level.colorSeed;
                set({
                    dirty: hasNewEdits ? get().dirty : false,
                    message: `${level.mapName} saved to levelMaps.js.${hasNewEdits ? " Newer edits are still unsaved." : ""}`,
                });
            }
        } catch (error) {
            if (
                get().level?.mapName === draft.mapName &&
                get().sessionVersion === sessionVersion
            )
                set({ message: error.message });
        } finally {
            set({ isSavingCode: false });
        }
    },
    resetSavedLevels: () => {
        const { level, isCustom, sessionVersion } = get();
        if (!level || isCustom || get().isSavingCode) return;
        try {
            const freshLevel = normalizeLevelMap(getLevelMap(level.mapName));
            useStore.getState().resetLevelMaps();
            useParkourStore.getState().activateLevel(freshLevel);
            const resume = [...useParkourStore.getState().checkpoints]
                .reverse()
                .find((item) => !item.locked);
            useParkourStore.setState({ position: [...resume.location] });
            set({
                level: freshLevel,
                dirty: false,
                selectedObstacleId: null,
                loadError: null,
                // Rebuild physics bodies and refocus the editor on the restored map.
                sessionVersion: sessionVersion + 1,
                message: `All saved level edits reset. ${freshLevel.mapName} reloaded from source data.`,
            });
        } catch (error) {
            set({ message: error.message });
        }
    },
    copyShareLink: async () => {
        if (!get().isCustom || !get().level) return;
        try {
            const url = customMapUrl(get().level, window.location.href);
            assertCustomMapUrlFits(url);
            await navigator.clipboard.writeText(url.href);
            set({
                message:
                    "Map link copied. Anyone with the link can play or edit it.",
            });
        } catch (error) {
            set({
                message:
                    error instanceof RangeError
                        ? error.message
                        : "Could not copy the link. Save the map and copy the browser URL.",
            });
        }
    },
    exportLevelData: () => {
        if (!get().level || get().isCustom) return;
        get().saveMap();
        const maps = levelMaps.map((map) =>
            getLevelMap(map.mapName, useStore.getState().levelMaps),
        );
        const url = URL.createObjectURL(
            new Blob([JSON.stringify(maps, null, 2)], {
                type: "application/json",
            }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = "levelMaps.json";
        link.click();
        URL.revokeObjectURL(url);
    },
}));
