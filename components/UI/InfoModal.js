"use client";

import { useCallback, useRef, useState } from "react";
import Box from "@mui/material/Box";
import ArticlesModal from "./ArticlesModal";
import ArticlesButton from "./Button";
import { useModalNavigation } from "@/hooks/useModalNavigation";
import B from "@articles-media/articles-gamepad-helper/dist/img/Xbox UI/B.svg";

export default function InfoModal({ show = true, setShow }) {
    const [showModal, setShowModal] = useState(true);
    const elementsRef = useRef([]);
    const close = useCallback(() => setShowModal(false), []);
    useModalNavigation(elementsRef, close);

    return (
        <ArticlesModal
            show={show && showModal}
            setShow={setShow}
            title="Game Info"
            contentSx={{ p: 0 }}
            footerOverride={(setOpen) => (
                <>
                    <Box />
                    <ArticlesButton
                        ref={(element) => { elementsRef.current[0] = element; }}
                        variant="outline-dark"
                        onClick={() => setOpen(false)}
                        sx={{ display: "flex", alignItems: "center" }}
                    >
                        <Box component="img" src={B.src} className="controller-only" alt="" sx={{ mr: "0.25rem" }} />
                        Close
                    </ArticlesButton>
                </>
            )}
        >
            <Box sx={{ aspectRatio: "16 / 9", position: "relative" }}>
                <Box component="img" src="/img/preview.webp" alt="Game preview" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
            <Box sx={{ p: "1rem" }}>...</Box>
        </ArticlesModal>
    );
}
