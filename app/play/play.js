"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import classNames from "classnames";
import useFullscreen from "@articles-media/articles-dev-box/useFullscreen";
import GameMenu from "@articles-media/articles-dev-box/GameMenu";
import { useStore } from "@/hooks/useStore";
import LeftPanelContent from "@/components/UI/LeftPanel";
import CameraZoomIndicator from "@/components/UI/CameraZoomIndicator";
import RopeSwingIndicator from "@/components/UI/RopeSwingIndicator";
import SprintMeter from "@/components/UI/SprintMeter";
import CustomMapUrlMeter from "@/components/UI/CustomMapUrlMeter";
import { useLevelEditorStore } from "@/hooks/useLevelEditorStore";

const GameCanvas = dynamic(() => import("@/components/Game/GameCanvas"), {
    ssr: false,
});

export default function ParkourGamePage() {
    const searchParams = useSearchParams();
    const mapParam = searchParams.get("map");
    const componentsParam = searchParams.get("components");
    const editParam = searchParams.get("edit");
    const hydrated = useStore((state) => state._hasHydrated);
    const debug = useStore((state) => state.debug);
    const level = useLevelEditorStore((state) => state.level);
    const loadError = useLevelEditorStore((state) => state.loadError);
    const editMode = useLevelEditorStore((state) => state.editMode);
    const isCustom = useLevelEditorStore((state) => state.isCustom);
    const sceneKey = useStore((state) => state.sceneKey);
    const showMenu = useStore((state) => state.showMenu);
    const sidebar = useStore((state) => state.sidebar);
    const { isFullscreen } = useFullscreen();

    useEffect(() => {
        if (hydrated)
            useLevelEditorStore
                .getState()
                .initializeRoute(mapParam, componentsParam, editParam);
    }, [hydrated, mapParam, componentsParam, editParam]);
    useEffect(() => () => useLevelEditorStore.getState().clearSession(), []);
    useEffect(() => {
        if (!debug && editMode && !isCustom)
            useLevelEditorStore.getState().setEditMode(false);
    }, [debug, editMode, isCustom]);

    return (
        <Box
            className={classNames(
                `${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`,
                {
                    "menu-open": showMenu,
                    fullscreen: isFullscreen,
                    "show-sidebar": sidebar,
                },
            )}
            id={`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`}
            sx={{
                position: "relative",
                display: "flex",
                "& canvas.fill": {
                    bgcolor: "rgb(255 255 255 / 35%)",
                    position: "initial !important",
                },
            }}
        >
            <GameMenu
                useStore={useStore}
                LeftPanelContent={LeftPanelContent}
                menuBarConfig={{
                    style: "Corner Button",
                    menuBarButtonPosition: "Left",
                }}
                sidebarConfig={{ style: "Static Panel" }}
            />
            <Box
                className="game-content"
                sx={{
                    zIndex: 1,
                    width: "100%",
                    top: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    position: "relative",
                    height: "100vh",
                    "& .blocker": {
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        bgcolor: "rgba(0,0,0,0.5)",
                        "& #instructions": {
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 1,
                            fontSize: "1rem",
                            fontWeight: "bold",
                        },
                    },
                }}
            >
                <Box
                    className="canvas-three-wrap"
                    id="game-canvas"
                    sx={{
                        border: "1px solid #000",
                        bgcolor: "#fff",
                        position: "absolute",
                        inset: 0,
                        height: "100%",
                        width: "100%",
                        "& canvas": {
                            height: "100% !important",
                            width: "100% !important",
                        },
                    }}
                >
                    {level && <GameCanvas key={sceneKey} />}
                    {loadError ? (
                        <Box
                            role="alert"
                            sx={{
                                position: "absolute",
                                inset: 0,
                                p: 3,
                                bgcolor: "background.paper",
                            }}
                        >
                            {loadError}
                            <Box>
                                <Link href="/">Back to maps</Link>
                            </Box>
                        </Box>
                    ) : (
                        level && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 16,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    zIndex: 2,
                                    px: 1,
                                    bgcolor: "background.paper",
                                    pointerEvents: "none",
                                }}
                            >
                                {level.mapName}
                                {editMode ? " · Edit mode" : ""}
                            </Box>
                        )
                    )}
                    {!editMode && <CameraZoomIndicator />}
                    {!editMode && <RopeSwingIndicator />}
                </Box>
                <CustomMapUrlMeter />
                {!editMode && <SprintMeter />}
            </Box>
        </Box>
    );
}
