/**
 * Review result models for AI PR Reviewer
 * Defines PR metrics and aggregated review results
 */

import { type Feedback, Priority, getPriorityEmoji } from './feedback'

export interface PRMetrics {
    filesChanged: number
    linesAdded: number
    linesDeleted: number
    totalChanges: number
    testFilesChanged: number
    sourceFilesChanged: number
}

export interface ReviewResult {
    prNumber: number
    prTitle: string
    repo: string
    metrics: PRMetrics
    feedbacks: Feedback[]
    summary: string
    positives: string[]
    timestamp: Date
}

/**
 * Count feedbacks by priority
 */
export function countByPriority(
    feedbacks: Feedback[]
): Record<Priority, number> {
    const counts: Record<Priority, number> = {
        [Priority.HIGH]: 0,
        [Priority.MEDIUM]: 0,
        [Priority.LOW]: 0,
        [Priority.NIT]: 0
    }

    for (const fb of feedbacks) {
        counts[fb.priority]++
    }

    return counts
}

/**
 * Get overall status based on feedback counts
 */
export function getOverallStatus(feedbacks: Feedback[]): string {
    const counts = countByPriority(feedbacks)

    if (counts[Priority.HIGH] > 0) {
        return '❌ Changes Requested'
    } else if (counts[Priority.MEDIUM] > 0) {
        return '⚠️ Needs Attention'
    } else if (counts[Priority.LOW] > 0 || counts[Priority.NIT] > 0) {
        return '💡 Minor Suggestions'
    }
    return '✅ LGTM'
}

/**
 * Format review result as markdown summary
 */
export function formatReviewSummary(result: ReviewResult): string {
    const counts = countByPriority(result.feedbacks)
    const status = getOverallStatus(result.feedbacks)

    let markdown = `## ${status}\n\n`

    // Metrics
    markdown += `### 📊 PR Metrics\n`
    markdown += `- Files changed: ${result.metrics.filesChanged}\n`
    markdown += `- Lines added: +${result.metrics.linesAdded}\n`
    markdown += `- Lines deleted: -${result.metrics.linesDeleted}\n\n`

    // Issue counts
    markdown += `### 🔍 Issues Found\n`
    markdown += `${getPriorityEmoji(Priority.HIGH)} HIGH: ${counts[Priority.HIGH]} | `
    markdown += `${getPriorityEmoji(Priority.MEDIUM)} MEDIUM: ${counts[Priority.MEDIUM]} | `
    markdown += `${getPriorityEmoji(Priority.LOW)} LOW: ${counts[Priority.LOW]} | `
    markdown += `${getPriorityEmoji(Priority.NIT)} NIT: ${counts[Priority.NIT]}\n\n`

    // Positives
    if (result.positives.length > 0) {
        markdown += `### ✨ Positives\n`
        for (const positive of result.positives) {
            markdown += `- ${positive}\n`
        }
        markdown += '\n'
    }

    // Summary
    if (result.summary) {
        markdown += `### 📝 Summary\n${result.summary}\n`
    }

    return markdown
}
