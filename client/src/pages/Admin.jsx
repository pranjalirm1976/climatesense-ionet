import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:5001');

export default function Admin() {
  const [networkData, setNetworkData] = useState(null);
  const [newRoom, setNewRoom] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    socket.on('ionet_telemetry', (data) => setNetworkData(data));
    return () => socket.off('ionet_telemetry');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/rooms', { roomName: newRoom });
      setMessage({ type: 'success', text: res.data.message });
      setNewRoom('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response.data.message });
    }
    setTimeout(() => setMessage(''), 3000);
  };

  if (!networkData) return <div style={{textAlign: 'center', marginTop: '20vh'}}>Authenticating & Connecting...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{margin: 0}}>Admin Control Center</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Manage mesh topology and view compliance reports.</p>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
          Logout Securely
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Add New Room</h3>
          <form onSubmit={handleAddRoom} style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" placeholder="e.g. IT Department" value={newRoom} onChange={(e) => setNewRoom(e.target.value)} required
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', color: 'white' }}
            />
            <button type="submit" style={{ background: 'var(--accent-green)', color: 'black', padding: '0 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Deploy</button>
          </form>
          {message && <p style={{ color: message.type === 'success' ? 'var(--accent-green)' : '#ef4444', fontSize: '0.9rem', marginTop: '1rem' }}>{message.text}</p>}
        </div>

        <div className="glass-panel badge-green" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, color: 'var(--accent-green)' }}>Sustainability Report</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Lifetime Energy Saved</p>
              <h1 style={{ margin: '0.5rem 0 0 0', fontSize: '2.5rem', color: 'white' }}>{networkData.globalMetrics.lifetimeKwhSaved} <span style={{fontSize: '1rem', color: 'var(--text-muted)'}}>kWh</span></h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>CO2 Prevented</p>
              <h2 style={{ margin: '0.5rem 0 0 0', color: 'white' }}>{networkData.globalMetrics.co2ReducedKg} kg</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Active Room Topology</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {networkData.nodes.map((node) => (
            <motion.div key={node.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>{node.id.toUpperCase()}</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)' }}>ONLINE</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location: {node.zone}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}