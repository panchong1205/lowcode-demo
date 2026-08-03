import React from 'react';
import { defaultComponentRegistry, registerBuiltinComponents } from '@lowcode/core';
import { useDrag } from '@lowcode/ui';

registerBuiltinComponents(defaultComponentRegistry);

export const ComponentPalette: React.FC = () => {
  const categories = [
    { key: 'basic', name: '基础组件' },
    { key: 'form', name: '表单组件' },
    { key: 'display', name: '展示组件' },
    { key: 'chart', name: '图表组件' },
    { key: 'layout', name: '布局组件' },
  ];

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        组件面板
      </h3>
      {categories.map((cat) => {
        const components = defaultComponentRegistry.getByCategory(cat.key);
        if (components.length === 0) return null;
        return (
          <div key={cat.key} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
              {cat.name}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {components.map((comp) => (
                <DraggableComponentItem key={comp.type} meta={comp} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DraggableComponentItem: React.FC<{ meta: ReturnType<typeof defaultComponentRegistry.get> }> = ({ meta }) => {
  if (!meta) return null;
  const { dragProps, isDragging } = useDrag<HTMLDivElement>({
    data: { type: meta.type, componentMeta: meta },
  });

  return (
    <div
      {...dragProps}
      style={{
        padding: '6px 12px',
        backgroundColor: isDragging ? '#dbeafe' : '#f0f4f8',
        border: `1px solid ${isDragging ? '#2563eb' : '#e2e8f0'}`,
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        color: '#2563eb',
        cursor: 'grab',
        userSelect: 'none',
        transition: 'all 0.15s',
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {meta.name}
    </div>
  );
};