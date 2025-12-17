/**
 * Static Analyzer - checks naming conventions, code style, and anti-patterns
 */

import {
    BaseAnalyzer,
    type ReviewContext,
    type AnalyzableFile,
    type AnalyzerConfig
} from './base'
import { type Feedback, Priority, Category } from '../models/feedback'

interface AntiPattern {
    name: string
    regex: RegExp
    message: string
    suggestion: string
    priority: Priority
}

/**
 * Analyzes code for style issues, naming conventions, and anti-patterns
 */
export class StaticAnalyzer extends BaseAnalyzer {
    name = 'static'
    description = 'Checks naming conventions, code style, and anti-patterns'

    /**
     * Anti-patterns by language
     */
    private readonly antiPatterns: Record<string, AntiPattern[]> = {
        python: [
            {
                name: 'Bare except',
                regex: /except\s*:/,
                message:
                    'Bare except clause catches all exceptions including KeyboardInterrupt.',
                suggestion:
                    'Use specific exceptions: `except Exception:` or `except ValueError:`',
                priority: Priority.MEDIUM
            },
            {
                name: 'Mutable default argument',
                regex: /def\s+\w+\s*\([^)]*=\s*(\[\]|\{\})\s*[,)]/,
                message: 'Mutable default argument can lead to unexpected behavior.',
                suggestion:
                    'Use None as default: `def func(items=None): items = items or []`',
                priority: Priority.MEDIUM
            },
            {
                name: 'Star import',
                regex: /from\s+\w+\s+import\s+\*/,
                message:
                    'Star imports pollute the namespace and make code harder to understand.',
                suggestion: 'Import specific names: `from module import name1, name2`',
                priority: Priority.LOW
            },
            {
                name: 'Print statement',
                regex: /^\s*print\s*\(/,
                message: 'Print statement found. Consider using logging instead.',
                suggestion: 'Use logging module: `logger.info()` or `logger.debug()`',
                priority: Priority.NIT
            },
            {
                name: 'FIXME in code',
                regex: /#\s*FIXME/,
                message: 'FIXME comment indicates broken code that should be fixed.',
                suggestion: 'Fix the issue or create a tracked issue for it.',
                priority: Priority.LOW
            }
        ],
        javascript: [
            {
                name: 'Console.log',
                regex: /console\.(log|debug|info)\s*\(/,
                message:
                    'Console statement found. Should be removed before production.',
                suggestion: 'Remove console statements or use a proper logger.',
                priority: Priority.LOW
            },
            {
                name: 'var keyword',
                regex: /\bvar\s+\w+/,
                message: "Using 'var' instead of 'let' or 'const'.",
                suggestion: "Use 'const' for constants, 'let' for variables.",
                priority: Priority.LOW
            },
            {
                name: '== comparison',
                regex: /[^!=]==[^=]/,
                message: 'Using loose equality (==) instead of strict equality (===).',
                suggestion: 'Use strict equality === for type-safe comparison.',
                priority: Priority.LOW
            },
            {
                name: 'Alert usage',
                regex: /\balert\s*\(/,
                message: 'Using alert() - should be removed for production.',
                suggestion: 'Use a proper modal/dialog component.',
                priority: Priority.MEDIUM
            },
            {
                name: 'TODO without issue',
                regex: /\/\/\s*TODO(?!.*#\d+|.*issue|.*ticket)/i,
                message: 'TODO comment without linked issue.',
                suggestion: 'Link to an issue: `// TODO(#123): description`',
                priority: Priority.NIT
            }
        ],
        typescript: [
            {
                name: 'Any type',
                regex: /:\s*any\b/,
                message: "Using 'any' type defeats the purpose of TypeScript.",
                suggestion:
                    "Use a specific type or 'unknown' if type is truly unknown.",
                priority: Priority.LOW
            },
            {
                name: 'Type assertion with as any',
                regex: /as\s+any\b/,
                message: "Type assertion to 'any' bypasses type checking.",
                suggestion: 'Use proper type narrowing or a more specific type.',
                priority: Priority.LOW
            },
            {
                name: 'Non-null assertion',
                regex: /\w+![.[\]]/,
                message: 'Non-null assertion (!) can hide potential null errors.',
                suggestion: 'Use optional chaining (?.) or proper null checks.',
                priority: Priority.NIT
            },
            {
                name: 'Console.log',
                regex: /console\.(log|debug|info)\s*\(/,
                message:
                    'Console statement found. Should be removed before production.',
                suggestion: 'Remove console statements or use a proper logger.',
                priority: Priority.LOW
            },
            {
                name: 'TODO without issue',
                regex: /\/\/\s*TODO(?!.*#\d+|.*issue|.*ticket)/i,
                message: 'TODO comment without linked issue.',
                suggestion: 'Link to an issue: `// TODO(#123): description`',
                priority: Priority.NIT
            }
        ]
    }

    constructor(config?: AnalyzerConfig) {
        super(config)
    }

    analyze(context: ReviewContext): Feedback[] {
        const feedbacks: Feedback[] = []

        for (const file of context.files) {
            if (this.shouldSkipFile(file) || !file.language) {
                continue
            }

            // Check anti-patterns for this language
            const patterns = this.antiPatterns[file.language] ?? []
            const patternFeedbacks = this.checkAntiPatterns(file, patterns)
            feedbacks.push(...patternFeedbacks)
        }

        return feedbacks
    }

    private checkAntiPatterns(
        file: AnalyzableFile,
        patterns: AntiPattern[]
    ): Feedback[] {
        const feedbacks: Feedback[] = []

        for (const { line, content } of file.addedLines) {
            for (const pattern of patterns) {
                if (pattern.regex.test(content)) {
                    feedbacks.push({
                        file: file.filename,
                        line,
                        priority: pattern.priority,
                        category: Category.STYLE,
                        title: pattern.name,
                        message: pattern.message,
                        suggestion: pattern.suggestion,
                        codeSnippet: content.trim()
                    })
                }
            }
        }

        return feedbacks
    }
}
