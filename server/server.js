const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { generateNetworkData } = require('./controllers/simulation');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { 
        origin: "http://localhost:5173", // Vite's default port
        methods: ["GET", "POST"] 
    }
});

// Emit simulated sensor data every 3 seconds
io.on('connection', (socket) => {
    console.log('Frontend connected to IONET Simulation:', socket.id);

    const simulationInterval = setInterval(() => {
        const data = generateNetworkData();
        socket.emit('ionet_telemetry', data);
    }, 3000);

    socket.on('disconnect', () => {
        clearInterval(simulationInterval);
        console.log('Frontend disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`ClimateSense Backend running on port ${PORT}`));