import { useCallback, useEffect, useState } from "react";
import { useStore } from "./useStore";

function actionByKey(key) {
    const keyActionMap = {
        KeyW: "moveForward",
        KeyS: "moveBackward",
        KeyA: "moveLeft",
        KeyD: "moveRight",
        ArrowUp: "moveForward",
        ArrowDown: "moveBackward",
        ArrowLeft: "moveLeft",
        ArrowRight: "moveRight",
        Space: "jump",
        ShiftLeft: "shift",
        KeyC: "crouch",
        KeyV: "cameraView",
        Digit1: "dirt",
        Digit2: "grass",
        Digit3: "glass",
        Digit4: "wood",
        Digit5: "log",
    };
    return keyActionMap[key];
}

export const useKeyboard = () => {
    const [actions, setActions] = useState({
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        jump: false,
        shift: false,
        crouch: false,
        cameraView: false,
        dirt: false,
        grass: false,
        glass: false,
        wood: false,
        log: false,
    });

    const handleKeyDown = useCallback((e) => {
        if (e.code === "KeyG") {
            if (
                e.repeat ||
                e.isComposing ||
                e.defaultPrevented ||
                e.ctrlKey ||
                e.altKey ||
                e.metaKey ||
                e.target?.closest?.(
                    'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]',
                )
            )
                return;

            const { debug, toggleFlyMode } = useStore.getState();
            if (debug) {
                e.preventDefault();
                toggleFlyMode();
            }
            return;
        }

        const action = actionByKey(e.code);
        if (action) {
            setActions((prev) => {
                return {
                    ...prev,
                    [action]: true,
                };
            });
        }
    }, []);

    const handleKeyUp = useCallback((e) => {
        const action = actionByKey(e.code);
        if (action) {
            setActions((prev) => {
                return {
                    ...prev,
                    [action]: false,
                };
            });
        }
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    return actions;
};
