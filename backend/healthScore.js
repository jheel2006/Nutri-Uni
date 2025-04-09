// healthScore.js

/**
 * Calculates a health ranking from 1 (unhealthy) to 5 (healthy)
 * based on nutritional information per 100g.
 *
 * @param {number} energy - in kcal
 * @param {number} fats - in grams
 * @param {number} sugar - in grams
 * @param {number} salt - in grams
 * @param {number} protein - in grams
 * @returns {number} Health score (1 to 5)
 */
export function calculateHealthScore({ energy, fats, sugar, salt, protein }) {
    // Weighting factors (tweakable)
    const energyWeight = 0.0025;
    const fatWeight = 0.2;
    const sugarWeight = 0.15;
    const saltWeight = 1.5;
    const proteinWeight = 0.1;

    // Raw score: higher means worse
    let rawScore =
        energy * energyWeight +
        fats * fatWeight +
        sugar * sugarWeight +
        salt * saltWeight -
        protein * proteinWeight;

    // Convert to a 1–5 score (higher is healthier)
    let healthScore = Math.round(5 - rawScore);

    // Clamp the value between 1 and 5
    if (healthScore > 5) healthScore = 5;
    if (healthScore < 1) healthScore = 1;

    return healthScore;
}
