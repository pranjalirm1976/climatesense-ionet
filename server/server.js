const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { generateNetworkData, addZone } = require('./controllers/simulation');

const app = express();

// 1. Allow any frontend port to connect (Fixes the ghost terminal issue)
app.use(cors());
app.use(express.json()); // Allows us to read JSON POST bodies

// --- REST API ROUTES ---

// 2. Hackathon Admin Login Route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // IMPORTANT: Make sure you type these exactly when logging in!
    if (username === 'admin' && password === 'admin123') {
        res.json({ success: true, token: 'ionet-demo-token-8923' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// 3. Add New Room Route
app.post('/api/rooms', (req, res) => {
    const { roomName } = req.body;
    if (addZone(roomName)) {
        res.json({ success: true, message: `${roomName} added to IONET mesh.` });
    } else {
        res.status(400).json({ success: false, message: 'Room already exists or is invalid.' });
    }
});

// --- WEBSOCKET SETUP ---
const server = http.createServer(app);

// 4. Update Socket CORS to accept all connections
const io = new Server(server, {
    cors: { 
        origin: "*", 
        methods: ["GET", "POST"] 
    }
});

io.on('connection', (socket) => {
    console.log('Frontend connected to IONET Simulation:', socket.id);
    
    const simulationInterval = setInterval(() => {
        socket.emit('ionet_telemetry', generateNetworkData());
    }, 3000);

    socket.on('disconnect', () => {
        clearInterval(simulationInterval);
        console.log('Frontend disconnected');
    });
});

// 5. Run on the new, safe port (5001)
const PORT = 5001;
server.listen(PORT, () => console.log(`ClimateSense Backend running on port ${PORT}`));