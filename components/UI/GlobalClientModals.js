"use client";

import GlobalModals from "@articles-media/articles-dev-box/GlobalClientModals";
import packageInfo from "@/package.json";
import { useStore } from "@/hooks/useStore";
import { useAudioStore } from "@/hooks/useAudioStore";
import { useTouchControlsStore } from "@/hooks/useTouchControlsStore";
import { useSocketStore } from "@/hooks/useSocketStore";

export default function GlobalClientModals() {
    return (
        <GlobalModals
            useStore={useStore}
            useAudioStore={useAudioStore}
            useTouchControlsStore={useTouchControlsStore}
            useSocketStore={useSocketStore}
            packageInfo={packageInfo}
            settingsModalConfig={{
                tabs: {
                    Graphics: { darkMode: true, landingAnimation: true },
                    Audio: {
                        sliders: Object.keys(
                            useAudioStore.getState().audioSettings,
                        )
                            .filter((key) => key !== "enabled")
                            .map((key) => ({
                                key,
                                label: key
                                    .split("_")
                                    .map(
                                        (word) =>
                                            word.charAt(0).toUpperCase() +
                                            word.slice(1),
                                    )
                                    .join(" "),
                            })),
                    },
                    Controls: { touchControls: true },
                    Multiplayer: { serverUrl: true },
                    Other: { toontownMode: true },
                },
            }}
            infoModalConfig={{ previewImage: "/img/preview.webp" }}
        />
    );
}
