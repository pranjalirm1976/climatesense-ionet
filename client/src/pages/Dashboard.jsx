import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import '../index.css';

// Connect to backend
const socket = io('http://localhost:5000');

export default function Dashboard() {
  const [networkData, setNetworkData] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    socket.on('ionet_telemetry', (data) => {
      setNetworkData(data);
      
      // Keep only the last 10 data points for the live chart
      setChartData(prev => {
        const newData = [...prev, { time: new Date().toLocaleTimeString(), savings: data.globalMetrics.avgEnergySaved }];
        return newData.slice(-10);
      });
    });

    return () => socket.off('ionet_telemetry');
  }, []);

  if (!networkData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ padding: '2rem' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>ClimateSense <span style={{ color: 'var(--accent-green)' }}>IONET</span></h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Live Mesh Network Overview</p>
        </div>
        <div className="glass-panel badge-green" style={{ padding: '0.5rem 1rem', borderRadius: '50px', display: 'flex', alignItems: 'center' }}>
          System Health: Optimal (AI Active)
        </div>
      </header>

      {/* Top Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <motion.div className="glass-panel" style={{ padding: '1.5rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ color: 'var(--text-muted)', marginTop: 0 }}>Global Energy Saved</h3>
          <h2 style={{ fontSize: '3rem', margin: '0.5rem 0', color: 'var(--accent-green)' }}>
            {networkData.globalMetrics.avgEnergySaved}%
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Compared to standard 24/7 operation</p>
        </motion.div>

        <motion.div className="glass-panel" style={{ padding: '1.5rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 style={{ color: 'var(--text-muted)', marginTop: 0 }}>CO2 Reduced Today</h3>
          <h2 style={{ fontSize: '3rem', margin: '0.5rem 0' }}>{networkData.globalMetrics.co2ReducedKg} <span style={{fontSize: '1.5rem'}}>kg</span></h2>
        </motion.div>

        <motion.div className="glass-panel" style={{ padding: '1.5rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 style={{ color: 'var(--text-muted)', marginTop: 0 }}>AI Optimization Score</h3>
          <h2 style={{ fontSize: '3rem', margin: '0.5rem 0' }}>{networkData.globalMetrics.optimizationScore}/100</h2>
        </motion.div>

      </div>

      {/* Bottom Layout: Zones & Graph */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Node Status Table/Cards */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Live Sensor Nodes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {networkData.nodes.map((node) => (
              <motion.div key={node.id} layout style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `4px solid ${node.occupancy === 0 ? '#4b5563' : 'var(--accent-green)'}` }}>
                <div>
                  <strong>{node.zone}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Occupancy: {node.occupancy} | Temp: {node.temperature}°C</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold' }}>Fan Speed: {node.fanSpeed}/5</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-green)' }}>{node.status}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Live Analytics Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Savings Trend (Live)</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#333' }} />
                <Line type="monotone" dataKey="savings" stroke="var(--accent-green)" strokeWidth={3} dot={false} animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}