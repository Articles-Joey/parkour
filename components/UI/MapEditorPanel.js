"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import ArticlesButton from "./Button";
import ArticlesSwitch from "./ArticlesSwitch";
import { MAP_COMPONENTS, MAX_MAP_COMPONENTS } from "@/data/mapComponents";
import { MAX_CUSTOM_MAP_URL_LENGTH } from "@/data/mapUtils";
import { useLevelEditorStore } from "@/hooks/useLevelEditorStore";
import { useStore } from "@/hooks/useStore";

function NumberField({ label, value, onCommit }) {
    const [draft, setDraft] = useState(String(value));
    useEffect(() => setDraft(String(value)), [value]);
    return (
        <TextField
            label={label}
            type="number"
            size="small"
            value={draft}
            sx={{ flex: 1, minWidth: 0 }}
            slotProps={{ htmlInput: { step: "any" } }}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => {
                const number = Number(draft);
                if (draft.trim() && Number.isFinite(number)) onCommit(number);
                setDraft(String(value));
            }}
            onKeyDown={(event) => {
                if (event.key === "Enter") event.target.blur();
            }}
        />
    );
}

function VectorFields({ label, value, onChange, axes = ["X", "Y", "Z"] }) {
    return (
        <Box>
            <Box sx={{ mb: 1 }}>{label}</Box>
            <Box sx={{ display: "flex", gap: 0.5 }}>
                {value.map((number, index) => (
                    <NumberField
                        key={index}
                        label={axes[index] ?? String(index + 1)}
                        value={number}
                        onCommit={(next) => {
                            const vector = [...value];
                            vector[index] = next;
                            onChange(vector);
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
}

export default function MapEditorPanel() {
    const [component, setComponent] = useState("Platform");
    const debug = useStore((state) => state.debug);
    const level = useLevelEditorStore((state) => state.level);
    const isCustom = useLevelEditorStore((state) => state.isCustom);
    const customUrlLength = useLevelEditorStore(
        (state) => state.customUrlLength,
    );
    const editMode = useLevelEditorStore((state) => state.editMode);
    const selectedId = useLevelEditorStore((state) => state.selectedObstacleId);
    const transformMode = useLevelEditorStore((state) => state.transformMode);
    const dirty = useLevelEditorStore((state) => state.dirty);
    const message = useLevelEditorStore((state) => state.message);
    if (!level || (!debug && !isCustom && !editMode)) return null;
    const editor = useLevelEditorStore.getState();
    const selected = level.mapObstacles.find((item) => item.id === selectedId);
    const update = (props) => editor.updateObstacleProps(selected.id, props);

    return (
        <Card
            sx={{
                border: 1,
                borderColor: "divider",
                fontSize: "0.875rem",
                mt: 0.5,
            }}
        >
            <Box sx={{ p: 1, borderBottom: 1, borderColor: "divider" }}>
                <Box
                    component="h2"
                    sx={{ m: 0, fontSize: "inherit" }}
                >
                    Map editor · {level.mapName}
                </Box>
                <FormControlLabel
                    control={
                        <ArticlesSwitch
                            checked={editMode}
                            setChecked={editor.setEditMode}
                        />
                    }
                    label="Edit mode"
                    sx={{ m: 0 }}
                />
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    <ArticlesButton
                        small
                        onClick={editor.saveMap}
                        disabled={!isCustom && !dirty}
                    >
                        {isCustom ? "Save URL" : "Save map"}
                    </ArticlesButton>
                    {isCustom ? (
                        <ArticlesButton
                            small
                            onClick={editor.copyShareLink}
                        >
                            Copy map link
                        </ArticlesButton>
                    ) : (
                        <ArticlesButton
                            small
                            onClick={editor.exportLevelData}
                        >
                            Export levels
                        </ArticlesButton>
                    )}
                </Box>
                <Box
                    sx={{
                        mt: 0.5,
                        color: "text.secondary",
                        fontSize: "0.8rem",
                    }}
                >
                    {isCustom
                        ? "Edits update the shareable URL automatically."
                        : "Saved edits stay on this device. Export levels to update project data."}
                </Box>
                {message && (
                    <Box
                        role="status"
                        sx={{ mt: 0.5 }}
                    >
                        {message}
                    </Box>
                )}
            </Box>
            {editMode && (
                <Box
                    sx={{
                        p: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        maxHeight: "65vh",
                        overflowY: "auto",
                    }}
                >
                    <Box sx={{ color: "text.secondary" }}>
                        Orbit by dragging, pan with right-drag, and zoom with
                        the wheel. Click a component, then drag its handles or
                        edit the fields below.
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                        <TextField
                            select
                            label="Add component"
                            size="small"
                            value={component}
                            onChange={(event) =>
                                setComponent(event.target.value)
                            }
                            sx={{ flex: 1 }}
                        >
                            {Object.entries(MAP_COMPONENTS)
                                .filter(([name]) => name !== "Player")
                                .map(([name, definition]) => (
                                    <MenuItem
                                        key={name}
                                        value={name}
                                    >
                                        {definition.label}
                                    </MenuItem>
                                ))}
                        </TextField>
                        <ArticlesButton
                            small
                            onClick={() => editor.addObstacle(component)}
                            disabled={
                                level.mapObstacles.length >=
                                    MAX_MAP_COMPONENTS ||
                                (isCustom &&
                                    customUrlLength >=
                                        MAX_CUSTOM_MAP_URL_LENGTH)
                            }
                        >
                            Add
                        </ArticlesButton>
                    </Box>
                    <TextField
                        select
                        label="Selected component"
                        size="small"
                        value={selected?.id ?? ""}
                        onChange={(event) =>
                            editor.selectObstacle(event.target.value || null)
                        }
                    >
                        <MenuItem value="">None</MenuItem>
                        {level.mapObstacles.map((item, index) => (
                            <MenuItem
                                key={item.id}
                                value={item.id}
                            >
                                {index + 1}.{" "}
                                {MAP_COMPONENTS[item.component].label}
                                {item.component === "Checkpoint"
                                    ? ` ${item.props.name}`
                                    : ""}
                            </MenuItem>
                        ))}
                    </TextField>
                    {selected && (
                        <>
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 0.5,
                                    flexWrap: "wrap",
                                }}
                            >
                                {["translate", "rotate"].map((mode) => (
                                    <ArticlesButton
                                        small
                                        key={mode}
                                        active={transformMode === mode}
                                        onClick={() =>
                                            editor.setTransformMode(mode)
                                        }
                                    >
                                        {mode === "translate"
                                            ? "Move"
                                            : "Rotate"}
                                    </ArticlesButton>
                                ))}
                                <ArticlesButton
                                    small
                                    onClick={editor.focusSelection}
                                >
                                    Focus
                                </ArticlesButton>
                                <ArticlesButton
                                    small
                                    onClick={editor.removeSelectedObstacle}
                                    disabled={selected.component === "Player"}
                                >
                                    Delete
                                </ArticlesButton>
                            </Box>
                            <VectorFields
                                label="Position [x, y, z]"
                                value={selected.props.position}
                                onChange={(position) => update({ position })}
                            />
                            <VectorFields
                                label="Rotation (degrees)"
                                value={selected.props.rotation.map(
                                    (value) =>
                                        Math.round(
                                            ((value * 180) / Math.PI) * 1000,
                                        ) / 1000,
                                )}
                                onChange={(rotation) =>
                                    update({
                                        rotation: rotation.map(
                                            (value) => (value * Math.PI) / 180,
                                        ),
                                    })
                                }
                            />
                            {Object.keys(
                                MAP_COMPONENTS[selected.component].props,
                            ).map((key) => {
                                const value = selected.props[key];
                                const label = key.replace(/([A-Z])/g, " $1");
                                if (Array.isArray(value))
                                    return (
                                        <VectorFields
                                            key={`${selected.id}-${key}`}
                                            label={label}
                                            value={value}
                                            axes={
                                                key === "args"
                                                    ? ["1", "2", "3", "4"]
                                                    : undefined
                                            }
                                            onChange={(next) =>
                                                update({ [key]: next })
                                            }
                                        />
                                    );
                                if (typeof value === "number")
                                    return (
                                        <NumberField
                                            key={`${selected.id}-${key}`}
                                            label={label}
                                            value={value}
                                            onCommit={(next) =>
                                                update({ [key]: next })
                                            }
                                        />
                                    );
                                return (
                                    <TextField
                                        key={`${selected.id}-${key}`}
                                        label={label}
                                        size="small"
                                        value={value}
                                        type={
                                            key === "color" ? "color" : "text"
                                        }
                                        onChange={(event) =>
                                            update({
                                                [key]: event.target.value,
                                            })
                                        }
                                    />
                                );
                            })}
                        </>
                    )}
                </Box>
            )}
        </Card>
    );
}
