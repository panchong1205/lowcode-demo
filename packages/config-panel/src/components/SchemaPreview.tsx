import React, { useState } from 'react';
import type { Schema } from '@lowcode/core';

interface SchemaPreviewProps {
  schema: Schema | null;
}

export const SchemaPreview: React.FC<SchemaPreviewProps> = ({ schema }) => {
  const [copied, setCopied] = useState(false);

  const json = schema ? JSON.stringify(schema, null, 2) : '';
  const lineCount = json ? json.split('\n').length : 0;

  const handleCopy = () => {
    if (json) {
      navigator.clipboard.writeText(json).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Schema 预览
        </h3>
        <button
          onClick={handleCopy}
          style={{
            padding: '4px 10px',
            backgroundColor: copied ? '#16a34a' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontSize: 11,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>
        {lineCount} 行 · {schema?.components.length || 0} 个根组件
      </div>
      <pre
        style={{
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          padding: 12,
          borderRadius: 6,
          fontSize: 11,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          overflow: 'auto',
          maxHeight: 400,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {schema ? (
          <code>{syntaxHighlight(json)}</code>
        ) : (
          <span style={{ color: '#64748b' }}>{'// 暂无 Schema，请创建或加载'}</span>
        )}
      </pre>
    </div>
  );
};

function syntaxHighlight(json: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let i = 0;
  const regex = /("(?:[^"\\]|\\.)*")\s*:|("(?:[^"\\]|\\.)*")|(\btrue\b|\bfalse\b|\bnull\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(json)) !== null) {
    if (match.index > lastIndex) {
      parts.push(json.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(
        <span key={match.index} style={{ color: '#93c5fd' }}>
          {match[1]}
        </span>,
      );
    } else if (match[2]) {
      parts.push(
        <span key={match.index} style={{ color: '#86efac' }}>
          {match[2]}
        </span>,
      );
    } else if (match[3]) {
      parts.push(
        <span key={match.index} style={{ color: '#c4b5fd' }}>
          {match[3]}
        </span>,
      );
    } else if (match[4]) {
      parts.push(
        <span key={match.index} style={{ color: '#fde68a' }}>
          {match[4]}
        </span>,
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < json.length) {
    parts.push(json.slice(lastIndex));
  }
  return parts;
}