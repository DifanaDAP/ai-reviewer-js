/**
 * Structure Analyzer - validates PR structure (title, description, size)
 */

import {
    BaseAnalyzer,
    type ReviewContext,
    type AnalyzerConfig
} from './base'
import { type Feedback, Priority, Category } from '../models/feedback'

/**
 * Default PR size limits
 */
const DEFAULT_MAX_FILES = 20
const DEFAULT_MAX_LINES_ADDED = 500

/**
 * Conventional commit pattern
 */
const CONVENTIONAL_COMMIT_PATTERN =
    /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?(!)?: .+/

/**
 * Analyzes PR structure - title format, description, size limits
 */
export class StructureAnalyzer extends BaseAnalyzer {
    name = 'structure'
    description = 'Validates PR structure, title, description, and size'

    constructor(config?: AnalyzerConfig) {
        super(config)
    }

    analyze(context: ReviewContext): Feedback[] {
        const feedbacks: Feedback[] = []

        // Check title format
        const titleFeedback = this.checkTitle(context.prTitle)
        if (titleFeedback) {
            feedbacks.push(titleFeedback)
        }

        // Check description
        const descFeedback = this.checkDescription(context.prBody)
        if (descFeedback) {
            feedbacks.push(descFeedback)
        }

        // Check PR size
        const sizeFeedbacks = this.checkSize(context)
        feedbacks.push(...sizeFeedbacks)

        return feedbacks
    }

    private checkTitle(title: string): Feedback | null {
        const pattern = this.config?.prStructure?.titlePattern
        const regex = pattern ? new RegExp(pattern) : CONVENTIONAL_COMMIT_PATTERN

        if (!regex.test(title)) {
            return {
                priority: Priority.LOW,
                category: Category.STRUCTURE,
                title: 'PR Title Format',
                message:
                    'PR title does not follow conventional commit format.',
                suggestion:
                    'Use format: `type(scope): description` (e.g., `feat(auth): add login page`)'
            }
        }

        return null
    }

    private checkDescription(body: string): Feedback | null {
        const requireDescription =
            this.config?.prStructure?.requireDescription ?? true

        if (requireDescription && (!body || body.trim().length < 10)) {
            return {
                priority: Priority.LOW,
                category: Category.STRUCTURE,
                title: 'Missing PR Description',
                message:
                    'PR description is empty or too short.',
                suggestion:
                    'Add a meaningful description explaining what this PR does and why.'
            }
        }

        return null
    }

    private checkSize(context: ReviewContext): Feedback[] {
        const feedbacks: Feedback[] = []
        const maxFiles = this.config?.prSize?.maxFiles ?? DEFAULT_MAX_FILES
        const maxLines = this.config?.prSize?.maxLinesAdded ?? DEFAULT_MAX_LINES_ADDED

        const filesCount = context.files.length
        const linesAdded = context.files.reduce((sum, f) => sum + f.additions, 0)

        if (filesCount > maxFiles) {
            feedbacks.push({
                priority: Priority.MEDIUM,
                category: Category.STRUCTURE,
                title: 'Large PR - Too Many Files',
                message: `This PR changes ${filesCount} files, which exceeds the recommended limit of ${maxFiles}.`,
                suggestion:
                    'Consider splitting this PR into smaller, focused changes for easier review.'
            })
        }

        if (linesAdded > maxLines) {
            feedbacks.push({
                priority: Priority.MEDIUM,
                category: Category.STRUCTURE,
                title: 'Large PR - Too Many Lines',
                message: `This PR adds ${linesAdded} lines, which exceeds the recommended limit of ${maxLines}.`,
                suggestion:
                    'Consider splitting this PR into smaller, focused changes for easier review.'
            })
        }

        return feedbacks
    }
}
