/**
 * Documentation Analyzer - checks documentation requirements
 */

import {
    BaseAnalyzer,
    type ReviewContext,
    type AnalyzableFile,
    type AnalyzerConfig
} from './base'
import { type Feedback, Priority, Category } from '../models/feedback'

/**
 * Analyzes documentation - README, JSDoc, CHANGELOG updates
 */
export class DocAnalyzer extends BaseAnalyzer {
    name = 'documentation'
    description = 'Checks documentation requirements'

    constructor(config?: AnalyzerConfig) {
        super(config)
    }

    analyze(context: ReviewContext): Feedback[] {
        const feedbacks: Feedback[] = []

        // Check if significant changes were made
        const significantFiles = context.files.filter(
            (f) => !f.isTestFile && f.additions > 20
        )

        // Check README updates for new features
        const hasNewFeature = context.prTitle.toLowerCase().startsWith('feat')
        const hasReadmeUpdate = context.files.some((f) =>
            /readme\.md/i.test(f.filename)
        )

        if (hasNewFeature && !hasReadmeUpdate && significantFiles.length > 0) {
            feedbacks.push({
                priority: Priority.NIT,
                category: Category.DOCUMENTATION,
                title: 'Consider README Update',
                message:
                    'This PR adds a new feature but does not update the README.',
                suggestion:
                    'Consider documenting the new feature in the README if it affects users.'
            })
        }

        // Check for public functions without JSDoc/TSDoc
        for (const file of context.files) {
            if (this.shouldSkipFile(file)) continue

            const docFeedbacks = this.checkDocumentation(file)
            feedbacks.push(...docFeedbacks)
        }

        // Check CHANGELOG updates for significant changes
        const hasChangelogUpdate = context.files.some((f) =>
            /changelog\.md/i.test(f.filename)
        )
        const isSignificantChange =
            hasNewFeature ||
            context.prTitle.toLowerCase().startsWith('fix') ||
            context.prTitle.toLowerCase().includes('breaking')

        if (isSignificantChange && !hasChangelogUpdate) {
            feedbacks.push({
                priority: Priority.NIT,
                category: Category.DOCUMENTATION,
                title: 'Consider CHANGELOG Update',
                message:
                    'This PR contains significant changes but does not update CHANGELOG.',
                suggestion:
                    'Consider adding an entry to CHANGELOG.md if you maintain one.'
            })
        }

        return feedbacks
    }

    private checkDocumentation(file: AnalyzableFile): Feedback[] {
        const feedbacks: Feedback[] = []

        // Only check TypeScript/JavaScript files
        if (!['ts', 'tsx', 'js', 'jsx'].includes(file.extension)) {
            return feedbacks
        }

        // Track if we're inside a block comment
        let inBlockComment = false
        let lastDocLine = -10

        for (const { line, content } of file.addedLines) {
            // Track block comments (JSDoc)
            if (content.includes('/**')) {
                inBlockComment = true
                lastDocLine = line
            }
            if (content.includes('*/')) {
                inBlockComment = false
            }

            // Skip if in block comment
            if (inBlockComment) continue

            // Check for exported functions without preceding JSDoc
            const exportFunctionMatch = content.match(
                /export\s+(async\s+)?function\s+(\w+)/
            )
            if (exportFunctionMatch) {
                const funcName = exportFunctionMatch[2]
                // Check if there was a JSDoc comment within 3 lines
                if (line - lastDocLine > 3) {
                    feedbacks.push({
                        file: file.filename,
                        line,
                        priority: Priority.NIT,
                        category: Category.DOCUMENTATION,
                        title: 'Missing JSDoc',
                        message: `Exported function "${funcName}" lacks JSDoc documentation.`,
                        suggestion:
                            'Add JSDoc comment describing the function, parameters, and return value.',
                        codeSnippet: content.trim()
                    })
                }
            }

            // Check for exported classes without JSDoc
            const exportClassMatch = content.match(/export\s+class\s+(\w+)/)
            if (exportClassMatch) {
                const className = exportClassMatch[1]
                if (line - lastDocLine > 3) {
                    feedbacks.push({
                        file: file.filename,
                        line,
                        priority: Priority.NIT,
                        category: Category.DOCUMENTATION,
                        title: 'Missing Class Documentation',
                        message: `Exported class "${className}" lacks documentation.`,
                        suggestion: 'Add JSDoc comment describing the class purpose.',
                        codeSnippet: content.trim()
                    })
                }
            }
        }

        return feedbacks
    }
}
