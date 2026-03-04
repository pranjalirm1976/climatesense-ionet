// Simulates the AI Fan Optimization Logic
function optimizeFan(temp, occupancy) {
    if (occupancy === 0) {
        return { speed: 0, status: 'Standby', energySaved: 100 }; // 100% savings when off
    }
    
    // Simple mock AI logic: higher temp + more people = higher fan speed (1-5)
    let speedCalc = ((temp - 20) * 0.4) + (occupancy * 0.15);
    let speed = Math.max(1, Math.min(5, Math.ceil(speedCalc)));
    
    // Calculate simulated savings compared to a fan running at max (speed 5) 24/7
    let energySaved = 100 - (speed * 20); 
    
    return { speed, status: 'Optimizing', energySaved };
}

function generateNetworkData() {
    const zones = ['Engineering', 'Marketing', 'Sales', 'Conference A', 'Cafeteria'];
    
    let totalSavings = 0;
    let totalCo2 = 0;

    const nodes = zones.map((zone, index) => {
        // Randomize base stats for the demo
        const temp = (Math.random() * (28 - 22) + 22).toFixed(1); // 22°C to 28°C
        const occupancy = Math.floor(Math.random() * 20); // 0 to 19 people
        
        const aiDecision = optimizeFan(temp, occupancy);
        
        totalSavings += aiDecision.energySaved;
        totalCo2 += (aiDecision.energySaved * 0.05); // Mock CO2 conversion

        return {
            id: `node-${index + 1}`,
            zone,
            temperature: parseFloat(temp),
            occupancy,
            fanSpeed: aiDecision.speed,
            status: aiDecision.status,
            energySavedPercent: aiDecision.energySaved
        };
    });

    return {
        timestamp: new Date().toISOString(),
        globalMetrics: {
            avgEnergySaved: Math.floor(totalSavings / zones.length),
            co2ReducedKg: totalCo2.toFixed(2),
            optimizationScore: Math.floor(Math.random() * (98 - 92) + 92) // Keep it high for the demo!
        },
        nodes
    };
}

module.exports = { generateNetworkData };