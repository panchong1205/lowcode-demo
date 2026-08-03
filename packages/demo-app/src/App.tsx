import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { ConfigPanelDemo } from '@lowcode/config-panel';
import { Dashboard } from '@lowcode/dashboard';
import { ScadaPanel } from '@lowcode/scada';
import { FlowEditor } from '@lowcode/flow-editor';
import { ReactFlowProvider } from 'reactflow';

const navItems = [
  { path: '/config-panel', label: '低代码配置', icon: '🧩' },
  { path: '/dashboard', label: '可视化大屏', icon: '📊' },
  { path: '/scada', label: '组态监控', icon: '🏭' },
  { path: '/flow-editor', label: '流程编排', icon: '🔀' },
];

const App: React.FC = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        color: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 52,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>工业低代码可视化平台</span>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 8px',
            backgroundColor: 'rgba(37,99,235,0.3)',
            borderRadius: 10,
            color: '#93c5fd',
            letterSpacing: '0.05em',
          }}>
            DEMO
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                color: isActive ? '#fff' : '#94a3b8',
                backgroundColor: isActive ? 'rgba(37,99,235,0.3)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              })}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </header>

      <main style={{ flex: 1, overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/config-panel" element={<ConfigPanelDemo />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scada" element={<ScadaPanel />} />
          <Route
            path="/flow-editor"
            element={
              <ReactFlowProvider>
                <FlowEditor />
              </ReactFlowProvider>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default App;