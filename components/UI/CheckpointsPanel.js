"use client";

import { useId, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArticlesButton from "./Button";
import { useParkourStore } from "@/hooks/useParkourStore";
import { useStore } from "@/hooks/useStore";

const sectionSx = { p: "0.5rem", borderBottom: 1, borderColor: "divider" };

export default function CheckpointsPanel() {
    const [expanded, setExpanded] = useState(false);
    const checkpointListId = useId();
    const checkpoints = useParkourStore((state) => state.checkpoints);
    const resetCheckpoints = useParkourStore((state) => state.resetCheckpoints);
    const debug = useStore((state) => state.debug);

    const teleportToCheckpoint = (name) => {
        // Recheck the current unlock state in case progress was just reset.
        const { checkpoints, teleportPlayer } = useParkourStore.getState();
        const checkpoint = checkpoints.find((item) => item.name === name);
        if (checkpoint?.locked !== false || checkpoint.location.length !== 3)
            return;
        teleportPlayer(checkpoint.location);
    };

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
                <Box component="h2" sx={{ m: 0, fontSize: "inherit" }}>
                    Checkpoints
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    {debug && (
                        <Tooltip title="Reset checkpoints">
                            <IconButton
                                size="small"
                                aria-label="Reset checkpoints"
                                onClick={resetCheckpoints}
                            >
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip
                        title={expanded ? "Collapse checkpoints" : "Expand checkpoints"}
                    >
                        <IconButton
                            size="small"
                            aria-label={expanded ? "Collapse checkpoints" : "Expand checkpoints"}
                            aria-expanded={expanded}
                            aria-controls={checkpointListId}
                            onClick={() => setExpanded((value) => !value)}
                        >
                            {expanded ? (
                                <ExpandLessIcon fontSize="small" />
                            ) : (
                                <ExpandMoreIcon fontSize="small" />
                            )}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Box
                sx={{
                    ...sectionSx,
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                }}
            >
                {checkpoints
                    .filter((checkpoint) => checkpoint.location.length === 3)
                    .map((checkpoint) => (
                        <ArticlesButton
                            key={checkpoint.name}
                            small
                            disabled={checkpoint.locked !== false}
                            onClick={() => teleportToCheckpoint(checkpoint.name)}
                        >
                            {checkpoint.name}
                        </ArticlesButton>
                    ))}
            </Box>
            <Collapse in={expanded} id={checkpointListId}>
                <Box sx={{ p: "0.5rem" }}>
                    {checkpoints.map((checkpoint) => (
                        <Box key={checkpoint.name} sx={{ mb: "0.5rem" }}>
                            <Box sx={{ fontSize: "0.875em" }}>
                                {checkpoint.name}
                            </Box>
                            <Box>{checkpoint.locked ? "Locked" : "Unlocked"}</Box>
                        </Box>
                    ))}
                </Box>
            </Collapse>
        </Card>
    );
}
