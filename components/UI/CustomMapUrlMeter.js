"use client";

import Box from "@mui/material/Box";
import { MAX_MAP_COMPONENTS } from "@/data/mapComponents";
import { MAX_CUSTOM_MAP_URL_LENGTH } from "@/data/mapUtils";
import { useLevelEditorStore } from "@/hooks/useLevelEditorStore";

export default function CustomMapUrlMeter() {
    const isCustom = useLevelEditorStore((state) => state.isCustom);
    const level = useLevelEditorStore((state) => state.level);
    const urlLength = useLevelEditorStore((state) => state.customUrlLength);
    if (!isCustom || !level) return null;

    const percent = (urlLength / MAX_CUSTOM_MAP_URL_LENGTH) * 100;
    // Keep a nearly full URL from rounding up to 100% before reaching the limit.
    const percentage = (Math.floor(percent * 100) / 100).toFixed(2);
    const componentLimitReached =
        level.mapObstacles.length >= MAX_MAP_COMPONENTS;
    const color =
        percent >= 95 ? "#f87171" : percent >= 80 ? "#fbbf24" : "#4ade80";
    const warning =
        percent >= 100
            ? "URL full. Remove components or shorten text to make room."
            : componentLimitReached
              ? "Component limit reached. Delete a component to add more."
              : percent >= 80
                ? "URL nearly full. Keep additions small or remove components."
                : null;

    return (
        <Box
            className="custom-map-url-meter"
            sx={{
                position: "absolute",
                top: 56,
                left: "50%",
                transform: "translateX(-50%)",
                width: "min(360px, calc(100% - 32px))",
                zIndex: 2,
                pointerEvents: "none",
                bgcolor: "rgba(0,0,0,0.75)",
                color: "white",
                borderRadius: 2,
                p: 1.25,
                fontSize: "0.75rem",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 600,
                    mb: 0.5,
                }}
            >
                <span>Custom map URL capacity</span>
                <Box
                    component="span"
                    sx={{ color }}
                >
                    {percentage}%
                </Box>
            </Box>
            <Box
                role="progressbar"
                aria-label="Chrome URL capacity used"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.min(100, percent)}
                aria-valuetext={`${percentage}% used, ${urlLength} of ${MAX_CUSTOM_MAP_URL_LENGTH} encoded URL characters`}
                sx={{
                    height: 8,
                    bgcolor: "rgba(255,255,255,0.2)",
                    borderRadius: 4,
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        height: "100%",
                        width: `${Math.min(100, percent)}%`,
                        bgcolor: color,
                        transition: "width 0.2s, background-color 0.2s",
                    }}
                />
            </Box>
            <Box
                sx={{
                    mt: 0.5,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 1,
                    flexWrap: "wrap",
                }}
            >
                <span>
                    {(urlLength / 1024).toFixed(1)} /{" "}
                    {MAX_CUSTOM_MAP_URL_LENGTH / 1024} KiB
                </span>
                <span>
                    {level.mapObstacles.length} / {MAX_MAP_COMPONENTS}{" "}
                    components
                </span>
            </Box>
            {warning && (
                <Box
                    role="status"
                    sx={{
                        mt: 0.5,
                        color: componentLimitReached ? "#fbbf24" : color,
                    }}
                >
                    {warning}
                </Box>
            )}
            <Box
                sx={{
                    mt: 0.5,
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.7rem",
                }}
            >
                Chrome limit. Hosting and sharing services may accept shorter
                URLs only.
            </Box>
        </Box>
    );
}
