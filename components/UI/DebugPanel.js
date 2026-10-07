"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArticlesSwitch from "./ArticlesSwitch";
import { useParkourStore } from "@/hooks/useParkourStore";
import { useStore } from "@/hooks/useStore";

const sectionSx = { p: "0.5rem", borderBottom: 1, borderColor: "divider" };

export default function DebugPanel() {
    const [copyMessage, setCopyMessage] = useState(null);
    const debug = useStore((state) => state.debug);
    const flyMode = useStore((state) => state.flyMode);
    const setFlyMode = useStore((state) => state.setFlyMode);
    const position = useParkourStore((state) => state.position);
    const coordinates = `[${position.map((value) => value.toFixed(2)).join(", ")}]`;

    const copyCoordinates = async () => {
        try {
            await navigator.clipboard.writeText(coordinates);
            setCopyMessage("Coordinates copied");
        } catch {
            setCopyMessage("Could not copy coordinates");
        }
    };

    if (!debug) return null;

    return (
        <Card sx={{ border: 1, borderColor: "divider", fontSize: "0.875rem" }}>
            <Box
                sx={{
                    ...sectionSx,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Box
                    component="h2"
                    sx={{ m: 0, fontSize: "inherit" }}
                >
                    Debug
                </Box>
            </Box>
            <Box sx={sectionSx}>
                <FormControlLabel
                    control={
                        <ArticlesSwitch
                            checked={flyMode}
                            setChecked={setFlyMode}
                        />
                    }
                    label="Fly mode (G)"
                    sx={{ m: 0 }}
                />
                {flyMode && (
                    <Box
                        sx={{
                            mt: 0.5,
                            fontSize: "0.8rem",
                            color: "text.secondary",
                        }}
                    >
                        WASD / arrows: fly · Space: rise · C: descend · Shift:
                        faster
                        <br />
                        Controller: left stick to fly, A to rise, B to descend.
                    </Box>
                )}
            </Box>
            <Box
                sx={{
                    ...sectionSx,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                }}
            >
                <Tooltip title="Copy coordinates">
                    <IconButton
                        size="small"
                        aria-label="Copy coordinates"
                        onClick={copyCoordinates}
                    >
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>
                <Box
                    component="span"
                    sx={{
                        whiteSpace: "nowrap",
                        fontVariantNumeric: "tabular-nums",
                    }}
                >
                    {coordinates}
                </Box>
            </Box>
            <Snackbar
                open={copyMessage !== null}
                autoHideDuration={2000}
                onClose={() => setCopyMessage(null)}
                message={copyMessage}
            />
        </Card>
    );
}
