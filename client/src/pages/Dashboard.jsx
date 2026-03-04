import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const socket = io('http://localhost:5001');

export default function Dashboard() {
  const [networkData, setNetworkData] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    socket.on('ionet_telemetry', (data) => {
      setNetworkData(data);
      setChartData(prev => [...prev, { time: new Date().toLocaleTimeString(), savings: data.globalMetrics.avgEnergySaved }].slice(-10));
    });
    return () => socket.off('ionet_telemetry');
  }, []);

  if (!networkData) return <div style={{textAlign: 'center', marginTop: '20vh'}}>Connecting to Sensor Mesh...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2>Live Factory Telemetry</h2>
        <div className="glass-panel badge-green" style={{ padding: '0.5rem 1rem', borderRadius: '50px' }}>AI Optimization Active</div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginTop: 0 }}>Global Energy Saved</h3>
          <h2 style={{ fontSize: '3rem', margin: '0.5rem 0', color: 'var(--accent-green)' }}>{networkData.globalMetrics.avgEnergySaved}%</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-muted)', marginTop: 0 }}>CO2 Reduced</h3>
          <h2 style={{ fontSize: '3rem', margin: '0.5rem 0' }}>{networkData.globalMetrics.co2ReducedKg} kg</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Live Room Sensors</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {networkData.nodes.map((node) => (
              <motion.div key={node.id} layout style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `4px solid ${node.occupancy === 0 ? '#4b5563' : 'var(--accent-green)'}` }}>
                <div><strong>{node.zone}</strong><br/><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Occupancy: {node.occupancy} | Temp: {node.temperature}°C</span></div>
                <div style={{ textAlign: 'right' }}><strong>Fan Speed: {node.fanSpeed}/5</strong><br/><span style={{ fontSize: '0.85rem', color: 'var(--accent-green)' }}>{node.status}</span></div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Savings Trend</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}