/**
 * Base Analyzer - foundation for all code analyzers
 * Provides ReviewContext and BaseAnalyzer abstract class
 */

import { type Feedback } from '../models/feedback'

/**
 * File information from GitHub PR
 */
export interface FileInfo {
    filename: string
    status: string
    additions: number
    deletions: number
    changes: number
    patch?: string
}

/**
 * Extended file info with parsed data
 */
export interface AnalyzableFile extends FileInfo {
    extension: string
    isTestFile: boolean
    language?: string
    addedLines: Array<{ line: number; content: string }>
}

/**
 * Context for review analysis
 */
export interface ReviewContext {
    prNumber: number
    prTitle: string
    prBody: string
    repo: string
    files: AnalyzableFile[]
    diff: string
}

/**
 * Configuration for analyzers
 */
export interface AnalyzerConfig {
    enabled: boolean
    prStructure?: {
        titlePattern?: string
        requireDescription?: boolean
    }
    prSize?: {
        maxFiles?: number
        maxLinesAdded?: number
    }
    ignore?: string[]
    naming?: Record<string, Record<string, string>>
    security?: {
        patterns?: Array<{
            name: string
            regex: string
            severity: string
            message: string
            suggestion?: string
        }>
    }
}

/**
 * File extension to language mapping
 */
export const EXTENSION_MAP: Record<string, string> = {
    py: 'python',
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    mjs: 'javascript',
    cjs: 'javascript',
    go: 'go',
    rs: 'rust',
    java: 'java',
    rb: 'ruby',
    php: 'php',
    cs: 'csharp',
    cpp: 'cpp',
    c: 'c',
    swift: 'swift',
    kt: 'kotlin'
}

/**
 * Test file patterns
 */
const TEST_PATTERNS = [
    /\.test\.[jt]sx?$/,
    /\.spec\.[jt]sx?$/,
    /_test\.[jt]sx?$/,
    /test_.*\.[jt]sx?$/,
    /__tests__\//,
    /tests?\//,
    /\.test\.py$/,
    /_test\.py$/,
    /test_.*\.py$/
]

/**
 * Parse file info and extract additional metadata
 */
export function parseFileInfo(file: FileInfo): AnalyzableFile {
    const parts = file.filename.split('.')
    const extension = parts.length > 1 ? parts[parts.length - 1] : ''
    const language = EXTENSION_MAP[extension]
    const isTestFile = TEST_PATTERNS.some((pattern) =>
        pattern.test(file.filename)
    )
    const addedLines = file.patch ? extractAddedLines(file.patch) : []

    return {
        ...file,
        extension,
        language,
        isTestFile,
        addedLines
    }
}

/**
 * Extract added lines from a patch with line numbers
 */
export function extractAddedLines(
    patch: string
): Array<{ line: number; content: string }> {
    const addedLines: Array<{ line: number; content: string }> = []
    let currentLine = 0

    for (const line of patch.split('\n')) {
        if (line.startsWith('@@')) {
            // Parse hunk header: @@ -old_start,old_count +new_start,new_count @@
            const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
            if (match) {
                currentLine = parseInt(match[1], 10)
            }
        } else if (line.startsWith('+') && !line.startsWith('+++')) {
            // Added line
            addedLines.push({ line: currentLine, content: line.slice(1) })
            currentLine++
        } else if (!line.startsWith('-')) {
            // Context line or empty
            currentLine++
        }
        // Deleted lines don't increment currentLine
    }

    return addedLines
}

/**
 * Abstract base class for all analyzers
 */
export abstract class BaseAnalyzer {
    abstract name: string
    abstract description: string

    constructor(protected config?: AnalyzerConfig) { }

    /**
     * Analyze the review context and return feedbacks
     */
    abstract analyze(context: ReviewContext): Feedback[]

    /**
     * Check if a file should be skipped
     */
    protected shouldSkipFile(file: AnalyzableFile): boolean {
        const ignorePatterns = this.config?.ignore ?? []

        // Check ignore patterns
        for (const pattern of ignorePatterns) {
            if (this.matchPattern(file.filename, pattern)) {
                return true
            }
        }

        // Skip binary files (no patch)
        if (!file.patch) {
            return true
        }

        return false
    }

    /**
     * Simple glob pattern matching
     */
    protected matchPattern(filename: string, pattern: string): boolean {
        // Convert glob to regex
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.')

        return new RegExp(`^${regexPattern}$`).test(filename)
    }
}
