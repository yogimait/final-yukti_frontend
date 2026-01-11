import { useRef, useCallback, memo, useEffect } from 'react';
import Editor, { type OnMount, type BeforeMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { cn } from '@/lib/utils';

type SupportedLanguage = 'javascript' | 'python' | 'cpp' | 'java' | 'typescript' | 'go' | 'rust';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: SupportedLanguage;
    disabled?: boolean;
    className?: string;
}

// Monaco language mappings
const LANGUAGE_MAP: Record<SupportedLanguage, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    python: 'python',
    cpp: 'cpp',
    java: 'java',
    go: 'go',
    rust: 'rust',
};

// Default code templates per language
const DEFAULT_CODE: Record<SupportedLanguage, string> = {
    javascript: `// Write your solution here

function solution(input) {
    // Your code here
    
}`,
    typescript: `// Write your solution here

function solution(input: any): any {
    // Your code here
    
}`,
    python: `# Write your solution here

def solution(input):
    # Your code here
    pass
`,
    cpp: `// Write your solution here
#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Your code here
    
    return 0;
}`,
    java: `// Write your solution here
import java.util.*;

public class Solution {
    public static void main(String[] args) {
        // Your code here
        
    }
}`,
    go: `// Write your solution here
package main

import "fmt"

func main() {
    // Your code here
    fmt.Println("Hello")
}`,
    rust: `// Write your solution here

fn main() {
    // Your code here
    println!("Hello");
}`,
};

/**
 * CodeEditor - Monaco Editor based component
 * 
 * Performance Rules (CRITICAL):
 * - Local state for code (NOT Redux)
 * - Memoized to prevent re-renders
 * - Monaco owns: cursor, text input, UI
 * - Only syncs to parent on change (debounced internally)
 * 
 * Features:
 * - Multi-language support
 * - Dark theme matching battle UI
 * - ReadOnly mode for locked state
 * - No minimap (performance)
 */
function CodeEditorComponent({
    value,
    onChange,
    language = 'javascript',
    disabled = false,
    className,
}: CodeEditorProps) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof import('monaco-editor') | null>(null);

    // Configure Monaco before mount
    const handleBeforeMount: BeforeMount = useCallback((monaco) => {
        monacoRef.current = monaco;

        // Define custom dark theme matching battle UI
        monaco.editor.defineTheme('battleDark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'FF7B72' },
                { token: 'string', foreground: 'A5D6FF' },
                { token: 'number', foreground: '79C0FF' },
                { token: 'function', foreground: 'D2A8FF' },
                { token: 'variable', foreground: 'FFA657' },
                { token: 'type', foreground: '7EE787' },
            ],
            colors: {
                'editor.background': '#0b0f1a',
                'editor.foreground': '#E6EDF3',
                'editor.lineHighlightBackground': '#1a1f2e',
                'editor.selectionBackground': '#264F78',
                'editorCursor.foreground': '#3B82F6',
                'editorLineNumber.foreground': '#484f58',
                'editorLineNumber.activeForeground': '#E6EDF3',
                'editor.inactiveSelectionBackground': '#1a3a5c',
                'editorGutter.background': '#0b0f1a',
            },
        });
    }, []);

    // Handle editor mount
    const handleMount: OnMount = useCallback((editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Focus editor
        editor.focus();
    }, []);

    // Handle value changes - pass to parent
    const handleChange = useCallback((newValue: string | undefined) => {
        if (newValue !== undefined) {
            onChange(newValue);
        }
    }, [onChange]);

    // Update readOnly when disabled changes
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.updateOptions({ readOnly: disabled });
        }
    }, [disabled]);

    return (
        <div className={cn('h-full w-full', disabled && 'opacity-60', className)}>
            <Editor
                height="100%"
                language={LANGUAGE_MAP[language]}
                value={value}
                theme="battleDark"
                onChange={handleChange}
                beforeMount={handleBeforeMount}
                onMount={handleMount}
                loading={
                    <div className="flex h-full items-center justify-center bg-[#0b0f1a] text-muted-foreground">
                        Loading editor...
                    </div>
                }
                options={{
                    // Performance optimizations
                    minimap: { enabled: false },
                    smoothScrolling: false,
                    cursorSmoothCaretAnimation: 'off',
                    renderWhitespace: 'none',

                    // UI settings
                    fontSize: 14,
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                    lineNumbers: 'on',
                    lineHeight: 22,
                    padding: { top: 16, bottom: 16 },

                    // Editor behavior
                    tabSize: 4,
                    insertSpaces: true,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    wordWrap: 'off',

                    // Features
                    bracketPairColorization: { enabled: true },
                    autoClosingBrackets: 'always',
                    autoClosingQuotes: 'always',
                    autoIndent: 'full',
                    formatOnPaste: true,

                    // Suggestions
                    quickSuggestions: true,
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: 'on',

                    // Lock state
                    readOnly: disabled,
                    domReadOnly: disabled,

                    // Hide unnecessary UI
                    folding: true,
                    foldingHighlight: false,
                    renderLineHighlight: 'line',
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                    scrollbar: {
                        vertical: 'auto',
                        horizontal: 'auto',
                        useShadows: false,
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                    },
                }}
            />
        </div>
    );
}

/**
 * Memoized CodeEditor - Only re-renders when necessary
 * 
 * Re-renders on:
 * - Language change
 * - Disabled/readOnly change
 * - Value change (controlled externally)
 * 
 * Does NOT re-render on:
 * - Timer updates
 * - Chat updates
 * - Opponent events
 */
export const CodeEditor = memo(CodeEditorComponent, (prevProps, nextProps) => {
    return (
        prevProps.value === nextProps.value &&
        prevProps.language === nextProps.language &&
        prevProps.disabled === nextProps.disabled
    );
});

// Export default templates for language switching
export { DEFAULT_CODE };
