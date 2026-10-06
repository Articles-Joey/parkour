// Durations are in seconds. Adjust these values to tune sprinting.
export const SPRINT_DURATION = 3;
export const SPRINT_RECHARGE_DELAY = 2;
export const SPRINT_RECHARGE_DURATION = 3;
export const SPRINT_SPEED_MULTIPLIER = 2;

export function stepSprint(state, requestingSprint, delta) {
    let { sprintEnergy, sprintIdleSeconds } = state;
    const isSprinting = requestingSprint && sprintEnergy > 0;

    if (requestingSprint) {
        // Holding sprint while moving keeps recharge paused, even when empty.
        sprintIdleSeconds = 0;
        if (isSprinting) {
            sprintEnergy = Math.max(0, sprintEnergy - delta / SPRINT_DURATION);
        }
    } else {
        const rechargeSeconds = Math.max(
            0,
            delta - Math.max(0, SPRINT_RECHARGE_DELAY - sprintIdleSeconds),
        );
        sprintIdleSeconds = Math.min(
            SPRINT_RECHARGE_DELAY,
            sprintIdleSeconds + delta,
        );
        sprintEnergy = Math.min(
            1,
            sprintEnergy + rechargeSeconds / SPRINT_RECHARGE_DURATION,
        );
    }

    return { sprintEnergy, sprintIdleSeconds, isSprinting };
}
