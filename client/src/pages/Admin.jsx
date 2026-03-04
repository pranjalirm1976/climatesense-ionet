import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';

const socket = io('http://localhost:5000');

export default function Admin() {
  const [networkData, setNetworkData] = useState(null);

  useEffect(() => {
    socket.on('ionet_telemetry', (data) => setNetworkData(data));
    return () => socket.off('ionet_telemetry');
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2>System Architecture Overview</h2>
        <p style={{ color: 'var(--text-muted)' }}>Monitor node connectivity and hardware health.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ marginTop: 0 }}>Gateway Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 10px var(--accent-green)' }}></div>
            <span>Primary Gateway Online</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ping: 24ms</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Active Node Topology</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {networkData ? networkData.nodes.map((node, index) => (
              <motion.div key={node.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>{node.id.toUpperCase()}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)' }}>ONLINE</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location: {node.zone}</div>
              </motion.div>
            )) : <p>Loading network topology...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}