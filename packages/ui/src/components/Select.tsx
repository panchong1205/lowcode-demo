import React from 'react';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps {
  value?: string | number;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string | number) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Select: React.FC<SelectProps> = ({
  value,
  options,
  placeholder = '请选择',
  onChange,
  label,
  disabled = false,
  className = '',
  style = {},
}) => (
  <div className={`lowcode-select-wrapper ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
    {label && (
      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>
    )}
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        width: '100%',
        height: 36,
        padding: '4px 10px',
        border: '1px solid #d9d9d9',
        borderRadius: 6,
        fontSize: 14,
        backgroundColor: disabled ? '#f5f5f5' : '#fff',
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);