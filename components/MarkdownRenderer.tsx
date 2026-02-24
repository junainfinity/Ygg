import React from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Simple regex to split code blocks from text
  const parts = content.split(/```(\w*)\n([\s\S]*?)```/g);

  return (
    <div className="text-mac-text leading-relaxed space-y-4">
      {parts.map((part, index) => {
        if (index % 3 === 0) {
          // Regular text rendering with basic formatting
          if (!part.trim()) return null;
          return (
            <div key={index} className="whitespace-pre-wrap">
              {part.split('\n').map((line, i) => (
                <p key={i} className="min-h-[1em] mb-1">{line}</p>
              ))}
            </div>
          );
        }
        
        if (index % 3 === 1) {
          return null; // Language part
        }

        if (index % 3 === 2) {
          const language = parts[index - 1] || 'text';
          const code = part;
          const uniqueId = Math.floor(index / 3);

          return (
            <div key={index} className="rounded-md border border-mac-border bg-mac-sidebar overflow-hidden my-4 shadow-sm transition-colors duration-200">
              <div className="flex items-center justify-between px-3 py-2 bg-mac-active border-b border-mac-border">
                <span className="text-xs font-mono text-mac-muted lowercase">{language}</span>
                <button
                  onClick={() => handleCopy(code, uniqueId)}
                  className="p-1 hover:bg-mac-hover rounded transition-colors"
                  title="Copy code"
                >
                  {copiedIndex === uniqueId ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} className="text-mac-muted hover:text-mac-text" />
                  )}
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="font-mono text-sm text-mac-text">
                  <code>{code}</code>
                </pre>
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default MarkdownRenderer;