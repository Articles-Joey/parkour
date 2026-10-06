"use client";

import Box from "@mui/material/Box";
import { useParkourStore } from "@/hooks/useParkourStore";

export default function SprintMeter() {
    const sprintEnergy = useParkourStore((state) => state.sprintEnergy);
    const isSprinting = useParkourStore((state) => state.isSprinting);
    const percent = Math.round(sprintEnergy * 100);

    return (
        <Box
            className="sprint-meter"
            sx={{
                position: "absolute",
                bottom: "max(24px, env(safe-area-inset-bottom))",
                left: "50%",
                transform: "translateX(-50%)",
                width: "min(220px, 60%)",
                zIndex: 2,
                pointerEvents: "none",
                color: "white",
                textShadow: "0 1px 3px rgba(0,0,0,0.8)",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                }}
            >
                <span>Sprint</span>
                <span>{percent}%</span>
            </Box>
            <Box
                role="progressbar"
                aria-label="Sprint stamina"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                sx={{
                    height: 8,
                    bgcolor: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.4)",
                    borderRadius: 4,
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        height: "100%",
                        width: `${sprintEnergy * 100}%`,
                        bgcolor:
                            percent <= 20
                                ? "#f59e0b"
                                : isSprinting
                                  ? "#38bdf8"
                                  : "#e2e8f0",
                        borderRadius: 4,
                        transition: "width 0.1s linear, background-color 0.2s",
                    }}
                />
            </Box>
        </Box>
    );
}
