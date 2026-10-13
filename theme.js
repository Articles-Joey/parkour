"use client";

import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";
import { bootstrapCompatibilityTheme } from "@articles-media/articles-dev-box/bootstrapCompatibilityTheme";

const roboto = Roboto({
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
});

export function createAppTheme(mode = "dark") {
    return createTheme({
        cssVariables: true,
        palette: {
            mode,
            primary: { main: "#f9edcd" },
        },
        typography: {
            fontFamily: roboto.style.fontFamily,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: { fontSize: "0.75rem" },
                },
            },
            MuiAlert: {
                styleOverrides: {
                    root: {
                        variants: [
                            {
                                props: { severity: "info" },
                                style: { backgroundColor: "#60a5fa" },
                            },
                        ],
                    },
                },
            },
            MuiCssBaseline: {
                // Dev-box still uses these compatibility utilities internally.
                styleOverrides: (muiTheme) => ({
                    ...bootstrapCompatibilityTheme.MuiCssBaseline.styleOverrides(
                        muiTheme,
                    ),
                    ":root": {
                        "--articles-card-font-color":
                            mode === "dark" ? "#fff" : "#212529",
                    },
                    ".stats-overlay": {
                        position: "fixed",
                        top: 0,
                        right: "0 !important",
                        left: "initial !important",
                        zIndex: 4,
                    },
                    '[data-articles-dev-box-screenshot-mode="enabled"] .stats-overlay, [data-articles-dev-box-screenshot-mode="enabled"] .sprint-meter, [data-articles-dev-box-screenshot-mode="enabled"] .custom-map-url-meter, [data-articles-dev-box-screenshot-mode="enabled"] .level-name':
                        {
                            display: "none !important",
                        },
                }),
            },
        },
    });
}

export default createAppTheme();
