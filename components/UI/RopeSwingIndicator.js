"use client";

import Box from "@mui/material/Box";
import { useParkourStore } from "@/hooks/useParkourStore";

export default function RopeSwingIndicator() {
    const attached = useParkourStore((state) => !!state.ropeAttachment);
    if (!attached) return null;

    return (
        <Box
            role="status"
            sx={{
                position: "absolute",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 2,
                pointerEvents: "none",
                bgcolor: "rgba(0,0,0,0.65)",
                color: "white",
                borderRadius: 2,
                px: 2,
                py: 1,
                fontSize: "0.875rem",
                textAlign: "center",
            }}
        >
            W/S, ↑/↓ or left stick: climb · Space/A: jump off
        </Box>
    );
}
