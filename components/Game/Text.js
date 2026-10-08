import { Suspense } from "react";
import { Billboard, Text as DreiText } from "@react-three/drei";
import { DoubleSide } from "three";

export default function Text({
    position,
    rotation,
    text = "Your text",
    fontSize = 1,
    color = "#ffffff",
    stroke = 0.03,
    strokeColor = "#000000",
    billboard = false,
}) {
    const label = (
        <DreiText
            fontSize={fontSize}
            color={color}
            anchorX="center"
            anchorY="middle"
            textAlign="center"
            outlineWidth={stroke}
            outlineColor={strokeColor}
            material-side={DoubleSide}
            material-toneMapped={false}
        >
            {text}
        </DreiText>
    );
    return (
        <group
            position={position}
            rotation={rotation}
        >
            <Suspense fallback={null}>
                {billboard ? <Billboard>{label}</Billboard> : label}
            </Suspense>
        </group>
    );
}
