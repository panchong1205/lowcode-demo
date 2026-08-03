import React from 'react';
import type { ComponentSchema } from '@lowcode/core';
import { Input } from '@lowcode/ui';

interface PropertyEditorProps {
  component: ComponentSchema | null;
  onChange: (id: string, updater: (comp: ComponentSchema) => ComponentSchema) => void;
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({ component, onChange }) => {
  if (!component) {
    return (
      <div style={{ padding: 16, color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
        请选择组件以编辑属性
      </div>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        属性编辑
      </h3>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
          类型: {component.type}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>
          ID: {component.id}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Input
          label="标签"
          value={component.label || ''}
          onChange={(val) =>
            onChange(component.id, (comp) => ({ ...comp, label: val }))
          }
        />

        {renderCommonProps(component, onChange)}

        {renderStyleProps(component, onChange)}
      </div>
    </div>
  );
};

function renderCommonProps(
  component: ComponentSchema,
  onChange: (id: string, updater: (comp: ComponentSchema) => ComponentSchema) => void,
): React.ReactNode {
  const props = component.props;

  return Object.entries(props).map(([key, value]) => {
    if (key === 'options' || key === 'columns' || key === 'dataSource' || key === 'tabs') {
      return (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{key}</label>
          <textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(component.id, (comp) => ({
                  ...comp,
                  props: { ...comp.props, [key]: parsed },
                }));
              } catch {
                onChange(component.id, (comp) => ({
                  ...comp,
                  props: { ...comp.props, [key]: e.target.value },
                }));
              }
            }}
            rows={4}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              resize: 'vertical',
            }}
          />
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) =>
              onChange(component.id, (comp) => ({
                ...comp,
                props: { ...comp.props, [key]: e.target.checked },
              }))
            }
          />
          <label style={{ fontSize: 13, color: '#374151' }}>{key}</label>
        </div>
      );
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return (
        <Input
          key={key}
          label={key}
          value={String(value)}
          type={typeof value === 'number' ? 'number' : 'text'}
          onChange={(val) =>
            onChange(component.id, (comp) => ({
              ...comp,
              props: { ...comp.props, [key]: typeof value === 'number' ? Number(val) : val },
            }))
          }
        />
      );
    }

    return null;
  });
}

function renderStyleProps(
  component: ComponentSchema,
  onChange: (id: string, updater: (comp: ComponentSchema) => ComponentSchema) => void,
): React.ReactNode {
  const style = component.style || {};
  const styleKeys: { key: string; label: string; type: string }[] = [
    { key: 'width', label: '宽度', type: 'text' },
    { key: 'height', label: '高度', type: 'text' },
    { key: 'padding', label: '内边距', type: 'text' },
    { key: 'backgroundColor', label: '背景色', type: 'color' },
    { key: 'fontSize', label: '字号', type: 'number' },
    { key: 'color', label: '文字颜色', type: 'color' },
    { key: 'borderRadius', label: '圆角', type: 'number' },
  ];

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, marginTop: 8, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
        样式属性
      </div>
      {styleKeys.map(({ key, label, type }) => {
        const value = style[key];
        if (type === 'color') {
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <label style={{ fontSize: 12, color: '#64748b', minWidth: 60 }}>{label}</label>
              <input
                type="color"
                value={String(value || '#ffffff')}
                onChange={(e) =>
                  onChange(component.id, (comp) => ({
                    ...comp,
                    style: { ...comp.style, [key]: e.target.value },
                  }))
                }
                style={{ width: 32, height: 24, border: 'none', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{String(value || '')}</span>
            </div>
          );
        }
        return (
          <div key={key} style={{ marginBottom: 6 }}>
            <Input
              label={label}
              value={value !== undefined ? String(value) : ''}
              placeholder="未设置"
              onChange={(val) =>
                onChange(component.id, (comp) => ({
                  ...comp,
                  style: { ...comp.style, [key]: type === 'number' ? Number(val) || undefined : val || undefined },
                }))
              }
            />
          </div>
        );
      })}
    </div>
  );
}