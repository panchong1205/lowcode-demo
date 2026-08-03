import React, { useEffect } from 'react';
import { useConfigStore } from '../store/configStore';
import { ComponentPalette } from './ComponentPalette';
import { DragLayout } from './DragLayout';
import { PropertyEditor } from './PropertyEditor';
import { SchemaPreview } from './SchemaPreview';
import { Button } from '@lowcode/ui';

export const ConfigPanel: React.FC = () => {
  const {
    schema,
    selectedComponentId,
    isDirty,
    createEmptySchema,
    selectComponent,
    updateComponent,
    deleteComponent,
    addComponent,
    undo,
    redo,
    canUndo,
    canRedo,
    getSelectedComponent,
    exportSchema,
    loadSchema,
  } = useConfigStore();

  useEffect(() => {
    if (!schema) {
      createEmptySchema();
    }
  }, [schema, createEmptySchema]);

  const selectedComponent = getSelectedComponent();

  const handleExport = () => {
    const json = exportSchema();
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${schema?.name || 'schema'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          loadSchema(reader.result as string);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0, backgroundColor: '#f0f4f8' }}>
      <div style={{ width: 220, borderRight: '1px solid #e2e8f0', backgroundColor: '#fff', overflowY: 'auto' }}>
        <ComponentPalette />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1d23' }}>
              {schema?.name || '未命名页面'}
            </span>
            {isDirty && (
              <span style={{ fontSize: 11, color: '#f59e0b' }}>● 未保存</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Button size="small" type="default" onClick={handleImport}>导入</Button>
            <Button size="small" type="default" onClick={handleExport}>导出</Button>
            <Button size="small" type="default" onClick={undo} disabled={!canUndo()}>撤销</Button>
            <Button size="small" type="default" onClick={redo} disabled={!canRedo()}>重做</Button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <DragLayout
            components={schema?.components || []}
            selectedId={selectedComponentId}
            onSelect={selectComponent}
            onDrop={addComponent}
            onDelete={deleteComponent}
          />
        </div>

        <div style={{ height: 250, borderTop: '1px solid #e2e8f0', overflowY: 'auto', backgroundColor: '#fff' }}>
          <SchemaPreview schema={schema} />
        </div>
      </div>

      <div style={{ width: 280, borderLeft: '1px solid #e2e8f0', backgroundColor: '#fff', overflowY: 'auto' }}>
        <PropertyEditor
          component={selectedComponent}
          onChange={updateComponent}
        />
      </div>
    </div>
  );
};