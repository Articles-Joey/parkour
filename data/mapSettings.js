export const DEFAULT_LEVEL_COLOR_SEED = 1;

export function normalizeLevelColorSeed(value = DEFAULT_LEVEL_COLOR_SEED) {
    if (
        typeof value === "string" ||
        (typeof value === "number" && Number.isFinite(value))
    )
        return value;
    throw new Error("The level color seed must be a finite number or text.");
}
