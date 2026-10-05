"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import BugReportIcon from "@mui/icons-material/BugReport";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArticlesButton from "@/components/UI/Button";
import { useParkourStore } from "@/hooks/useParkourStore";
import { useStore } from "@/hooks/useStore";
import GameMenuPrimaryButtonGroup from "@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup";

const cardSx = { border: 1, borderColor: "divider", fontSize: "0.875rem" };
const sectionSx = { p: "0.5rem", borderBottom: 1, borderColor: "divider" };

export default function LeftPanelContent() {
    const [debugAnchor, setDebugAnchor] = useState(null);
    const [cameraAnchor, setCameraAnchor] = useState(null);
    const resetCheckpoints = useParkourStore((state) => state.resetCheckpoints);
    const isThirdPerson = useParkourStore((state) => state.isThirdPerson);
    const setThirdPerson = useParkourStore((state) => state.setThirdPerson);
    const debug = useParkourStore((state) => state.debug);
    const setDebug = useParkourStore((state) => state.setDebug);
    const position = useParkourStore((state) => state.position);
    const checkpoints = useParkourStore((state) => state.checkpoints);
    const teleportPlayer = useParkourStore((state) => state.teleportPlayer);

    return (
        <Box sx={{ width: "100%" }}>
            <Card sx={cardSx}>
                <CardContent sx={{ p: "0.5rem", display: "flex", flexWrap: "wrap" }}>
                    <GameMenuPrimaryButtonGroup useStore={useStore} type="GameMenu" useRouter={useRouter} />
                </CardContent>
                <CardContent sx={{ p: "0.5rem", "&:last-child": { pb: "0.5rem" }, display: "flex", flexWrap: "wrap" }}>
                    <Box sx={{ width: "50%" }}>
                        <ArticlesButton
                            small
                            sx={{ width: "100%" }}
                            startIcon={<BugReportIcon />}
                            aria-haspopup="menu"
                            aria-controls={debugAnchor ? "debug-menu" : undefined}
                            aria-expanded={Boolean(debugAnchor)}
                            onClick={(event) => setDebugAnchor(event.currentTarget)}
                        >
                            Debug {debug ? "On" : "Off"}
                        </ArticlesButton>
                        <Menu
                            id="debug-menu"
                            anchorEl={debugAnchor}
                            open={Boolean(debugAnchor)}
                            onClose={() => setDebugAnchor(null)}
                            slotProps={{ paper: { sx: { maxHeight: 600, width: 200 } } }}
                        >
                            {[false, true].map((value) => (
                                <MenuItem key={String(value)} selected={debug === value} onClick={() => { setDebug(value); setDebugAnchor(null); }}>
                                    {value ? "True" : "False"}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    <Box sx={{ width: "50%" }}>
                        <ArticlesButton
                            small
                            sx={{ width: "100%" }}
                            startIcon={<CameraAltIcon />}
                            aria-haspopup="menu"
                            aria-controls={cameraAnchor ? "camera-menu" : undefined}
                            aria-expanded={Boolean(cameraAnchor)}
                            onClick={(event) => setCameraAnchor(event.currentTarget)}
                        >
                            {isThirdPerson ? "Third person" : "First person"}
                        </ArticlesButton>
                        <Menu
                            id="camera-menu"
                            anchorEl={cameraAnchor}
                            open={Boolean(cameraAnchor)}
                            onClose={() => setCameraAnchor(null)}
                            slotProps={{ paper: { sx: { maxHeight: 600, width: 200 } } }}
                        >
                            {["First person", "Third person"].map((name, index) => (
                                <MenuItem key={name} selected={isThirdPerson === (index === 1)} onClick={() => { setThirdPerson(index === 1); setCameraAnchor(null); }} sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <CameraAltIcon fontSize="small" />
                                    {name}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </CardContent>
            </Card>
            <Card sx={cardSx}>
                <Box sx={{ ...sectionSx, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>Debug</Box>
                    <IconButton size="small" aria-label="Reset checkpoints" onClick={resetCheckpoints}>
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Box>
                <Box sx={{ ...sectionSx, p: "0.25rem", display: "flex", justifyContent: "center" }}>
                    <ArticlesButton small onClick={() => teleportPlayer([0, 5, 0])}>Start</ArticlesButton>
                    {Array.from({ length: 4 }, (_, index) => {
                        const checkpoint = checkpoints.find((item) => item.name == index + 1);
                        return (
                            <ArticlesButton
                                key={index}
                                small
                                onClick={() => {
                                    teleportPlayer(checkpoint?.location);
                                }}
                            >
                                {index + 1}
                            </ArticlesButton>
                        );
                    })}
                    <ArticlesButton small disabled>End</ArticlesButton>
                </Box>
                <Box sx={sectionSx}>
                    <Box>{position?.[0].toFixed(2)}</Box>
                    <Box>{position?.[1].toFixed(2)}</Box>
                    <Box>{position?.[2].toFixed(2)}</Box>
                </Box>
                <Box sx={{ p: "0.5rem" }}>
                    {checkpoints.map((checkpoint, index) => (
                        <Box key={index} sx={{ mb: "0.5rem" }}>
                            <Box sx={{ fontSize: "0.875em" }}>{checkpoint.name}</Box>
                            <Box>{checkpoint.locked ? "Locked" : "Unlocked"}</Box>
                        </Box>
                    ))}
                </Box>
            </Card>
        </Box>
    );
}
