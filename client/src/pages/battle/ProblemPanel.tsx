import { useState, memo } from 'react';
import { ChevronLeft, ChevronRight, FileText, Code, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock problem data
const mockProblem = {
    title: 'Two Sum',
    difficulty: 'easy' as const,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: [
        '2 ≤ nums.length ≤ 10⁴',
        '-10⁹ ≤ nums[i] ≤ 10⁹',
        '-10⁹ ≤ target ≤ 10⁹',
        'Only one valid answer exists.',
    ],
    examples: [
        {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
        },
        {
            input: 'nums = [3,2,4], target = 6',
            output: '[1,2]',
            explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
        },
    ],
};

const difficultyColors = {
    easy: 'text-green-500 bg-green-500/10',
    medium: 'text-yellow-500 bg-yellow-500/10',
    hard: 'text-red-500 bg-red-500/10',
};

type TabValue = 'description' | 'examples' | 'constraints';

interface ProblemPanelProps {
    className?: string;
}

/**
 * ProblemPanel - Left collapsible panel
 * 
 * Features:
 * - Default width: 22-25%
 * - Scrollable content
 * - Tabs: Description, Examples, Constraints (no Whiteboard)
 * - Collapsed state: Icon-only vertical strip
 * - Animation: Slide in/out (transform X, 200ms)
 * - No markdown fade-ins
 */
function ProblemPanelComponent({ className }: ProblemPanelProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState<TabValue>('description');

    const tabs: { value: TabValue; label: string; icon: React.ReactNode }[] = [
        { value: 'description', label: 'Description', icon: <FileText className="h-4 w-4" /> },
        { value: 'examples', label: 'Examples', icon: <Code className="h-4 w-4" /> },
        { value: 'constraints', label: 'Constraints', icon: <ListChecks className="h-4 w-4" /> },
    ];

    return (
        <div
            className={cn(
                'panel-slide flex flex-col h-full bg-card border-r border-border',
                isCollapsed ? 'w-12' : 'w-full',
                className
            )}
        >
            {/* Collapsed State - Icon strip */}
            {isCollapsed ? (
                <div className="flex flex-col items-center py-3 gap-3">
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="p-2 rounded-md hover:bg-secondary transition-colors"
                        aria-label="Expand problem panel"
                    >
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>

                    <div className="h-px w-6 bg-border" />

                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => {
                                setActiveTab(tab.value);
                                setIsCollapsed(false);
                            }}
                            className={cn(
                                'p-2 rounded-md transition-colors',
                                activeTab === tab.value
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-secondary'
                            )}
                            aria-label={tab.label}
                            title={tab.label}
                        >
                            {tab.icon}
                        </button>
                    ))}
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 border-b border-border flex-shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <h2 className="text-sm font-semibold text-foreground truncate">
                                {mockProblem.title}
                            </h2>
                            <span
                                className={cn(
                                    'rounded-full px-2 py-0.5 text-[10px] font-medium capitalize flex-shrink-0',
                                    difficultyColors[mockProblem.difficulty]
                                )}
                            >
                                {mockProblem.difficulty}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="p-1.5 rounded-md hover:bg-secondary transition-colors flex-shrink-0"
                            aria-label="Collapse problem panel"
                        >
                            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Tab List */}
                    <div className="flex border-b border-border flex-shrink-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={cn(
                                    'flex-1 py-2 text-xs font-medium transition-colors',
                                    activeTab === tab.value
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {activeTab === 'description' && (
                            <div className="prose prose-sm prose-invert max-w-none">
                                <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                                    {mockProblem.description}
                                </p>
                            </div>
                        )}

                        {activeTab === 'examples' && (
                            <div className="space-y-4">
                                {mockProblem.examples.map((example, index) => (
                                    <div key={index} className="rounded-lg border border-border p-3">
                                        <h4 className="text-xs font-medium text-muted-foreground mb-2">
                                            Example {index + 1}
                                        </h4>
                                        <div className="space-y-1.5 font-mono text-xs">
                                            <div>
                                                <span className="text-muted-foreground">Input: </span>
                                                <code className="rounded bg-background px-1 py-0.5 text-foreground">
                                                    {example.input}
                                                </code>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Output: </span>
                                                <code className="rounded bg-background px-1 py-0.5 text-green-500">
                                                    {example.output}
                                                </code>
                                            </div>
                                            {example.explanation && (
                                                <p className="text-muted-foreground text-[11px] mt-2">
                                                    {example.explanation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'constraints' && (
                            <ul className="space-y-2">
                                {mockProblem.constraints.map((constraint, index) => (
                                    <li key={index} className="flex items-start gap-2 font-mono text-xs">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span className="text-foreground">{constraint}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

/**
 * Memoized ProblemPanel to prevent unnecessary re-renders
 */
export const ProblemPanel = memo(ProblemPanelComponent);
