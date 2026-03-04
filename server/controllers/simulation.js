// Global state for the hackathon demo
let zones = ['Engineering', 'Marketing', 'Sales', 'Conference A'];
let totalHistoricalKwhSaved = 1245.5; // Starting fake historical data

function addZone(zoneName) {
    if (!zones.includes(zoneName) && zoneName.trim() !== "") {
        zones.push(zoneName);
        return true;
    }
    return false;
}

function optimizeFan(temp, occupancy) {
    if (occupancy === 0) return { speed: 0, status: 'Standby', energySaved: 100 };
    let speedCalc = ((temp - 20) * 0.4) + (occupancy * 0.15);
    let speed = Math.max(1, Math.min(5, Math.ceil(speedCalc)));
    return { speed, status: 'Optimizing', energySaved: 100 - (speed * 20) };
}

function generateNetworkData() {
    let currentTotalSavings = 0;
    let currentTotalCo2 = 0;

    const nodes = zones.map((zone, index) => {
        const temp = (Math.random() * (28 - 22) + 22).toFixed(1);
        const occupancy = Math.floor(Math.random() * 20);
        const aiDecision = optimizeFan(temp, occupancy);
        
        currentTotalSavings += aiDecision.energySaved;
        currentTotalCo2 += (aiDecision.energySaved * 0.05);

        return {
            id: `room-${index + 1}`, // Updated to Room IDs
            zone,
            temperature: parseFloat(temp),
            occupancy,
            fanSpeed: aiDecision.speed,
            status: aiDecision.status,
            energySavedPercent: aiDecision.energySaved
        };
    });

    // Accumulate historical savings for the report
    totalHistoricalKwhSaved += (currentTotalSavings / zones.length) * 0.001; 

    return {
        timestamp: new Date().toISOString(),
        globalMetrics: {
            avgEnergySaved: Math.floor(currentTotalSavings / zones.length) || 0,
            co2ReducedKg: currentTotalCo2.toFixed(2),
            optimizationScore: Math.floor(Math.random() * (98 - 92) + 92),
            lifetimeKwhSaved: totalHistoricalKwhSaved.toFixed(2)
        },
        nodes
    };
}

module.exports = { generateNetworkData, addZone };