import type { ComponentSchema, StyleProps } from '@lowcode/core';
import React from 'react';

export interface RenderContext {
  data: Record<string, unknown>;
  theme: Record<string, string>;
  variables: Record<string, unknown>;
  componentMap: Map<string, React.ComponentType<RenderComponentProps>>;
}

export interface RenderComponentProps {
  schema: ComponentSchema;
  context: RenderContext;
  children?: React.ReactNode;
}

function resolveStyle(style: StyleProps | undefined, context: RenderContext): React.CSSProperties {
  if (!style) return {};
  const resolved: React.CSSProperties = {};
  for (const [key, value] of Object.entries(style)) {
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      const expr = value.slice(2, -2).trim();
      resolved[key as keyof React.CSSProperties] = resolveExpression(expr, context) as never;
    } else {
      resolved[key as keyof React.CSSProperties] = value as never;
    }
  }
  return resolved;
}

function resolveExpression(expr: string, context: RenderContext): unknown {
  try {
    const fn = new Function('data', 'theme', 'variables', `return ${expr}`);
    return fn(context.data, context.theme, context.variables);
  } catch {
    return expr;
  }
}

function evaluateConditions(
  conditions: ComponentSchema['conditions'],
  context: RenderContext,
): boolean {
  if (!conditions || conditions.length === 0) return true;

  return conditions.every((condition) => {
    const value = resolveExpression(condition.field, context);
    switch (condition.operator) {
      case 'eq':
        return value === condition.value;
      case 'neq':
        return value !== condition.value;
      case 'gt':
        return (value as number) > (condition.value as number);
      case 'gte':
        return (value as number) >= (condition.value as number);
      case 'lt':
        return (value as number) < (condition.value as number);
      case 'lte':
        return (value as number) <= (condition.value as number);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'contains':
        return typeof value === 'string' && (value as string).includes(condition.value as string);
      default:
        return true;
    }
  });
}

export function renderComponent(
  schema: ComponentSchema,
  context: RenderContext,
  key?: string,
): React.ReactElement | null {
  if (schema.visible === false) return null;

  if (!evaluateConditions(schema.conditions, context)) return null;

  const Component = context.componentMap.get(schema.type);
  if (!Component) {
    console.warn(`No component registered for type: ${schema.type}`);
    return null;
  }

  const resolvedStyle = resolveStyle(schema.style, context);

  const children = schema.children
    ? schema.children.map((child, index) =>
        renderComponent(child, context, `${child.id}-${index}`),
      )
    : undefined;

  return React.createElement(
    Component,
    {
      key: key || schema.id,
      schema,
      context,
      style: resolvedStyle,
    },
    children,
  );
}

export function renderSchema(
  components: ComponentSchema[],
  context: RenderContext,
): React.ReactElement[] {
  return components
    .map((comp, index) => renderComponent(comp, context, `${comp.id}-${index}`))
    .filter((el): el is React.ReactElement => el !== null);
}