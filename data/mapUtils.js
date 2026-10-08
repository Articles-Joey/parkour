import { createMapComponent, normalizeMapObstacles } from "./mapComponents";
import { createCustomMap } from "./levelMaps";
import {
    DEFAULT_LEVEL_COLOR_SEED,
    normalizeLevelColorSeed,
} from "./mapSettings";

// Chromium's url::kMaxURLChars applies to the entire encoded URL, not decoded JSON.
// https://chromium.googlesource.com/chromium/src/+/main/url/url_constants.h
export const MAX_CUSTOM_MAP_URL_LENGTH = 2 * 1024 * 1024;

export function assertCustomMapUrlFits(url) {
    if (url.href.length > MAX_CUSTOM_MAP_URL_LENGTH)
        throw new RangeError(
            "This map exceeds Chrome's 2 MiB URL limit. Remove components or shorten text before saving or sharing.",
        );
}

export function normalizeLevelMap(level) {
    // Older local saves/links kept this value in obstacle props. Move it to the level.
    const legacySeed = level.mapObstacles?.find(
        (item) => item?.props?.colorSeed != null,
    )?.props.colorSeed;
    return {
        ...level,
        colorSeed: normalizeLevelColorSeed(
            level.colorSeed ?? legacySeed ?? DEFAULT_LEVEL_COLOR_SEED,
        ),
        mapObstacles: normalizeMapObstacles(level.mapObstacles),
    };
}

export function readCustomMap(components, colorSeedParam = null) {
    let colorSeed;
    if (colorSeedParam !== null) {
        try {
            colorSeed = JSON.parse(colorSeedParam);
        } catch {
            colorSeed = colorSeedParam;
        }
        colorSeed = normalizeLevelColorSeed(colorSeed);
    }
    if (!components)
        return normalizeLevelMap({
            ...createCustomMap(),
            ...(colorSeedParam !== null ? { colorSeed } : {}),
        });
    // Decoded data cannot be longer than its encoded URL. Full URLs are checked separately.
    if (components.length > MAX_CUSTOM_MAP_URL_LENGTH)
        throw new Error("The custom map URL is too large.");
    let parsed;
    try {
        parsed = JSON.parse(components);
    } catch {
        throw new Error("The custom map URL contains invalid component JSON.");
    }
    return normalizeLevelMap({
        mapName: "Custom",
        mapObstacles: parsed,
        ...(colorSeedParam !== null ? { colorSeed } : {}),
    });
}

export function getMapProgressKey(level) {
    if (level.mapName !== "Custom") return level.mapName;
    let hash = 2166136261;
    const data = JSON.stringify(level.mapObstacles);
    for (let i = 0; i < data.length; i++)
        hash = Math.imul(hash ^ data.charCodeAt(i), 16777619);
    return `Custom:${(hash >>> 0).toString(16)}`;
}

export function getMapCheckpoints(level, completed = []) {
    const spawn = level.mapObstacles.find(
        (item) => item.component === "Player",
    );
    return [
        {
            id: "__start__",
            name: "Start",
            locked: false,
            location: [...(spawn?.props.position ?? [0, 5, 0])],
        },
        ...level.mapObstacles
            .filter((item) => item.component === "Checkpoint")
            .map((item) => ({
                id: item.id,
                name: item.props.name,
                locked: !completed.includes(item.id),
                location: item.props.position.map(
                    (value, i) => value + (item.props.respawnOffset?.[i] ?? 0),
                ),
            })),
    ];
}

export function getCheckpointCount(level, completed = []) {
    const checkpoints = level.mapObstacles.filter(
        (item) => item.component === "Checkpoint",
    );
    return {
        completed: checkpoints.filter((item) => completed.includes(item.id))
            .length,
        total: checkpoints.length,
    };
}

export function getMapRouteKey(map, components, edit, colorSeed = null) {
    return JSON.stringify([
        map ?? "Beginner",
        components ?? "",
        edit ?? "",
        colorSeed,
    ]);
}

export function customMapUrl(level, baseUrl, editing = false) {
    const url = new URL("/play", baseUrl);
    url.searchParams.set("map", "Custom");
    url.searchParams.set(
        "colorSeed",
        JSON.stringify(normalizeLevelColorSeed(level.colorSeed)),
    );
    // Keep the URL an array of named components, omitting props the loader defaults.
    const components = level.mapObstacles.map((item) => {
        const defaults = createMapComponent(item.component, item.id).props;
        const props = Object.fromEntries(
            Object.entries(item.props).filter(
                ([key, value]) =>
                    JSON.stringify(value) !== JSON.stringify(defaults[key]),
            ),
        );
        return { id: item.id, component: item.component, props };
    });
    url.searchParams.set("components", JSON.stringify(components));
    if (editing) url.searchParams.set("edit", "1");
    else url.searchParams.delete("edit");
    return url;
}
