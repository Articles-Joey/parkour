import { createMapComponent } from "./mapComponents";

// Adjust this value to change the repeatable platform colors in the default maps.
const PLATFORM_COLOR_SEED = 1;
const obstacle = (id, component, props) =>
    createMapComponent(component, id, {
        ...(component.includes("Platform") || component === "RotatingLog"
            ? { colorSeed: PLATFORM_COLOR_SEED }
            : {}),
        ...props,
    });
const platform = (id, position, args = [2.5, 0.5, 2.5]) =>
    obstacle(id, "Platform", { position, args });
const checkpoint = (name, position, respawnOffset = [0, 0, 0]) =>
    obstacle(`checkpoint-${name}`, "Checkpoint", {
        name,
        position,
        respawnOffset,
    });
const flag = (name, position) =>
    obstacle(`flag-${name}`, "Flag", { position, scale: 2 });

function startingObstacles() {
    return [
        obstacle("player-spawn", "Player", { position: [0, 5, 0] }),
        platform("starting-platform", [0, 0, 0], [6, 0.5, 6]),
    ];
}

export const levelMaps = [
    {
        mapName: "Beginner",
        description: "Learn the basics",
        mapObstacles: [
            obstacle("player-spawn", "Player", { position: [0, 5, 0] }),
            ...Array.from({ length: 10 }, (_, i) =>
                obstacle(
                    `start-platform-${i}`,
                    i === 4
                        ? "DisappearingPlatform"
                        : i === 7
                          ? "GravityPlatform"
                          : "Platform",
                    { position: [0, 0, i * -4], args: [2.5, 0.5, 2.5] },
                ),
            ),
            ...Array.from({ length: 10 }, (_, i) =>
                platform(`climb-platform-${i}`, [0, i * 0.5, -40 + i * -4]),
            ),
            checkpoint("1", [0, 6, -76], [0, -1, 0]),
            flag("1", [0, 4.5, -76]),
            ...Array.from({ length: 10 }, (_, i) =>
                platform(`turn-platform-${i}`, [-5 + i * -6, 5 + i * 0.5, -76]),
            ),
            checkpoint("2", [-59, 11, -76]),
            flag("2", [-59, 9.5, -76]),
            ...Array.from({ length: 10 }, (_, i) =>
                obstacle(`spinning-platform-${i}`, "SpinningPlatform", {
                    args: [2.5, 0.5, 0.5],
                    position: [-59, 9.5, -73 + i * 6],
                }),
            ),
            platform("checkpoint-3-platform", [-59, 9.5, -15]),
            checkpoint("3", [-59, 11, -15]),
            flag("3", [-59, 9.5, -15]),
            platform("walkway-platform", [-34, 9.5, -15], [47, 0.25, 0.25]),
            ...Array.from({ length: 7 }, (_, i) =>
                obstacle(`swinging-ball-${i}`, "SwingingBall", {
                    args: [0.1, 0.1, 7, 8],
                    position: [-14 + i * -6, 18, -15],
                    i,
                }),
            ),
            platform("checkpoint-4-platform", [-9, 9.5, -15]),
            checkpoint("4", [-9, 11, -15]),
            flag("4", [-9, 9.5, -15]),
            obstacle("rope-swing-1", "RopeSwing", {
                position: [0, 18, -15],
                args: [0.1, 0.1, 9, 8],
            }),
            platform("rope-landing-platform", [10, 9.5, -15]),
            // The original rotated parent placed this rope at this world position.
            obstacle("rope-swing-2", "RopeSwing", {
                position: [10, 18, -7.5],
                rotation: [0, Math.PI / 2, 0],
                args: [0.1, 0.1, 9, 8],
            }),
            platform("return-platform", [10, 9.5, 0]),
            checkpoint("5", [10, 11, 0]),
            flag("5", [10, 9.5, 0]),
            platform("return-plank-platform", [3.5, 9.5, 0], [8, 0.5, 0.5]),
            obstacle("gravity-platform-near-start", "GravityPlatform", {
                position: [-2.51, 9.78, -0.03],
            }),
            ...Array.from({ length: 7 }, (_, i) =>
                obstacle(`disappearing-platform-${i}`, "DisappearingPlatform", {
                    args: [1, 0.1, 1],
                    position: [-5.55 + i * -2, 9.96, 0],
                }),
            ),
            ...[0.6, 1.2, 2].map((rotationSpeed, i) =>
                obstacle(`rotating-log-${i + 1}`, "RotatingLog", {
                    position: [-24.55 - i * 12, 9.26, 0],
                    radius: 0.75,
                    length: 10,
                    pegCount: 12,
                    seed: 7,
                    rotationSpeed,
                }),
            ),
            ...[
                [-56, 10, 0],
                [-59, 20, 0],
                [-62, 30, 0],
            ].map((position, i) =>
                obstacle(`spring-platform-${i + 1}`, "SpringPlatform", {
                    position,
                    force: 15,
                }),
            ),
        ],
    },
    {
        mapName: "Intermediate",
        description: "Heating up",
        mapObstacles: startingObstacles(),
    },
    {
        mapName: "Advanced",
        description: "You shall not pass",
        mapObstacles: startingObstacles(),
    },
    {
        mapName: "Expert",
        description: "You shall not pass",
        mapObstacles: startingObstacles(),
    },
];

export function getLevelMap(mapName, savedMaps = []) {
    const original = levelMaps.find((map) => map.mapName === mapName);
    if (!original) return null;
    return savedMaps.find((map) => map.mapName === mapName) ?? original;
}

export function createCustomMap() {
    return { mapName: "Custom", mapObstacles: startingObstacles() };
}
