import type { ComponentSchema } from '@lowcode/core';
import React from 'react';

export interface ComponentStrategy {
  type: string;
  render: (schema: ComponentSchema, children?: React.ReactNode) => React.ReactElement;
}

export class StrategyRenderer {
  private strategies = new Map<string, ComponentStrategy>();

  register(strategy: ComponentStrategy): void {
    this.strategies.set(strategy.type, strategy);
  }

  unregister(type: string): void {
    this.strategies.delete(type);
  }

  render(schema: ComponentSchema, children?: React.ReactNode): React.ReactElement | null {
    const strategy = this.strategies.get(schema.type);
    if (!strategy) {
      console.warn(`No strategy for component type: ${schema.type}`);
      return null;
    }
    return strategy.render(schema, children);
  }

  has(type: string): boolean {
    return this.strategies.has(type);
  }
}

export const defaultStrategyRenderer = new StrategyRenderer();

export function registerDefaultStrategies(renderer: StrategyRenderer): void {
  renderer.register({
    type: 'container',
    render: (schema, children) =>
      React.createElement('div', {
        key: schema.id,
        className: 'lowcode-container',
        'data-component-id': schema.id,
        style: { display: 'flex', flexDirection: 'column', gap: 8, padding: 16, ...(schema.style || {}) },
      }, children),
  });

  renderer.register({
    type: 'text',
    render: (schema) =>
      React.createElement('span', {
        key: schema.id,
        className: 'lowcode-text',
        'data-component-id': schema.id,
        style: { fontSize: 14, ...(schema.style || {}) },
      }, schema.props.content as string),
  });

  renderer.register({
    type: 'input',
    render: (schema) =>
      React.createElement('input', {
        key: schema.id,
        className: 'lowcode-input',
        'data-component-id': schema.id,
        placeholder: (schema.props.placeholder as string) || '请输入',
        defaultValue: schema.props.value as string,
        style: {
          width: '100%',
          height: 32,
          padding: '4px 8px',
          border: '1px solid #d9d9d9',
          borderRadius: 4,
          fontSize: 14,
          ...(schema.style || {}),
        },
      }),
  });

  renderer.register({
    type: 'select',
    render: (schema) => {
      const options = (schema.props.options as { label: string; value: string }[]) || [];
      return React.createElement('select', {
        key: schema.id,
        className: 'lowcode-select',
        'data-component-id': schema.id,
        defaultValue: schema.props.value as string,
        style: {
          width: '100%',
          height: 32,
          padding: '4px 8px',
          border: '1px solid #d9d9d9',
          borderRadius: 4,
          fontSize: 14,
          backgroundColor: '#fff',
          ...(schema.style || {}),
        },
      }, options.map((opt) =>
        React.createElement('option', { key: opt.value, value: opt.value }, opt.label),
      ));
    },
  });

  renderer.register({
    type: 'button',
    render: (schema) => {
      const btnType = (schema.props.type as string) || 'primary';
      const colorMap: Record<string, { bg: string; text: string; border: string }> = {
        primary: { bg: '#2563eb', text: '#fff', border: '#2563eb' },
        secondary: { bg: '#f1f5f9', text: '#334155', border: '#e2e8f0' },
        danger: { bg: '#ef4444', text: '#fff', border: '#ef4444' },
      };
      const colors = colorMap[btnType] || colorMap.primary;
      return React.createElement('button', {
        key: schema.id,
        className: 'lowcode-button',
        'data-component-id': schema.id,
        style: {
          padding: '6px 16px',
          backgroundColor: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          ...(schema.style || {}),
        },
      }, schema.props.text as string);
    },
  });

  renderer.register({
    type: 'card',
    render: (schema, children) => {
      const title = schema.props.title as string;
      return React.createElement('div', {
        key: schema.id,
        className: 'lowcode-card',
        'data-component-id': schema.id,
        style: {
          backgroundColor: '#fff',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          ...(schema.style || {}),
        },
      },
        title && React.createElement('div', {
          style: {
            padding: '12px 16px',
            borderBottom: '1px solid #e2e8f0',
            fontWeight: 700,
            fontSize: 14,
            color: '#1a1d23',
          },
        }, title),
        React.createElement('div', { style: { padding: 16 } }, children),
      );
    },
  });

  renderer.register({
    type: 'grid',
    render: (schema, children) => {
      const columns = (schema.props.columns as number) || 2;
      const gap = (schema.props.gap as number) || 12;
      return React.createElement('div', {
        key: schema.id,
        className: 'lowcode-grid',
        'data-component-id': schema.id,
        style: {
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap,
          ...(schema.style || {}),
        },
      }, children);
    },
  });

  renderer.register({
    type: 'table',
    render: (schema) => {
      const columns = (schema.props.columns as { key: string; title: string }[]) || [];
      const dataSource = (schema.props.dataSource as Record<string, unknown>[]) || [];
      return React.createElement('div', {
        key: schema.id,
        className: 'lowcode-table',
        'data-component-id': schema.id,
        style: { width: '100%', overflowX: 'auto', ...(schema.style || {}) },
      },
        React.createElement('table', {
          style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
        },
          React.createElement('thead', {},
            React.createElement('tr', {},
              columns.map((col) =>
                React.createElement('th', {
                  key: col.key,
                  style: {
                    padding: '8px 12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #e2e8f0',
                    fontWeight: 600,
                    color: '#64748b',
                    fontSize: 12,
                    textTransform: 'uppercase',
                  },
                }, col.title),
              ),
            ),
          ),
          React.createElement('tbody', {},
            dataSource.map((row, rowIdx) =>
              React.createElement('tr', {
                key: rowIdx,
                style: { borderBottom: '1px solid #e2e8f0' },
              },
                columns.map((col) =>
                  React.createElement('td', {
                    key: col.key,
                    style: { padding: '8px 12px', color: '#334155' },
                  }, String(row[col.key] ?? '')),
                ),
              ),
            ),
          ),
        ),
      );
    },
  });

  renderer.register({
    type: 'image',
    render: (schema) =>
      React.createElement('img', {
        key: schema.id,
        className: 'lowcode-image',
        'data-component-id': schema.id,
        src: schema.props.src as string,
        alt: (schema.props.alt as string) || '',
        style: { maxWidth: '100%', ...(schema.style || {}) },
      }),
  });

  renderer.register({
    type: 'tabs',
    render: (schema, children) => {
      const tabs = (schema.props.tabs as { key: string; label: string }[]) || [];
      const activeKey = (schema.props.activeKey as string) || tabs[0]?.key;
      const [state, setState] = React.useState(activeKey);
      return React.createElement('div', {
        key: schema.id,
        className: 'lowcode-tabs',
        'data-component-id': schema.id,
      },
        React.createElement('div', {
          style: { display: 'flex', gap: 0, borderBottom: '2px solid #e2e8f0', marginBottom: 16 },
        },
          tabs.map((tab) =>
            React.createElement('button', {
              key: tab.key,
              onClick: () => setState(tab.key),
              style: {
                padding: '8px 16px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: state === tab.key ? 700 : 400,
                color: state === tab.key ? '#2563eb' : '#64748b',
                borderBottom: state === tab.key ? '2px solid #2563eb' : '2px solid transparent',
                marginBottom: -2,
              },
            }, tab.label),
          ),
        ),
        React.createElement('div', { style: { display: state === activeKey ? 'block' : 'none' } }, children),
      );
    },
  });
}