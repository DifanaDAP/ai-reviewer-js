/**
 * Test Analyzer - checks test coverage and test file requirements
 */

import {
    BaseAnalyzer,
    type ReviewContext,
    type AnalyzableFile,
    type AnalyzerConfig
} from './base'
import { type Feedback, Priority, Category } from '../models/feedback'

/**
 * Analyzes test coverage - checks if source files have corresponding tests
 */
export class TestAnalyzer extends BaseAnalyzer {
    name = 'test'
    description = 'Checks test coverage and test file requirements'

    constructor(config?: AnalyzerConfig) {
        super(config)
    }

    analyze(context: ReviewContext): Feedback[] {
        const feedbacks: Feedback[] = []

        // Separate test files and source files
        const testFiles = context.files.filter((f) => f.isTestFile)
        const sourceFiles = context.files.filter(
            (f) => !f.isTestFile && this.isSourceFile(f)
        )

        // Check if source files have corresponding tests
        const missingTests = this.findMissingTests(sourceFiles, testFiles)
        for (const file of missingTests) {
            feedbacks.push({
                file: file.filename,
                priority: Priority.LOW,
                category: Category.TEST,
                title: 'Missing Test File',
                message: `Source file "${file.filename}" was modified but no corresponding test file was found.`,
                suggestion:
                    'Consider adding tests for this file to maintain code coverage.'
            })
        }

        // Check test/source ratio
        if (sourceFiles.length > 0 && testFiles.length === 0) {
            feedbacks.push({
                priority: Priority.MEDIUM,
                category: Category.TEST,
                title: 'No Test Files in PR',
                message: `This PR modifies ${sourceFiles.length} source file(s) but includes no test files.`,
                suggestion: 'Consider adding tests to verify your changes work correctly.'
            })
        }

        // Check for test best practices
        for (const testFile of testFiles) {
            const testFeedbacks = this.checkTestPatterns(testFile)
            feedbacks.push(...testFeedbacks)
        }

        return feedbacks
    }

    private isSourceFile(file: AnalyzableFile): boolean {
        const sourceExtensions = ['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java']
        return (
            sourceExtensions.includes(file.extension) &&
            !file.filename.includes('.d.ts') &&
            !file.filename.includes('.config.')
        )
    }

    private findMissingTests(
        sourceFiles: AnalyzableFile[],
        testFiles: AnalyzableFile[]
    ): AnalyzableFile[] {
        const missing: AnalyzableFile[] = []
        const testNames = testFiles.map((f) =>
            f.filename
                .replace(/\.test\.[jt]sx?$/, '')
                .replace(/\.spec\.[jt]sx?$/, '')
                .replace(/_test\.[jt]sx?$/, '')
                .replace(/test_/, '')
        )

        for (const source of sourceFiles) {
            // Only check significant source files
            if (source.additions < 10) continue

            const baseName = source.filename
                .replace(/\.[jt]sx?$/, '')
                .replace(/\.py$/, '')

            const hasTest = testNames.some(
                (testName) =>
                    testName.includes(baseName) ||
                    baseName.includes(testName.split('/').pop() ?? '')
            )

            if (!hasTest) {
                missing.push(source)
            }
        }

        return missing
    }

    private checkTestPatterns(file: AnalyzableFile): Feedback[] {
        const feedbacks: Feedback[] = []

        for (const { line, content } of file.addedLines) {
            // Check for skipped tests
            if (/\b(it|test|describe)\.skip\s*\(/.test(content)) {
                feedbacks.push({
                    file: file.filename,
                    line,
                    priority: Priority.LOW,
                    category: Category.TEST,
                    title: 'Skipped Test',
                    message: 'Test is being skipped. Make sure this is intentional.',
                    suggestion:
                        'Remove .skip or add a TODO comment explaining why it is skipped.',
                    codeSnippet: content.trim()
                })
            }

            // Check for .only (test isolation)
            if (/\b(it|test|describe)\.only\s*\(/.test(content)) {
                feedbacks.push({
                    file: file.filename,
                    line,
                    priority: Priority.MEDIUM,
                    category: Category.TEST,
                    title: 'Test Isolation (.only)',
                    message:
                        'Using .only will cause other tests to be skipped. Remove before merging.',
                    suggestion: 'Remove .only to run all tests.',
                    codeSnippet: content.trim()
                })
            }

            // Check for empty test body
            if (/\b(it|test)\s*\([^)]+,\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)/.test(content)) {
                feedbacks.push({
                    file: file.filename,
                    line,
                    priority: Priority.MEDIUM,
                    category: Category.TEST,
                    title: 'Empty Test',
                    message: 'Test has an empty body and will always pass.',
                    suggestion: 'Add test assertions or remove the test.',
                    codeSnippet: content.trim()
                })
            }
        }

        return feedbacks
    }
}
