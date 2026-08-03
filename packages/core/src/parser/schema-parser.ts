import type { ComponentSchema, PageSchema, Schema } from '../types/schema';

export interface ParseResult {
  success: boolean;
  schema?: Schema;
  errors: ParseError[];
}

export interface ParseError {
  path: string;
  message: string;
}

export function parseSchema(json: string): ParseResult {
  const errors: ParseError[] = [];

  try {
    const parsed = JSON.parse(json) as PageSchema;
    const validationErrors = validatePageSchema(parsed);
    errors.push(...validationErrors);
    return {
      success: errors.length === 0,
      schema: parsed,
      errors,
    };
  } catch {
    errors.push({ path: 'root', message: 'Invalid JSON format' });
    return { success: false, errors };
  }
}

function validatePageSchema(schema: PageSchema): ParseError[] {
  const errors: ParseError[] = [];

  if (!schema.id) {
    errors.push({ path: 'id', message: 'Page id is required' });
  }

  if (!schema.name) {
    errors.push({ path: 'name', message: 'Page name is required' });
  }

  if (!schema.version) {
    errors.push({ path: 'version', message: 'Version is required' });
  }

  if (!schema.components || !Array.isArray(schema.components)) {
    errors.push({ path: 'components', message: 'Components array is required' });
  } else {
    schema.components.forEach((comp, index) => {
      errors.push(...validateComponent(comp, `components[${index}]`));
    });
  }

  return errors;
}

function validateComponent(comp: ComponentSchema, path: string): ParseError[] {
  const errors: ParseError[] = [];

  if (!comp.id) {
    errors.push({ path: `${path}.id`, message: 'Component id is required' });
  }

  if (!comp.type) {
    errors.push({ path: `${path}.type`, message: 'Component type is required' });
  }

  if (comp.children) {
    comp.children.forEach((child, index) => {
      errors.push(...validateComponent(child, `${path}.children[${index}]`));
    });
  }

  return errors;
}

export function serializeSchema(schema: Schema): string {
  return JSON.stringify(schema, null, 2);
}

export function findComponentById(
  schema: Schema,
  id: string,
): ComponentSchema | undefined {
  function search(components: ComponentSchema[]): ComponentSchema | undefined {
    for (const comp of components) {
      if (comp.id === id) return comp;
      if (comp.children) {
        const found = search(comp.children);
        if (found) return found;
      }
    }
    return undefined;
  }
  return search(schema.components);
}

export function updateComponentById(
  schema: Schema,
  id: string,
  updater: (comp: ComponentSchema) => ComponentSchema,
): Schema {
  function update(components: ComponentSchema[]): ComponentSchema[] {
    return components.map((comp) => {
      if (comp.id === id) {
        return updater(comp);
      }
      if (comp.children) {
        return { ...comp, children: update(comp.children) };
      }
      return comp;
    });
  }
  return { ...schema, components: update(schema.components) };
}

export function deleteComponentById(schema: Schema, id: string): Schema {
  function remove(components: ComponentSchema[]): ComponentSchema[] {
    return components
      .filter((comp) => comp.id !== id)
      .map((comp) => {
        if (comp.children) {
          return { ...comp, children: remove(comp.children) };
        }
        return comp;
      });
  }
  return { ...schema, components: remove(schema.components) };
}