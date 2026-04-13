// CO₂ Offset Estimation Calculator
// Based on peer-reviewed environmental science data

const CO2_RATES = {
  tree_planting: {
    label: 'Tree Planting',
    kgCo2PerUnit: 22,        // 22 kg CO₂/year per tree
    unit: 'trees',
  },
  solar_panel: {
    label: 'Solar Panel Installation',
    kgCo2PerUnit: 1500,      // 1,500 kg CO₂/year per kW
    unit: 'kW',
  },
  sustainable_farming: {
    label: 'Sustainable Farming',
    kgCo2PerUnit: 3670,      // 3,670 kg CO₂/year per hectare
    unit: 'hectares',
  },
  composting: {
    label: 'Composting',
    kgCo2PerUnit: 0.5,       // 0.5 kg CO₂ saved per kg waste
    unit: 'kg waste',
  },
  renewable_energy: {
    label: 'Renewable Energy',
    kgCo2PerUnit: 900,       // 900 kg CO₂/year per kW
    unit: 'kW',
  },
  reforestation: {
    label: 'Reforestation',
    kgCo2PerUnit: 11000,     // 11,000 kg CO₂/year per hectare
    unit: 'hectares',
  },
};

/**
 * Calculate estimated CO₂ offset in kg
 * @param {string} actionType - Type of eco-action
 * @param {number} quantity - Quantity in the action's unit
 * @returns {number} Estimated CO₂ offset in kg
 */
export function calculateCo2Offset(actionType, quantity) {
  const rate = CO2_RATES[actionType];
  if (!rate) return 0;
  return Math.round(rate.kgCo2PerUnit * quantity * 100) / 100;
}

/**
 * Convert CO₂ kg to CLC tokens (1 CLC = 1 kg CO₂)
 */
export function co2ToCredits(co2Kg) {
  return Math.round(co2Kg * 100) / 100;
}

export { CO2_RATES };
