// Serializable props shared by the level loader, editor and custom-map URLs.
export const MAX_MAP_COMPONENTS = 500;

const boxProps = { args: [2.5, 0.5, 2.5], colorSeed: 1 };

export const MAP_COMPONENTS = {
    Player: { label: "Player spawn", props: {} },
    Platform: { label: "Platform", props: { ...boxProps } },
    SpinningPlatform: {
        label: "Spinning platform",
        props: { ...boxProps, args: [2.5, 0.5, 0.5], rotationSpeed: 1 },
    },
    DisappearingPlatform: {
        label: "Disappearing platform",
        props: { ...boxProps, disappearAfter: 2, respawnAfter: 5 },
    },
    GravityPlatform: {
        label: "Gravity platform",
        props: {
            ...boxProps,
            tiltSpeed: 0.7,
            maxTilt: Math.PI / 3,
            returnSpeed: 1.5,
        },
    },
    RotatingLog: {
        label: "Rotating log",
        props: {
            radius: 0.75,
            length: 10,
            pegCount: 8,
            seed: 1,
            pegLength: 0.65,
            pegRadius: 0.12,
            rotationSpeed: 0.6,
            colorSeed: 1,
            color: "#805238",
        },
    },
    SpringPlatform: {
        label: "Spring platform",
        props: { ...boxProps, force: 15 },
    },
    RopeSwing: { label: "Rope swing", props: { args: [0.1, 0.1, 9, 8] } },
    SwingingBall: {
        label: "Swinging ball",
        props: { args: [0.1, 0.1, 7, 8], i: 0 },
    },
    Checkpoint: {
        label: "Checkpoint",
        props: { args: [2.5, 2.5, 2.5], name: "1", respawnOffset: [0, 0, 0] },
    },
    Flag: { label: "Checkpoint flag", props: { scale: 2 } },
};

export function createMapComponent(component, id, props = {}) {
    const definition = MAP_COMPONENTS[component];
    if (!definition) throw new Error(`Unknown map component: ${component}`);
    return {
        id,
        component,
        props: JSON.parse(
            JSON.stringify({
                position: component === "Player" ? [0, 5, 0] : [0, 0, 0],
                rotation: [0, 0, 0],
                ...definition.props,
                ...props,
            }),
        ),
    };
}

function vector(value, size, label, positive = false) {
    if (
        !Array.isArray(value) ||
        value.length !== size ||
        value.some(
            (number) =>
                !Number.isFinite(number) ||
                Math.abs(number) > 1000000 ||
                (positive && number <= 0),
        )
    )
        throw new Error(
            `${label} must contain ${size} ${positive ? "positive " : ""}numbers.`,
        );
    return [...value];
}

export function normalizeMapObstacles(input) {
    if (!Array.isArray(input) || input.length > MAX_MAP_COMPONENTS)
        throw new Error(
            `Map components must be an array with at most ${MAX_MAP_COMPONENTS} entries.`,
        );
    const ids = new Set();
    let playerCount = 0;
    const obstacles = input.map((item, index) => {
        if (!item || typeof item !== "object")
            throw new Error("Invalid map component.");
        const component = item.component ?? item.name;
        if (!Object.hasOwn(MAP_COMPONENTS, component))
            throw new Error(`Unknown map component: ${component}`);
        const id =
            typeof item.id === "string" && item.id
                ? item.id
                : `${component}-${index}`;
        if (ids.has(id) || id === "__start__")
            throw new Error(`Duplicate or reserved component ID: ${id}`);
        ids.add(id);
        const source = item.props ?? {};
        if (
            typeof source !== "object" ||
            Array.isArray(source) ||
            source === null
        )
            throw new Error(`Invalid props for ${component}.`);
        const obstacle = createMapComponent(component, id);
        obstacle.props.position = vector(
            source.position ?? obstacle.props.position,
            3,
            "Position",
        );
        obstacle.props.rotation = vector(
            source.rotation ?? obstacle.props.rotation,
            3,
            "Rotation",
        );
        for (const [key, fallback] of Object.entries(
            MAP_COMPONENTS[component].props,
        )) {
            const value = source[key] ?? fallback;
            if (Array.isArray(fallback)) {
                obstacle.props[key] = vector(
                    value,
                    fallback.length,
                    key,
                    key === "args",
                );
            } else if (
                (key === "seed" || key === "colorSeed") &&
                typeof value === "string"
            ) {
                obstacle.props[key] = value;
            } else if (typeof fallback === "number") {
                if (!Number.isFinite(value) || Math.abs(value) > 1000000)
                    throw new Error(
                        `${key} must be a number between -1000000 and 1000000.`,
                    );
                if (
                    [
                        "radius",
                        "length",
                        "pegLength",
                        "pegRadius",
                        "scale",
                        "disappearAfter",
                        "respawnAfter",
                    ].includes(key) &&
                    value <= 0
                )
                    throw new Error(`${key} must be greater than zero.`);
                if (
                    [
                        "force",
                        "pegCount",
                        "tiltSpeed",
                        "maxTilt",
                        "returnSpeed",
                    ].includes(key) &&
                    value < 0
                )
                    throw new Error(`${key} cannot be negative.`);
                obstacle.props[key] =
                    key === "pegCount"
                        ? Math.min(100, Math.floor(value))
                        : value;
            } else {
                if (typeof value !== "string")
                    throw new Error(`${key} must be text.`);
                obstacle.props[key] = value;
            }
        }
        if (component === "RopeSwing" || component === "SwingingBall") {
            obstacle.props.args[3] = Math.max(
                3,
                Math.min(64, Math.floor(obstacle.props.args[3])),
            );
        }
        if (component === "Player") playerCount += 1;
        return obstacle;
    });
    if (playerCount > 1)
        throw new Error("A map can only have one player spawn.");
    if (!playerCount) {
        if (obstacles.length >= MAX_MAP_COMPONENTS)
            throw new Error(
                `Leave room for a player spawn within the ${MAX_MAP_COMPONENTS}-component limit.`,
            );
        let id = "player-spawn";
        while (ids.has(id)) id += "-spawn";
        obstacles.unshift(createMapComponent("Player", id));
    }
    return obstacles;
}
