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
    const energyWeight = 0.0025;
    const fatWeight = 0.2;
    const sugarWeight = 0.3; // increased penalty
    const saltWeight = 1.5;
    const proteinWeight = 0.2;

    // Adjust sugar penalty for very high sugar items
    const sugarPenalty = sugar > 10 ? sugar * sugarWeight * 1.5 : sugar * sugarWeight;

    let rawScore =
        energy * energyWeight +
        fats * fatWeight +
        sugarPenalty +
        salt * saltWeight -
        protein * proteinWeight;

    // Penalize nutrient-empty items
    if (protein === 0) rawScore += 0.3;

    let healthScore = Math.round(5 - rawScore);
    if (healthScore > 5) healthScore = 5;
    if (healthScore < 1) healthScore = 1;

    return healthScore;
}

