const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { generateNetworkData, addZone, removeZone } = require('./controllers/simulation');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.json({ success: true, token: 'ionet-demo-token-8923' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/api/rooms', (req, res) => {
    const { roomName } = req.body;
    if (addZone(roomName)) {
        res.json({ success: true, message: `${roomName} added to mesh.` });
    } else {
        res.status(400).json({ success: false, message: 'Room already exists.' });
    }
});

// THE DELETE ROUTE
app.delete('/api/rooms/:identifier', (req, res) => {
    const identifier = req.params.identifier;
    if (removeZone(identifier)) {
        res.json({ success: true, message: `${identifier.toUpperCase()} permanently disconnected.` });
    } else {
        res.status(404).json({ success: false, message: `Could not find ${identifier} to delete.` });
    }
});

app.get('/api/monthly-savings', (req, res) => {
    const monthlyData = [
        { month: 'Jan', kwhSaved: 850 },
        { month: 'Feb', kwhSaved: 920 },
        { month: 'Mar', kwhSaved: 1100 },
        { month: 'Apr', kwhSaved: 1250 },
        { month: 'May', kwhSaved: 1400 },
        { month: 'Jun', kwhSaved: 1550 }
    ];
    res.json({ success: true, data: monthlyData });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

io.on('connection', (socket) => {
    const simulationInterval = setInterval(() => {
        socket.emit('ionet_telemetry', generateNetworkData());
    }, 3000);
    socket.on('disconnect', () => clearInterval(simulationInterval));
});

const PORT = 5001;
server.listen(PORT, () => console.log(`ClimateSense Backend running on port ${PORT}`));