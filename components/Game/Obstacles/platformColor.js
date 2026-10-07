// React's key is not passed as a prop; use the same value as obstacleKey.
export function getPlatformColor(obstacleKey, seed = 1) {
    const input = JSON.stringify([seed, obstacleKey]);
    let hash = 2166136261;

    for (let i = 0; i < input.length; i++) {
        hash = Math.imul(hash ^ input.charCodeAt(i), 16777619);
    }

    // Mix the bits so neighboring obstacle keys have visibly different colors.
    hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
    hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
    hash = (hash ^ (hash >>> 16)) >>> 0;

    const hue = (hash / 4294967296) * 360;
    const saturation = 60 + ((hash >>> 8) % 21);
    const lightness = 45 + ((hash >>> 16) % 16);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
