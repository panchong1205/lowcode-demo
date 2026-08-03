import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  type?: 'primary' | 'secondary' | 'danger' | 'default';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const typeStyles: Record<string, React.CSSProperties> = {
  primary: { backgroundColor: '#2563eb', color: '#fff', border: '1px solid #2563eb' },
  secondary: { backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' },
  danger: { backgroundColor: '#ef4444', color: '#fff', border: '1px solid #ef4444' },
  default: { backgroundColor: '#fff', color: '#334155', border: '1px solid #d9d9d9' },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  small: { padding: '4px 8px', fontSize: 12, height: 28 },
  medium: { padding: '6px 16px', fontSize: 14, height: 36 },
  large: { padding: '8px 24px', fontSize: 16, height: 44 },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  type = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  className = '',
  style = {},
}) => (
  <button
    className={`lowcode-btn ${className}`}
    disabled={disabled}
    onClick={onClick}
    style={{
      borderRadius: 6,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontWeight: 600,
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      ...typeStyles[type],
      ...sizeStyles[size],
      ...style,
    }}
  >
    {children}
  </button>
);