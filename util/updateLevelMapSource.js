import babel from "next/dist/compiled/babel/core";

const parserOptions = {
    sourceType: "module",
    babelrc: false,
    configFile: false,
};

function propertyNamed(object, name) {
    return object.properties.find(
        (property) =>
            property.type === "ObjectProperty" &&
            !property.computed &&
            (property.key.name ?? property.key.value) === name,
    );
}

export default function updateLevelMapSource(
    source,
    mapName,
    mapObstacles,
    colorSeed,
) {
    // Parse without executing the level file or replacing other maps and helpers.
    const ast = babel.parseSync(source, parserOptions);
    const declaration = ast.program.body
        .filter(
            (node) =>
                node.type === "ExportNamedDeclaration" &&
                node.declaration?.type === "VariableDeclaration",
        )
        .flatMap((node) => node.declaration.declarations)
        .find(
            (node) =>
                node.id.type === "Identifier" && node.id.name === "levelMaps",
        );
    if (declaration?.init?.type !== "ArrayExpression")
        throw new Error(
            "Expected an exported levelMaps array in data/levelMaps.js.",
        );

    const matches = declaration.init.elements.filter(
        (node) =>
            node?.type === "ObjectExpression" &&
            propertyNamed(node, "mapName")?.value?.type === "StringLiteral" &&
            propertyNamed(node, "mapName").value.value === mapName,
    );
    if (matches.length !== 1)
        throw new Error(
            `Could not find a unique built-in map named "${mapName}" in levelMaps.js.`,
        );
    const property = propertyNamed(matches[0], "mapObstacles");
    if (!property || property.shorthand)
        throw new Error(
            `Map "${mapName}" needs a mapObstacles property to save to code.`,
        );

    const lineStart = source.lastIndexOf("\n", property.start - 1) + 1;
    const indent = source.slice(lineStart, property.start).match(/^[\t ]*/)[0];
    const newline = source.includes("\r\n") ? "\r\n" : "\n";
    const replacement = JSON.stringify(mapObstacles, null, 4).replace(
        /\n/g,
        `${newline}${indent}`,
    );
    const edits = [
        {
            start: property.value.start,
            end: property.value.end,
            value: replacement,
        },
    ];
    const seedProperty = propertyNamed(matches[0], "colorSeed");
    if (seedProperty) {
        edits.push({
            start: seedProperty.start,
            end: seedProperty.end,
            value: `colorSeed: ${JSON.stringify(colorSeed)}`,
        });
    } else {
        const mapNameProperty = propertyNamed(matches[0], "mapName");
        edits.push({
            start: mapNameProperty.end,
            end: mapNameProperty.end,
            value: `,${newline}${indent}colorSeed: ${JSON.stringify(colorSeed)}`,
        });
    }
    // Apply replacements from the end so all ranges still refer to the original source.
    const updated = edits
        .sort((a, b) => b.start - a.start)
        .reduce(
            (text, edit) =>
                text.slice(0, edit.start) + edit.value + text.slice(edit.end),
            source,
        );
    // Check the resulting source before writing it to disk.
    babel.parseSync(updated, parserOptions);
    return updated;
}
