import React from 'react';

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  style = {},
  hoverable = false,
}) => (
  <div
    className={`lowcode-card ${className}`}
    style={{
      backgroundColor: '#fff',
      borderRadius: 8,
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s, transform 0.2s',
      ...(hoverable && {
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }),
      ...style,
    }}
    onMouseEnter={(e) => {
      if (hoverable) {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }
    }}
    onMouseLeave={(e) => {
      if (hoverable) {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
        (e.currentTarget as HTMLElement).style.transform = '';
      }
    }}
  >
    {title && (
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e2e8f0',
          fontWeight: 700,
          fontSize: 14,
          color: '#1a1d23',
        }}
      >
        {title}
      </div>
    )}
    <div style={{ padding: 16 }}>{children}</div>
  </div>
);