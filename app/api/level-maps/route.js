import { randomUUID } from "node:crypto";
import { readFile, writeFile, rename, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { NextResponse } from "next/server";
import { normalizeMapObstacles } from "@/data/mapComponents";
import { normalizeLevelColorSeed } from "@/data/mapSettings";
import updateLevelMapSource from "@/util/updateLevelMapSource";

export const runtime = "nodejs";

// Read the latest source for each save so simultaneous map saves preserve each other.
let saveQueue = Promise.resolve();

export async function POST(request) {
    if (process.env.NODE_ENV !== "development")
        return NextResponse.json(
            { error: "Save to code is available in development only." },
            { status: 403 },
        );
    const origin = request.headers.get("origin");
    if (origin) {
        try {
            if (new URL(origin).host !== request.headers.get("host"))
                throw new Error("Invalid origin.");
        } catch {
            return NextResponse.json(
                { error: "Save to code must come from this site." },
                { status: 403 },
            );
        }
    }
    if (!request.headers.get("content-type")?.includes("application/json"))
        return NextResponse.json(
            { error: "Expected map data as JSON." },
            { status: 415 },
        );

    let mapName;
    let mapObstacles;
    let colorSeed;
    try {
        const payload = await request.json();
        mapName = payload?.mapName;
        if (typeof mapName !== "string" || !mapName || mapName === "Custom")
            throw new Error("Only built-in maps can be saved to code.");
        mapObstacles = normalizeMapObstacles(payload.mapObstacles);
        colorSeed = normalizeLevelColorSeed(payload.colorSeed);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const save = saveQueue.then(async () => {
        // The destination is fixed; requests cannot choose a file path.
        const filePath = join(process.cwd(), "data", "levelMaps.js");
        const source = await readFile(filePath, "utf8");
        const updated = updateLevelMapSource(
            source,
            mapName,
            mapObstacles,
            colorSeed,
        );
        const temporaryPath = join(
            dirname(filePath),
            `.levelMaps-${randomUUID()}.tmp`,
        );
        try {
            await writeFile(temporaryPath, updated, {
                encoding: "utf8",
                flag: "wx",
            });
            if ((await readFile(filePath, "utf8")) !== source)
                throw new Error(
                    "levelMaps.js changed during the save. Try saving again.",
                );
            // Replace the file only after the complete updated source has been written.
            await rename(temporaryPath, filePath);
        } finally {
            await unlink(temporaryPath).catch(() => {});
        }
    });
    saveQueue = save.catch(() => {});
    try {
        await save;
        return NextResponse.json({
            mapName,
            message: `${mapName} saved to levelMaps.js.`,
        });
    } catch (error) {
        return NextResponse.json(
            { error: error.message || "Could not save the map to code." },
            { status: 500 },
        );
    }
}
