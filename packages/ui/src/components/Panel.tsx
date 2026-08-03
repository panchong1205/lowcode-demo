import React from 'react';

export interface PanelProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  style?: React.CSSProperties;
  actions?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className = '',
  style = {},
  actions,
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  return (
    <div
      className={`lowcode-panel ${className}`}
      style={{
        backgroundColor: '#fff',
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: collapsed ? 'none' : '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          cursor: collapsible ? 'pointer' : 'default',
          userSelect: 'none',
        }}
        onClick={() => collapsible && setCollapsed(!collapsed)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {collapsible && (
            <span style={{ fontSize: 10, transition: 'transform 0.2s', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
              ▼
            </span>
          )}
          <span style={{ fontWeight: 700, fontSize: 13, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
        </div>
        {actions && <div>{actions}</div>}
      </div>
      {!collapsed && <div style={{ padding: 16 }}>{children}</div>}
    </div>
  );
};