/**
 * Risk Analyzer - detects security vulnerabilities and performance issues
 */

import {
    BaseAnalyzer,
    type ReviewContext,
    type AnalyzableFile,
    type AnalyzerConfig
} from './base'
import { type Feedback, Priority, Category } from '../models/feedback'

interface RiskPattern {
    name: string
    regex: RegExp
    severity: Priority
    category: Category
    message: string
    suggestion: string
}

/**
 * Analyzes code for security vulnerabilities and performance issues
 */
export class RiskAnalyzer extends BaseAnalyzer {
    name = 'risk'
    description = 'Detects security vulnerabilities and performance hotspots'

    /**
     * Built-in security patterns
     */
    private readonly securityPatterns: RiskPattern[] = [
        {
            name: 'SQL Injection (String Format)',
            regex:
                /execute\s*\(\s*f["']|execute\s*\([^)]*%|execute\s*\([^)]*\.format\(/,
            severity: Priority.HIGH,
            category: Category.SECURITY,
            message:
                'Potential SQL injection vulnerability. User input may be directly interpolated into SQL query.',
            suggestion:
                "Use parameterized queries: `cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))`"
        },
        {
            name: 'SQL Injection (String Concat)',
            regex:
                /["']SELECT\s.*["']\s*\+|["']INSERT\s.*["']\s*\+|["']UPDATE\s.*["']\s*\+|["']DELETE\s.*["']\s*\+/i,
            severity: Priority.HIGH,
            category: Category.SECURITY,
            message:
                'Potential SQL injection. SQL query is being built with string concatenation.',
            suggestion:
                'Use parameterized queries or an ORM instead of string concatenation.'
        },
        {
            name: 'XSS - innerHTML',
            regex: /\.innerHTML\s*=(?!\s*["']['"])/,
            severity: Priority.HIGH,
            category: Category.SECURITY,
            message:
                'Setting innerHTML with dynamic content can lead to XSS vulnerabilities.',
            suggestion:
                'Use textContent for text, or sanitize HTML content before insertion.'
        },
        {
            name: 'XSS - dangerouslySetInnerHTML',
            regex: /dangerouslySetInnerHTML\s*=\s*\{/,
            severity: Priority.MEDIUM,
            category: Category.SECURITY,
            message:
                'Using dangerouslySetInnerHTML - ensure content is properly sanitized.',
            suggestion:
                'Sanitize HTML using DOMPurify or similar library before rendering.'
        },
        {
            name: 'Hardcoded Credentials',
            regex:
                /(password|passwd|pwd|secret|api_key|apikey|api_secret|auth_token|access_token)\s*=\s*["'][^"']{8,}["']/i,
            severity: Priority.HIGH,
            category: Category.SECURITY,
            message: 'Possible hardcoded credential or secret detected.',
            suggestion: 'Move secrets to environment variables or a secure vault.'
        },
        {
            name: 'Hardcoded AWS Key',
            regex: /AKIA[0-9A-Z]{16}/,
            severity: Priority.HIGH,
            category: Category.SECURITY,
            message: 'Possible AWS Access Key ID detected in code.',
            suggestion:
                'Remove hardcoded AWS keys. Use IAM roles or environment variables.'
        },
        {
            name: 'Private Key',
            regex: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/,
            severity: Priority.HIGH,
            category: Category.SECURITY,
            message: 'Private key detected in code!',
            suggestion:
                'Never commit private keys. Add to .gitignore and use secrets management.'
        },
        {
            name: 'Eval Usage',
            regex: /\beval\s*\([^)]+\)/,
            severity: Priority.MEDIUM,
            category: Category.SECURITY,
            message:
                'Use of eval() can execute arbitrary code and is a security risk.',
            suggestion:
                'Avoid eval(). Use safer alternatives like JSON.parse() or ast.literal_eval().'
        },
        {
            name: 'Shell Injection',
            regex: /subprocess\.(call|run|Popen)\s*\([^)]*shell\s*=\s*True/,
            severity: Priority.HIGH,
            category: Category.SECURITY,
            message: 'Using shell=True with subprocess can lead to shell injection.',
            suggestion:
                "Use shell=False and pass arguments as a list: subprocess.run(['cmd', 'arg1'])"
        },
        {
            name: 'os.system Usage',
            regex: /os\.system\s*\([^)]+\)/,
            severity: Priority.MEDIUM,
            category: Category.SECURITY,
            message: 'os.system() is vulnerable to shell injection.',
            suggestion: 'Use subprocess.run() with shell=False instead.'
        },
        {
            name: 'Debug Mode in Production',
            regex: /DEBUG\s*=\s*True|app\.run\([^)]*debug\s*=\s*True/i,
            severity: Priority.MEDIUM,
            category: Category.SECURITY,
            message: 'Debug mode should be disabled in production.',
            suggestion:
                "Use environment variable: DEBUG = os.getenv('DEBUG', 'False') == 'True'"
        }
    ]

    /**
     * Performance patterns
     */
    private readonly performancePatterns: RiskPattern[] = [
        {
            name: 'N+1 Query Pattern',
            regex:
                /for\s+\w+\s+in\s+\w+[^:]*:\s*\n\s*.*\.(query|execute|find|get|fetch)/,
            severity: Priority.MEDIUM,
            category: Category.PERFORMANCE,
            message:
                'Possible N+1 query pattern detected - database query inside a loop.',
            suggestion:
                'Fetch all needed data before the loop, or use eager loading/joins.'
        },
        {
            name: 'Synchronous HTTP Request',
            regex: /requests\.(get|post|put|delete|patch)\s*\(/,
            severity: Priority.NIT,
            category: Category.PERFORMANCE,
            message: 'Synchronous HTTP request detected.',
            suggestion:
                'Consider using async HTTP client (httpx, aiohttp) for better concurrency.'
        },
        {
            name: 'Blocking Fetch in Loop',
            regex: /for\s*\([^)]*\)\s*\{[^}]*await\s+fetch\s*\(/,
            severity: Priority.MEDIUM,
            category: Category.PERFORMANCE,
            message: 'Await fetch inside loop - requests are made sequentially.',
            suggestion:
                'Use Promise.all() to make requests in parallel: `await Promise.all(urls.map(fetch))`'
        },
        {
            name: 'Large Array in State',
            regex: /useState\s*\(\s*\[[^\]]{100,}\]/,
            severity: Priority.LOW,
            category: Category.PERFORMANCE,
            message: 'Large array initialized in useState may cause performance issues.',
            suggestion: 'Consider using useMemo or lazy initialization for large data.'
        }
    ]

    constructor(config?: AnalyzerConfig) {
        super(config)
    }

    analyze(context: ReviewContext): Feedback[] {
        const feedbacks: Feedback[] = []

        for (const file of context.files) {
            if (this.shouldSkipFile(file)) {
                continue
            }

            // Security analysis
            const securityFeedbacks = this.checkPatterns(
                file,
                this.securityPatterns
            )
            feedbacks.push(...securityFeedbacks)

            // Performance analysis
            const perfFeedbacks = this.checkPatterns(
                file,
                this.performancePatterns
            )
            feedbacks.push(...perfFeedbacks)

            // Check custom security patterns from config
            if (this.config?.security?.patterns) {
                const customFeedbacks = this.checkCustomPatterns(file)
                feedbacks.push(...customFeedbacks)
            }
        }

        return feedbacks
    }

    private checkPatterns(
        file: AnalyzableFile,
        patterns: RiskPattern[]
    ): Feedback[] {
        const feedbacks: Feedback[] = []

        for (const { line, content } of file.addedLines) {
            for (const pattern of patterns) {
                if (pattern.regex.test(content)) {
                    feedbacks.push({
                        file: file.filename,
                        line,
                        priority: pattern.severity,
                        category: pattern.category,
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

    private checkCustomPatterns(file: AnalyzableFile): Feedback[] {
        const feedbacks: Feedback[] = []
        const customPatterns = this.config?.security?.patterns ?? []

        for (const { line, content } of file.addedLines) {
            for (const pattern of customPatterns) {
                try {
                    const regex = new RegExp(pattern.regex)
                    if (regex.test(content)) {
                        feedbacks.push({
                            file: file.filename,
                            line,
                            priority: (pattern.severity as Priority) ?? Priority.MEDIUM,
                            category: Category.SECURITY,
                            title: pattern.name,
                            message: pattern.message,
                            suggestion: pattern.suggestion,
                            codeSnippet: content.trim()
                        })
                    }
                } catch {
                    // Invalid regex, skip
                }
            }
        }

        return feedbacks
    }
}
