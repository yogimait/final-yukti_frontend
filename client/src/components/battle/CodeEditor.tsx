import { useEffect, useRef, memo } from 'react';
import { EditorState, type Extension } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { indentOnInput, bracketMatching, foldGutter, foldKeymap, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: 'javascript' | 'python' | 'cpp' | 'java' | 'typescript' | 'go' | 'rust';
    disabled?: boolean;
    className?: string;
}

// Custom dark theme matching #0b0f1a background
const customDarkTheme = EditorView.theme({
    '&': {
        backgroundColor: '#0b0f1a',
        height: '100%',
    },
    '.cm-content': {
        caretColor: 'hsl(217, 91%, 60%)',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
        fontSize: '14px',
    },
    '.cm-cursor, .cm-dropCursor': {
        borderLeftColor: 'hsl(217, 91%, 60%)',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
    },
    '.cm-activeLine': {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    '.cm-activeLineGutter': {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    '.cm-gutters': {
        backgroundColor: '#0b0f1a',
        color: 'rgba(255, 255, 255, 0.3)',
        border: 'none',
    },
    '.cm-lineNumbers .cm-gutterElement': {
        padding: '0 12px 0 8px',
    },
    '.cm-scroller': {
        overflow: 'auto',
    },
}, { dark: true });

// Get language extension based on language prop
function getLanguageExtension(language: string): Extension {
    switch (language) {
        case 'python':
            return python();
        case 'cpp':
            return cpp();
        case 'java':
            return java();
        case 'typescript':
            return javascript({ typescript: true });
        case 'javascript':
        default:
            return javascript();
    }
}

/**
 * CodeEditor - CodeMirror 6 based editor
 * 
 * Features:
 * - Syntax highlighting for multiple languages
 * - One Dark theme customized for #0b0f1a background
 * - Line numbers, bracket matching, auto-completion
 * - No animations, performance focused
 */
function CodeEditorComponent({
    value,
    onChange,
    language = 'javascript',
    disabled = false,
    className,
}: CodeEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const onChangeRef = useRef(onChange);

    // Keep onChange ref up to date
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Create editor
    useEffect(() => {
        if (!editorRef.current) return;

        const updateListener = EditorView.updateListener.of((update) => {
            if (update.docChanged) {
                onChangeRef.current(update.state.doc.toString());
            }
        });

        const extensions: Extension[] = [
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
            history(),
            foldGutter(),
            drawSelection(),
            dropCursor(),
            EditorState.allowMultipleSelections.of(true),
            indentOnInput(),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            bracketMatching(),
            autocompletion(),
            rectangularSelection(),
            crosshairCursor(),
            highlightActiveLine(),
            keymap.of([
                ...defaultKeymap,
                ...historyKeymap,
                ...completionKeymap,
                ...foldKeymap,
                indentWithTab,
            ]),
            getLanguageExtension(language),
            oneDark,
            customDarkTheme,
            updateListener,
            EditorState.readOnly.of(disabled),
        ];

        const state = EditorState.create({
            doc: value,
            extensions,
        });

        const view = new EditorView({
            state,
            parent: editorRef.current,
        });

        viewRef.current = view;

        return () => {
            view.destroy();
            viewRef.current = null;
        };
    }, [language, disabled]); // Recreate on language or disabled change

    // Update value when it changes externally
    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;

        const currentValue = view.state.doc.toString();
        if (value !== currentValue) {
            view.dispatch({
                changes: {
                    from: 0,
                    to: currentValue.length,
                    insert: value,
                },
            });
        }
    }, [value]);

    return (
        <div
            ref={editorRef}
            className={cn(
                'h-full w-full overflow-hidden',
                disabled && 'opacity-60',
                className
            )}
        />
    );
}

export const CodeEditor = memo(CodeEditorComponent, (prevProps, nextProps) => {
    return (
        prevProps.value === nextProps.value &&
        prevProps.language === nextProps.language &&
        prevProps.disabled === nextProps.disabled
    );
});
