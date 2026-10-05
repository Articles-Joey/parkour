"use client";

import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import classNames from "classnames";
import useFullscreen from "@articles-media/articles-dev-box/useFullscreen";
import GameMenu from "@articles-media/articles-dev-box/GameMenu";
import { useStore } from "@/hooks/useStore";
import LeftPanelContent from "@/components/UI/LeftPanel";
import CameraZoomIndicator from "@/components/UI/CameraZoomIndicator";
import RopeSwingIndicator from "@/components/UI/RopeSwingIndicator";

const GameCanvas = dynamic(() => import("@/components/Game/GameCanvas"), { ssr: false });

export default function ParkourGamePage() {
    const sceneKey = useStore((state) => state.sceneKey);
    const showMenu = useStore((state) => state.showMenu);
    const sidebar = useStore((state) => state.sidebar);
    const { isFullscreen } = useFullscreen();

    return (
        <Box
            className={classNames(`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`, {
                "menu-open": showMenu,
                fullscreen: isFullscreen,
                "show-sidebar": sidebar,
            })}
            id={`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`}
            sx={{
                position: "relative",
                display: "flex",
                "& canvas.fill": { bgcolor: "rgb(255 255 255 / 35%)", position: "initial !important" },
            }}
        >
            <GameMenu
                useStore={useStore}
                LeftPanelContent={LeftPanelContent}
                menuBarConfig={{ style: "Corner Button", menuBarButtonPosition: "Left" }}
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
                        "& canvas": { height: "100% !important", width: "100% !important" },
                    }}
                >
                    <GameCanvas key={sceneKey} />
                    <CameraZoomIndicator />
                    <RopeSwingIndicator />
                </Box>
            </Box>
        </Box>
    );
}
