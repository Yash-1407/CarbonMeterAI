// Carbon emission factors (kg CO2 equivalent per unit)
export const EMISSION_FACTORS = {
  transport: {
    car_gasoline: 0.404, // kg CO2 per mile
    car_diesel: 0.411, // kg CO2 per mile
    car_electric: 0.189, // kg CO2 per mile (varies by grid)
    bus: 0.089, // kg CO2 per mile
    train: 0.045, // kg CO2 per mile
    plane_domestic: 0.255, // kg CO2 per mile
    plane_international: 0.298, // kg CO2 per mile
    motorcycle: 0.212, // kg CO2 per mile
    bicycle: 0, // kg CO2 per mile
    walking: 0, // kg CO2 per mile
  },
  energy: {
    electricity: 0.92, // kg CO2 per kWh (US average)
    natural_gas: 5.3, // kg CO2 per therm
    heating_oil: 10.15, // kg CO2 per gallon
    propane: 5.75, // kg CO2 per gallon
    coal: 2.86, // kg CO2 per pound
  },
  food: {
    beef: 27.0, // kg CO2 per kg
    lamb: 24.5, // kg CO2 per kg
    pork: 7.6, // kg CO2 per kg
    chicken: 5.7, // kg CO2 per kg
    fish: 5.1, // kg CO2 per kg
    dairy: 3.2, // kg CO2 per kg
    eggs: 4.2, // kg CO2 per kg
    vegetables: 0.4, // kg CO2 per kg
    fruits: 0.7, // kg CO2 per kg
    grains: 1.1, // kg CO2 per kg
    legumes: 0.8, // kg CO2 per kg
  },
  waste: {
    general_waste: 0.57, // kg CO2 per kg
    recycling: -0.3, // kg CO2 per kg (negative = carbon saved)
    composting: -0.1, // kg CO2 per kg (negative = carbon saved)
    electronic_waste: 1.2, // kg CO2 per kg
  },
  other: {
    clothing_new: 8.5, // kg CO2 per item
    clothing_secondhand: 0.5, // kg CO2 per item
    streaming_video: 0.0036, // kg CO2 per hour
    online_shopping: 0.5, // kg CO2 per package
  },
}

export interface CarbonActivity {
  activity_type: keyof typeof EMISSION_FACTORS
  category: string
  amount: number
  unit: string
  date: string
  notes?: string
}

export function calculateCarbonFootprint(activity: CarbonActivity): number {
  const factors = EMISSION_FACTORS[activity.activity_type]
  const factor = factors[activity.category as keyof typeof factors]

  if (factor === undefined) {
    throw new Error(`Unknown category: ${activity.category} for activity type: ${activity.activity_type}`)
  }

  return activity.amount * factor
}

export function getActivityCategories(activityType: keyof typeof EMISSION_FACTORS) {
  return Object.keys(EMISSION_FACTORS[activityType])
}

export function getUnitForCategory(activityType: keyof typeof EMISSION_FACTORS, category: string): string {
  const unitMap = {
    transport: {
      car_gasoline: "miles",
      car_diesel: "miles",
      car_electric: "miles",
      bus: "miles",
      train: "miles",
      plane_domestic: "miles",
      plane_international: "miles",
      motorcycle: "miles",
      bicycle: "miles",
      walking: "miles",
    },
    energy: {
      electricity: "kWh",
      natural_gas: "therms",
      heating_oil: "gallons",
      propane: "gallons",
      coal: "pounds",
    },
    food: {
      beef: "kg",
      lamb: "kg",
      pork: "kg",
      chicken: "kg",
      fish: "kg",
      dairy: "kg",
      eggs: "kg",
      vegetables: "kg",
      fruits: "kg",
      grains: "kg",
      legumes: "kg",
    },
    waste: {
      general_waste: "kg",
      recycling: "kg",
      composting: "kg",
      electronic_waste: "kg",
    },
    other: {
      clothing_new: "items",
      clothing_secondhand: "items",
      streaming_video: "hours",
      online_shopping: "packages",
    },
  }

  return unitMap[activityType]?.[category as keyof (typeof unitMap)[typeof activityType]] || "units"
}

export function getCategoryDisplayName(category: string): string {
  const displayNames: Record<string, string> = {
    // Transport
    car_gasoline: "Car (Gasoline)",
    car_diesel: "Car (Diesel)",
    car_electric: "Car (Electric)",
    bus: "Bus",
    train: "Train",
    plane_domestic: "Plane (Domestic)",
    plane_international: "Plane (International)",
    motorcycle: "Motorcycle",
    bicycle: "Bicycle",
    walking: "Walking",

    // Energy
    electricity: "Electricity",
    natural_gas: "Natural Gas",
    heating_oil: "Heating Oil",
    propane: "Propane",
    coal: "Coal",

    // Food
    beef: "Beef",
    lamb: "Lamb",
    pork: "Pork",
    chicken: "Chicken",
    fish: "Fish",
    dairy: "Dairy Products",
    eggs: "Eggs",
    vegetables: "Vegetables",
    fruits: "Fruits",
    grains: "Grains",
    legumes: "Legumes",

    // Waste
    general_waste: "General Waste",
    recycling: "Recycling",
    composting: "Composting",
    electronic_waste: "Electronic Waste",

    // Other
    clothing_new: "New Clothing",
    clothing_secondhand: "Secondhand Clothing",
    streaming_video: "Video Streaming",
    online_shopping: "Online Shopping",
  }

  return displayNames[category] || category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

// Factors required specifically for the IoT Data Wizard Total Carbon feature
export const IOT_EMISSION_FACTORS = {
  transport: {
    'Car': 0.21,
    'Bike': 0.10,
    'Bus': 0.05,
    'Train': 0.04,
    'Flight': 0.25,
    'Bicycle': 0,
    'Other': 0.15
  },
  energy: {
    'Electricity': 0.82,
    'LPG': 1.5,
    'Diesel': 2.68,
    'Petrol': 2.31,
    'Natural Gas': 2.03,
    'Solar': 0,
    'Wind': 0,
    'Hydropower': 0,
    'Coal': 2.5,
    'Biomass': 1.8,
    'Nuclear': 0.01
  }
}

export function calculateIoTCarbon(module: string, type: string, value: number): number {
  if (!value || isNaN(value)) return 0;
  
  if (module === 'transport') {
    // Determine base type: 'Car (Petrol)' -> 'Car'
    let baseType = type || 'Other';
    if (baseType.includes('Car')) baseType = 'Car';
    if (baseType.includes('Bike')) baseType = 'Bike';
    if (baseType.includes('Bus')) baseType = 'Bus';
    if (baseType.includes('Train')) baseType = 'Train';
    if (baseType.includes('Flight')) baseType = 'Flight';
    if (baseType.includes('Bicycle')) baseType = 'Bicycle';
    
    const factor = IOT_EMISSION_FACTORS.transport[baseType as keyof typeof IOT_EMISSION_FACTORS.transport] 
      ?? IOT_EMISSION_FACTORS.transport['Other'];
      
    return value * factor;
  } else if (module === 'energy') {
    const energyType = type || 'Electricity';
    let factor = IOT_EMISSION_FACTORS.energy[energyType as keyof typeof IOT_EMISSION_FACTORS.energy];
    
    // If factor is somehow undefined, match to zero if it's a renewable, else standard fallback
    if (factor === undefined) {
      if (['Solar', 'Wind', 'Hydropower'].includes(energyType)) factor = 0;
      else factor = 0.5; // fallback
    }
    
    return value * factor;
  }
  
  return 0; // Unknown module
}
