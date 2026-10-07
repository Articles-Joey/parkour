const MIN_GROUND_NORMAL_Y = 0.65;
const GROUND_CONTACT_TOLERANCE = 0.03;

export function getGroundSupport(
    world,
    playerCollider,
    minNormalY = MIN_GROUND_NORMAL_Y,
    normalTarget,
) {
    let support = null;
    world.contactPairsWith(playerCollider, (other) => {
        if (support || !other.isEnabled() || other.isSensor()) return;
        world.contactPair(playerCollider, other, (manifold, flipped) => {
            // The manifold normal points away from its first collider.
            const normal = manifold.normal();
            const sign = flipped ? 1 : -1;
            const normalY = normal.y * sign;
            if (normalY < minNormalY) return;
            for (let i = 0; i < manifold.numSolverContacts(); i++) {
                if (manifold.solverContactDist(i) <= GROUND_CONTACT_TOLERANCE) {
                    support = other;
                    normalTarget?.set(
                        normal.x * sign,
                        normalY,
                        normal.z * sign,
                    );
                    return;
                }
            }
        });
    });
    return support;
}
