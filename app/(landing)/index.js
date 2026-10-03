"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ArticlesButton from "@/components/UI/Button";
import { useSocketStore } from "@/hooks/useSocketStore";
import { useStore } from "@/hooks/useStore";
import useUserDetails from "@articles-media/articles-dev-box/useUserDetails";
import useUserToken from "@articles-media/articles-dev-box/useUserToken";
import NicknameInput from "@articles-media/articles-dev-box/NicknameInput";
import GameMenuPrimaryButtonGroup from "@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup";
import SessionButton from "@articles-media/articles-dev-box/SessionButton";

const ReturnToLauncherButton = dynamic(
    () => import("@articles-media/articles-dev-box/ReturnToLauncherButton"),
    { ssr: false },
);
const GameScoreboard = dynamic(
    () => import("@articles-media/articles-dev-box/GameScoreboard"),
    { ssr: false },
);
const Ad = dynamic(
    () => import("@articles-media/articles-dev-box/Ad"),
    { ssr: false },
);

const maps = [
    { name: "Beginner", description: "Learn the basics", ready: true },
    { name: "Intermediate", description: "Heating up", ready: false },
    { name: "Advanced", description: "You shall not pass", ready: false },
    { name: "Expert", description: "You shall not pass", ready: false },
];

export default function CannonGameLobbyPage() {
    const socket = useSocketStore((state) => state.socket);
    const darkMode = useStore((state) => state.darkMode);

    useEffect(() => {
        const room = `game:${process.env.NEXT_PUBLIC_GAME_KEY}-landing`;
        if (socket.connected) socket.emit("join-room", room);
        return () => socket.emit("leave-room", room);
    }, [socket, socket.connected]);

    const { data: userToken } = useUserToken(process.env.NEXT_PUBLIC_GAME_PORT);
    const { data: userDetails, isLoading: userDetailsLoading } = useUserDetails({ token: userToken });

    return (
        <Box
            sx={{
                position: "relative",
                isolation: "isolate",
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                "& .ad-wrap": {
                    mt: "1rem",
                    "@media (min-width: 992px)": {
                        mt: 0,
                        display: "block",
                        position: "absolute",
                        right: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                    },
                },
            }}
        >
            <Box sx={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: -1 }}>
                <Box
                    component={Image}
                    src={`${process.env.NEXT_PUBLIC_CDN}games/Parkour/parkour-background.jpg`}
                    alt=""
                    fill
                    sx={{ objectFit: "cover", objectPosition: "center", filter: "blur(10px)" }}
                />
            </Box>

            <Box
                sx={{
                    width: "100%",
                    mx: "auto",
                    px: "0.75rem",
                    py: "1rem",
                    display: "flex",
                    flexDirection: "column-reverse",
                    justifyContent: "center",
                    alignItems: "center",
                    "@media (min-width: 576px)": { maxWidth: "540px" },
                    "@media (min-width: 768px)": { maxWidth: "720px" },
                    "@media (min-width: 992px)": { maxWidth: "960px", flexDirection: "row" },
                    "@media (min-width: 1200px)": { maxWidth: "1140px" },
                    "@media (min-width: 1400px)": { maxWidth: "1320px" },
                }}
            >
                <Box sx={{ width: "20rem", maxWidth: "100%" }}>
                    <Card sx={{ mb: "1rem", bgcolor: "game.card", backgroundImage: "none", border: 1, borderColor: "divider", fontSize: "0.875rem" }}>
                        <Box sx={{ p: "0.5rem", display: "flex", alignItems: "center", borderBottom: 1, borderColor: "divider" }}>
                            <NicknameInput useStore={useStore} />
                        </Box>
                        <CardContent sx={{ p: "0.5rem", "&:last-child": { pb: "0.5rem" } }}>
                            <Typography sx={{ fontSize: "0.875em", fontWeight: 700 }}>Official Maps</Typography>
                            <Box sx={{ display: "grid", gap: "5px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", mb: "1rem" }}>
                                {maps.map((map) => (
                                    <Box
                                        key={map.name}
                                        sx={{ p: "0.5rem", border: "1px solid rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", alignItems: "center" }}
                                    >
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", mb: "0.5rem" }}>
                                            {map.name}
                                        </Box>
                                        <ArticlesButton
                                            component={Link}
                                            href={{ pathname: "/play", query: { map: map.name } }}
                                            sx={{ px: "3rem" }}
                                            small
                                            disabled={!map.ready}
                                        >
                                            Play
                                        </ArticlesButton>
                                    </Box>
                                ))}
                            </Box>
                            <Typography sx={{ fontSize: "0.875em", fontWeight: 700 }}>Submitted Maps</Typography>
                            <Typography sx={{ fontSize: "0.875em" }}>Coming soon...</Typography>
                        </CardContent>
                        <Box sx={{ p: "0.5rem", borderTop: 1, borderColor: "divider", display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                            <GameMenuPrimaryButtonGroup useStore={useStore} type="Landing" useRouter={useRouter} />
                        </Box>
                    </Card>
                    <SessionButton port={process.env.NEXT_PUBLIC_GAME_PORT} friendsButton />
                    <ReturnToLauncherButton />
                </Box>
                <GameScoreboard game={process.env.NEXT_PUBLIC_GAME_NAME} style="Default" darkMode={Boolean(darkMode)} />
                <Ad
                    style="Default"
                    section="Games"
                    section_id={process.env.NEXT_PUBLIC_GAME_NAME}
                    darkMode={Boolean(darkMode)}
                    user_ad_token={userToken}
                    userDetails={userDetails}
                    userDetailsLoading={userDetailsLoading}
                />
            </Box>
        </Box>
    );
}
