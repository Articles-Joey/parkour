import { createMapComponent } from "./mapComponents";

const obstacle = (id, component, props) =>
    createMapComponent(component, id, props);
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
        colorSeed: 1,
        description: "Learn the basics",
        mapObstacles: [
            {
                id: "player-spawn",
                component: "Player",
                props: {
                    position: [0, 5, 0],
                    rotation: [0, 0, 0],
                },
            },
            {
                id: "start-platform-0",
                component: "Platform",
                props: {
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "start-platform-1",
                component: "Platform",
                props: {
                    position: [0, 0, -4],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "start-platform-2",
                component: "Platform",
                props: {
                    position: [0, 0, -8],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "start-platform-3",
                component: "Platform",
                props: {
                    position: [0, 0, -12],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "start-platform-4",
                component: "DisappearingPlatform",
                props: {
                    position: [0, 0, -16],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                    disappearAfter: 2,
                    respawnAfter: 5,
                },
            },
            {
                id: "start-platform-5",
                component: "Platform",
                props: {
                    position: [0, 0, -20],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "start-platform-6",
                component: "Platform",
                props: {
                    position: [0, 0, -24],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "start-platform-7",
                component: "GravityPlatform",
                props: {
                    position: [0, 0, -28],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                    tiltSpeed: 0.7,
                    maxTilt: 1.0471975511965976,
                    returnSpeed: 1.5,
                },
            },
            {
                id: "start-platform-8",
                component: "Platform",
                props: {
                    position: [0, 0, -32],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "start-platform-9",
                component: "Platform",
                props: {
                    position: [0, 0, -36],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "climb-platform-0",
                component: "Platform",
                props: {
                    position: [0, 0, -40],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "climb-platform-1",
                component: "Platform",
                props: {
                    position: [0, 0.5, -44],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "climb-platform-2",
                component: "Platform",
                props: {
                    position: [0, 1, -48],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "climb-platform-3",
                component: "Platform",
                props: {
                    position: [0, 1.5, -52],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "climb-platform-4",
                component: "Platform",
                props: {
                    position: [0, 2, -56],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "climb-platform-5",
                component: "Platform",
                props: {
                    position: [0, 2.5, -60],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "climb-platform-6",
                component: "Platform",
                props: {
                    position: [0, 3, -64],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "climb-platform-7",
                component: "Platform",
                props: {
                    position: [0, 3.5, -68],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "climb-platform-8",
                component: "Platform",
                props: {
                    position: [0, 4, -72],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "climb-platform-9",
                component: "Platform",
                props: {
                    position: [0, 4.5, -76],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "checkpoint-1",
                component: "Checkpoint",
                props: {
                    position: [0, 6, -76],
                    rotation: [0, 0, 0],
                    args: [2.5, 2.5, 2.5],
                    name: "1",
                    respawnOffset: [0, -1, 0],
                },
            },
            {
                id: "flag-1",
                component: "Flag",
                props: {
                    position: [0, 4.5, -76],
                    rotation: [0, 0, 0],
                    scale: 2,
                },
            },
            {
                id: "turn-platform-0",
                component: "Platform",
                props: {
                    position: [-5, 5, -76],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "turn-platform-1",
                component: "Platform",
                props: {
                    position: [-11, 5.5, -76],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "turn-platform-2",
                component: "Platform",
                props: {
                    position: [-17, 6, -76],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "turn-platform-3",
                component: "Platform",
                props: {
                    position: [-23, 6.5, -76],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "turn-platform-4",
                component: "Platform",
                props: {
                    position: [-29, 7, -76],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "turn-platform-5",
                component: "Platform",
                props: {
                    position: [-35, 7.5, -76],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "turn-platform-6",
                component: "Platform",
                props: {
                    position: [-41, 8, -76],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "turn-platform-7",
                component: "Platform",
                props: {
                    position: [-47, 8.5, -76],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "turn-platform-8",
                component: "Platform",
                props: {
                    position: [-53, 9, -76],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "turn-platform-9",
                component: "Platform",
                props: {
                    position: [-59, 9.5, -76],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                },
            },
            {
                id: "spring-platform-1",
                component: "SpringPlatform",
                props: {
                    position: [-56, 10, 0],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                    force: 15,
                },
            },
            {
                id: "spring-platform-2",
                component: "SpringPlatform",
                props: {
                    position: [-59, 20, 0],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                    force: 15,
                },
            },
            {
                id: "spring-platform-3",
                component: "SpringPlatform",
                props: {
                    position: [-62, 30, 0],
                    rotation: [0, 0, 0],
                    args: [2.5, 0.5, 2.5],
                    force: 15,
                },
            },
            {
                id: "Text-ac00b2a4",
                component: "Text",
                props: {
                    position: [0, 3.289108, -5.045532],
                    rotation: [0, 0, 0],
                    text: "Welcome",
                    fontSize: 1,
                    color: "#ffffff",
                    stroke: 0.03,
                    strokeColor: "#000000",
                    billboard: false,
                },
            },
            {
                id: "Text-855941a9",
                component: "Text",
                props: {
                    position: [-5, 7.860233, -76.372416],
                    rotation: [0, 1.570796, 0],
                    text: "Sprinting Required",
                    fontSize: 1,
                    color: "#ffffff",
                    stroke: 0.03,
                    strokeColor: "#000000",
                    billboard: false,
                },
            },
        ],
    },
    {
        mapName: "Intermediate",
        colorSeed: 1,
        description: "Heating up",
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
        mapName: "Advanced",
        colorSeed: 1,
        description: "You shall not pass",
        mapObstacles: startingObstacles(),
    },
    {
        mapName: "Expert",
        colorSeed: 1,
        description: "Good luck",
        mapObstacles: startingObstacles(),
    },
];

export function getLevelMap(mapName, savedMaps = []) {
    const original = levelMaps.find((map) => map.mapName === mapName);
    if (!original) return null;
    return savedMaps.find((map) => map.mapName === mapName) ?? original;
}

export function createCustomMap() {
    return {
        mapName: "Custom",
        colorSeed: 1,
        mapObstacles: startingObstacles(),
    };
}
