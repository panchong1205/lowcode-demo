import React from 'react';
import type { ComponentSchema } from '@lowcode/core';
import { useDrop } from '@lowcode/ui';

interface DragLayoutProps {
  components: ComponentSchema[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDrop: (parentId: string | null, component: ComponentSchema) => void;
  onDelete: (id: string) => void;
}

export const DragLayout: React.FC<DragLayoutProps> = ({
  components,
  selectedId,
  onSelect,
  onDrop,
  onDelete,
}) => {
  const { isOver, dropProps } = useDrop<HTMLDivElement>({
    onDrop: (data) => {
      const { type } = data as { type: string };
      const newComponent: ComponentSchema = {
        id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        label: type,
        props: {},
        style: {},
      };
      onDrop(null, newComponent);
    },
  });

  return (
    <div
      {...dropProps}
      style={{
        minHeight: 200,
        padding: 16,
        backgroundColor: isOver ? '#f0f9ff' : '#f8fafc',
        border: `2px dashed ${isOver ? '#2563eb' : '#e2e8f0'}`,
        borderRadius: 8,
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {components.length === 0 && (
        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: 40 }}>
          拖拽组件到此处开始搭建页面
        </div>
      )}
      {components.map((comp) => (
        <RenderTreeNode
          key={comp.id}
          component={comp}
          selectedId={selectedId}
          onSelect={onSelect}
          onDrop={onDrop}
          onDelete={onDelete}
          depth={0}
        />
      ))}
    </div>
  );
};

interface RenderTreeNodeProps {
  component: ComponentSchema;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDrop: (parentId: string | null, component: ComponentSchema) => void;
  onDelete: (id: string) => void;
  depth: number;
}

const typeLabels: Record<string, string> = {
  container: '容器',
  text: '文本',
  input: '输入框',
  select: '下拉框',
  button: '按钮',
  table: '表格',
  chart: '图表',
  card: '卡片',
  grid: '网格',
  tabs: '标签页',
  image: '图片',
};

const RenderTreeNode: React.FC<RenderTreeNodeProps> = ({
  component,
  selectedId,
  onSelect,
  onDrop,
  onDelete,
  depth,
}) => {
  const isSelected = selectedId === component.id;
  const { isOver, dropProps } = useDrop<HTMLDivElement>({
    onDrop: (data) => {
      const { type } = data as { type: string };
      const newComponent: ComponentSchema = {
        id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        label: type,
        props: {},
        style: {},
      };
      onDrop(component.id, newComponent);
    },
  });

  const canHaveChildren = ['container', 'card', 'grid', 'tabs'].includes(component.type);

  return (
    <div
      {...(canHaveChildren ? dropProps : {})}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(component.id);
      }}
      style={{
        position: 'relative',
        marginLeft: depth * 16,
        padding: '8px 12px',
        backgroundColor: isSelected ? '#dbeafe' : isOver ? '#f0f9ff' : '#ffffff',
        border: `1px solid ${isSelected ? '#2563eb' : isOver ? '#0891b2' : '#e2e8f0'}`,
        borderLeft: `3px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontSize: 13,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
            {component.id.slice(-8)}
          </span>
          <span style={{ fontWeight: 600, color: '#374151' }}>
            {typeLabels[component.type] || component.type}
          </span>
          {component.label && component.label !== component.type && (
            <span style={{ fontSize: 11, color: '#64748b' }}>"{component.label}"</span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(component.id);
          }}
          style={{
            padding: '2px 6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: 11,
            borderRadius: 4,
          }}
          title="删除"
        >
          ✕
        </button>
      </div>
      {component.children && component.children.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {component.children.map((child) => (
            <RenderTreeNode
              key={child.id}
              component={child}
              selectedId={selectedId}
              onSelect={onSelect}
              onDrop={onDrop}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
      {canHaveChildren && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
          拖拽组件到此处添加子组件
        </div>
      )}
    </div>
  );
};