/**
 * Convention Analyzer - checks coding conventions and file naming
 */

import {
    BaseAnalyzer,
    type ReviewContext,
    type AnalyzableFile,
    type AnalyzerConfig
} from './base'
import { type Feedback, Priority, Category } from '../models/feedback'

/**
 * File length thresholds
 */
const MAX_FILE_LENGTH = 500
const WARNING_FILE_LENGTH = 300

/**
 * Analyzes coding conventions - file naming, import ordering, file length
 */
export class ConventionAnalyzer extends BaseAnalyzer {
    name = 'convention'
    description = 'Checks coding conventions and file naming'

    constructor(config?: AnalyzerConfig) {
        super(config)
    }

    analyze(context: ReviewContext): Feedback[] {
        const feedbacks: Feedback[] = []

        for (const file of context.files) {
            if (this.shouldSkipFile(file)) continue

            // Check file naming convention
            const namingFeedback = this.checkFileNaming(file)
            if (namingFeedback) {
                feedbacks.push(namingFeedback)
            }

            // Check file length (based on additions)
            const lengthFeedback = this.checkFileLength(file)
            if (lengthFeedback) {
                feedbacks.push(lengthFeedback)
            }

            // Check import ordering and patterns
            const importFeedbacks = this.checkImports(file)
            feedbacks.push(...importFeedbacks)
        }

        return feedbacks
    }

    private checkFileNaming(file: AnalyzableFile): Feedback | null {
        const basename = file.filename.split('/').pop() ?? ''
        const nameWithoutExt = basename.replace(/\.[^.]+$/, '')

        // Check React component files (should be PascalCase)
        if (['tsx', 'jsx'].includes(file.extension)) {
            // Skip test files and index files
            if (file.isTestFile || basename === 'index.tsx' || basename === 'index.jsx') {
                return null
            }

            // Check if file looks like a component (has capital letter content)
            const hasComponent = file.addedLines.some(
                ({ content }) =>
                    /export\s+(default\s+)?(function|const|class)\s+[A-Z]/.test(content) ||
                    /^const\s+[A-Z]\w+\s*[:=]/.test(content)
            )

            if (hasComponent && !/^[A-Z][a-zA-Z0-9]*$/.test(nameWithoutExt)) {
                return {
                    file: file.filename,
                    priority: Priority.NIT,
                    category: Category.CONVENTION,
                    title: 'Component File Naming',
                    message: `React component file "${basename}" should use PascalCase.`,
                    suggestion: `Rename to "${this.toPascalCase(nameWithoutExt)}.${file.extension}"`
                }
            }
        }

        // Check regular files (should be kebab-case or camelCase)
        if (['ts', 'js'].includes(file.extension) && !file.isTestFile) {
            // Skip config files
            if (basename.includes('.config.') || basename.startsWith('.')) {
                return null
            }

            const isKebabCase = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(nameWithoutExt)
            const isCamelCase = /^[a-z][a-zA-Z0-9]*$/.test(nameWithoutExt)
            const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(nameWithoutExt)

            if (!isKebabCase && !isCamelCase && !isPascalCase) {
                return {
                    file: file.filename,
                    priority: Priority.NIT,
                    category: Category.CONVENTION,
                    title: 'File Naming Convention',
                    message: `File "${basename}" does not follow naming conventions.`,
                    suggestion: 'Use kebab-case (preferred) or camelCase for file names.'
                }
            }
        }

        return null
    }

    private checkFileLength(file: AnalyzableFile): Feedback | null {
        // Estimate total file lines from additions
        const estimatedLength = file.additions + file.deletions

        if (estimatedLength > MAX_FILE_LENGTH) {
            return {
                file: file.filename,
                priority: Priority.LOW,
                category: Category.CONVENTION,
                title: 'Large File',
                message: `File has approximately ${estimatedLength} lines of changes. Consider refactoring.`,
                suggestion:
                    'Split large files into smaller, focused modules for better maintainability.'
            }
        }

        if (estimatedLength > WARNING_FILE_LENGTH) {
            return {
                file: file.filename,
                priority: Priority.NIT,
                category: Category.CONVENTION,
                title: 'Growing File',
                message: `File is getting large (~${estimatedLength} lines changed).`,
                suggestion:
                    'Consider if this file should be split as it grows.'
            }
        }

        return null
    }

    private checkImports(file: AnalyzableFile): Feedback[] {
        const feedbacks: Feedback[] = []

        // Only check JS/TS files
        if (!['ts', 'tsx', 'js', 'jsx'].includes(file.extension)) {
            return feedbacks
        }

        let lastImportType: 'external' | 'internal' | 'relative' | null = null
        let importLines: number[] = []

        for (const { line, content } of file.addedLines) {
            const importMatch = content.match(/^import\s+.*from\s+['"](.+)['"]/)
            if (!importMatch) continue

            importLines.push(line)
            const importPath = importMatch[1]

            // Determine import type
            let importType: 'external' | 'internal' | 'relative'
            if (importPath.startsWith('.')) {
                importType = 'relative'
            } else if (importPath.startsWith('@/') || importPath.startsWith('~/')) {
                importType = 'internal'
            } else {
                importType = 'external'
            }

            // Check if imports are grouped correctly (external -> internal -> relative)
            if (lastImportType !== null) {
                const typeOrder = { external: 0, internal: 1, relative: 2 }
                if (typeOrder[importType] < typeOrder[lastImportType]) {
                    feedbacks.push({
                        file: file.filename,
                        line,
                        priority: Priority.NIT,
                        category: Category.CONVENTION,
                        title: 'Import Order',
                        message: 'Imports should be grouped: external packages first, then internal, then relative.',
                        suggestion:
                            'Reorder imports: 1) External packages, 2) Internal (@/ or ~/), 3) Relative (./) imports.',
                        codeSnippet: content.trim()
                    })
                    // Only report once per file
                    break
                }
            }

            lastImportType = importType
        }

        return feedbacks
    }

    private toPascalCase(str: string): string {
        return str
            .split(/[-_]/)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join('')
    }
}
