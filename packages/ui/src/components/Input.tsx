import React from 'react';

export interface InputProps {
  value?: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'password';
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Input: React.FC<InputProps> = ({
  value = '',
  placeholder = '',
  type = 'text',
  onChange,
  label,
  error,
  disabled = false,
  className = '',
  style = {},
}) => (
  <div className={`lowcode-input-wrapper ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
    {label && (
      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>
    )}
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        width: '100%',
        height: 36,
        padding: '4px 10px',
        border: `1px solid ${error ? '#ef4444' : '#d9d9d9'}`,
        borderRadius: 6,
        fontSize: 14,
        outline: 'none',
        transition: 'border-color 0.2s',
        backgroundColor: disabled ? '#f5f5f5' : '#fff',
      }}
    />
    {error && <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>}
  </div>
);