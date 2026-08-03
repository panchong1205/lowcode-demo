import React from 'react';
import { ConfigPanel } from './components/ConfigPanel';

export const ConfigPanelDemo: React.FC = () => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '12px 20px',
        background: 'linear-gradient(135deg, #2563eb, #0891b2)',
        color: '#fff',
      }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>低代码配置面板</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.8 }}>
          JSON Schema 驱动的拖拽配置系统 · 支持组件拖拽、属性编辑、Schema 实时预览
        </p>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ConfigPanel />
      </div>
    </div>
  );
};