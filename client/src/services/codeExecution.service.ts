/**
 * Code Execution Service
 * 
 * Routes code execution between browser (JS/TS) and backend (Python, C++, Java, Go, Rust).
 * All backend languages execute via Judge0 through POST /api/submissions/run.
 * 
 * Features:
 * - Battle mode guard (prevents browser execution during battles)
 * - Timeout handling for backend calls
 * - Unified result normalization (stderr + compile_output)
 * - Execution time and memory reporting
 */

import api from './api';

// =============================================================================
// Types
// =============================================================================

export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'cpp' | 'java' | 'go' | 'rust';

export interface ExecutionPayload {
    language: SupportedLanguage;
    code: string;
    stdin?: string;
    isBattleMode?: boolean;
}

export interface ExecutionResult {
    output: string;
    error: string;
    time: string | null;
    memory: string | null;
    status: string;
    source: 'browser' | 'backend';
}

// Judge0 API response shape
interface Judge0Result {
    stdout: string | null;
    stderr: string | null;
    compile_output: string | null;
    time: string | null;
    memory: number | null;
    status: {
        id: number;
        description: string;
    };
}

interface ApiResponse {
    statusCode: number;
    data: Judge0Result;
    message: string;
}

// =============================================================================
// Language Execution Map
// =============================================================================

type ExecutionTarget = 'browser' | 'backend';

const LANGUAGE_EXECUTION_MAP: Record<SupportedLanguage, ExecutionTarget> = {
    javascript: 'browser',
    typescript: 'browser',
    python: 'backend',
    cpp: 'backend',
    java: 'backend',
    go: 'backend',
    rust: 'backend',
};

// =============================================================================
// Execution Functions
// =============================================================================

/**
 * Main execution router - dispatches to browser or backend based on language
 */
export async function executeCode(payload: ExecutionPayload): Promise<ExecutionResult> {
    const { language, isBattleMode = false } = payload;
    const executionTarget = LANGUAGE_EXECUTION_MAP[language];

    // Battle Mode Guard - Prevent browser execution in battles (anti-cheat)
    if (isBattleMode && executionTarget === 'browser') {
        console.warn('[EXECUTION_GUARD] Browser execution disabled in battle mode');
        throw new Error('Browser execution disabled in battle mode. Use backend languages for fair play.');
    }

    if (executionTarget === 'browser') {
        return executeInBrowser(payload);
    }

    return executeViaBackend(payload);
}

/**
 * Browser execution for JavaScript/TypeScript
 * Uses eval() with console.log capture
 */
function executeInBrowser(payload: ExecutionPayload): ExecutionResult {
    const { code, language } = payload;
    const startTime = performance.now();
    const logs: string[] = [];
    let error = '';

    // Capture console.log output
    const originalLog = console.log;
    console.log = (...args) => {
        logs.push(
            args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ')
        );
    };

    try {
        // Execute the code
        // eslint-disable-next-line no-eval
        eval(code);
    } catch (execError: unknown) {
        error = execError instanceof Error ? execError.message : String(execError);
    } finally {
        // Restore console.log
        console.log = originalLog;
    }

    const endTime = performance.now();
    const executionTime = ((endTime - startTime) / 1000).toFixed(3);

    console.info(`[EXECUTION_SOURCE]: browser (${language})`);

    return {
        output: logs.length > 0 ? logs.join('\n') : '',
        error,
        time: `${executionTime}s`,
        memory: null, // Browser doesn't provide memory info
        status: error ? 'Error' : 'Success',
        source: 'browser',
    };
}

/**
 * Backend execution via Judge0
 * Includes timeout handling (6 seconds)
 */
async function executeViaBackend(payload: ExecutionPayload): Promise<ExecutionResult> {
    const { language, code, stdin = '' } = payload;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
        const response = await api.post<ApiResponse>(
            '/submissions/run',
            { language, code, stdin },
            { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        const result = response.data.data;
        console.info(`[EXECUTION_SOURCE]: backend (${language})`);

        return normalizeExecutionResult(result);
    } catch (error: unknown) {
        clearTimeout(timeoutId);

        // Handle abort/timeout
        if (error instanceof Error && error.name === 'AbortError') {
            return {
                output: '',
                error: 'Execution timed out (6s limit). Try simplifying your code.',
                time: null,
                memory: null,
                status: 'Timeout',
                source: 'backend',
            };
        }

        // Handle other errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            output: '',
            error: errorMessage,
            time: null,
            memory: null,
            status: 'Error',
            source: 'backend',
        };
    }
}

/**
 * Normalize Judge0 response to unified format
 * Handles: stderr, compile_output, time, memory
 */
function normalizeExecutionResult(result: Judge0Result): ExecutionResult {
    // Combine stderr and compile_output for error display
    const error = result.stderr || result.compile_output || '';

    // Format memory (Judge0 returns in KB)
    const memoryFormatted = result.memory ? `${(result.memory / 1024).toFixed(2)} MB` : null;

    return {
        output: result.stdout || '',
        error: error.trim(),
        time: result.time ? `${result.time}s` : null,
        memory: memoryFormatted,
        status: result.status.description,
        source: 'backend',
    };
}

/**
 * Format execution result for display in output panel
 */
export function formatExecutionOutput(result: ExecutionResult): string {
    const lines: string[] = [];

    // Status header
    if (result.status === 'Accepted' || result.status === 'Success') {
        lines.push('✓ Execution successful\n');
    } else if (result.error) {
        lines.push(`✗ ${result.status}\n`);
    }

    // Output
    if (result.output) {
        lines.push(result.output);
    }

    // Error
    if (result.error) {
        lines.push(`\n❌ Error:\n${result.error}`);
    }

    // Execution stats (time and memory)
    if (result.time || result.memory) {
        lines.push('\n─────────────────────────────');
        const stats: string[] = [];
        if (result.time) stats.push(`⏱ Time: ${result.time}`);
        if (result.memory) stats.push(`💾 Memory: ${result.memory}`);
        lines.push(stats.join('  │  '));
        lines.push(`📡 Source: ${result.source}`);
    }

    // Empty output message
    if (!result.output && !result.error) {
        lines.push('(No output - add print statements to see results)');
    }

    return lines.join('\n');
}

// Export service object for consistent API
export const codeExecutionService = {
    executeCode,
    formatExecutionOutput,
    LANGUAGE_EXECUTION_MAP,
};

export default codeExecutionService;
