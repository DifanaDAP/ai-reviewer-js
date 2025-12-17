/**
 * Analyzer Runner - runs all analyzers and collects feedbacks
 */

import { info, warning } from '@actions/core'
import {
    createAnalyzers,
    parseFileInfo,
    type ReviewContext,
    type AnalyzerConfig
} from './analyzers'
import {
    type Feedback,
    Priority,
    Category,
    formatFeedback
} from './models/feedback'
import { loadConfig } from './config'

/**
 * GitHub file from API response
 */
interface GitHubFile {
    filename: string
    status: string
    additions: number
    deletions: number
    changes: number
    patch?: string
}

/**
 * Run all analyzers on the PR context
 */
export async function runAnalyzers(
    prNumber: number,
    prTitle: string,
    prBody: string,
    repo: string,
    files: GitHubFile[],
    diff: string
): Promise<Feedback[]> {
    info('🔍 Running pattern-based analyzers...')

    // Load config
    const config = loadConfig()

    // Parse files
    const analyzableFiles = files.map((f) => parseFileInfo(f))

    // Create review context
    const context: ReviewContext = {
        prNumber,
        prTitle,
        prBody,
        repo,
        files: analyzableFiles,
        diff
    }

    // Create and run all analyzers
    const analyzers = createAnalyzers(config)
    let allFeedbacks: Feedback[] = []

    for (const analyzer of analyzers) {
        try {
            info(`   ▸ ${analyzer.name} analyzer...`)
            const feedbacks = analyzer.analyze(context)
            allFeedbacks = allFeedbacks.concat(feedbacks)
        } catch (e: any) {
            warning(`   ⚠️ ${analyzer.name} analyzer failed: ${e.message as string}`)
        }
    }

    info(`   Found ${allFeedbacks.length} issues from pattern analysis`)

    // Deduplicate feedbacks
    allFeedbacks = deduplicateFeedbacks(allFeedbacks)

    return allFeedbacks
}

/**
 * Deduplicate feedbacks based on file, line, and title
 */
function deduplicateFeedbacks(feedbacks: Feedback[]): Feedback[] {
    const seen = new Set<string>()
    const unique: Feedback[] = []

    for (const fb of feedbacks) {
        const key = `${fb.file ?? ''}:${fb.line ?? 0}:${fb.title}:${fb.category}`
        if (!seen.has(key)) {
            seen.add(key)
            unique.push(fb)
        }
    }

    // Sort by priority (HIGH first) then by file
    const priorityOrder: Record<Priority, number> = {
        [Priority.HIGH]: 0,
        [Priority.MEDIUM]: 1,
        [Priority.LOW]: 2,
        [Priority.NIT]: 3
    }

    unique.sort((a, b) => {
        const prioDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (prioDiff !== 0) return prioDiff
        return (a.file ?? '').localeCompare(b.file ?? '')
    })

    return unique
}

/**
 * Count feedbacks by priority
 */
export function countFeedbacksByPriority(
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
 * Count feedbacks by category
 */
export function countFeedbacksByCategory(
    feedbacks: Feedback[]
): Record<Category, number> {
    const counts: Partial<Record<Category, number>> = {}

    for (const fb of feedbacks) {
        counts[fb.category] = (counts[fb.category] ?? 0) + 1
    }

    return counts as Record<Category, number>
}

/**
 * Format feedbacks as markdown table for PR comment
 */
export function formatAnalyzerResults(feedbacks: Feedback[]): string {
    if (feedbacks.length === 0) {
        return '✅ No issues found by pattern analysis.'
    }

    const counts = countFeedbacksByPriority(feedbacks)

    let markdown = `### 🔍 Pattern Analysis Results

| Priority | Count |
| :--- | :--- |
| 🔴 HIGH | ${counts[Priority.HIGH]} |
| 🟡 MEDIUM | ${counts[Priority.MEDIUM]} |
| 🟢 LOW | ${counts[Priority.LOW]} |
| 💭 NIT | ${counts[Priority.NIT]} |

`

    // Group by category
    const byCategory: Record<string, Feedback[]> = {}
    for (const fb of feedbacks) {
        if (!byCategory[fb.category]) {
            byCategory[fb.category] = []
        }
        byCategory[fb.category].push(fb)
    }

    // Show HIGH and MEDIUM issues in detail
    const importantFeedbacks = feedbacks.filter(
        (fb) => fb.priority === Priority.HIGH || fb.priority === Priority.MEDIUM
    )

    if (importantFeedbacks.length > 0) {
        markdown += `<details>
<summary>Issues Requiring Attention (${importantFeedbacks.length})</summary>

`
        for (const fb of importantFeedbacks) {
            const emoji =
                fb.priority === Priority.HIGH ? '🔴' : '🟡'
            const fileInfo = fb.file ? `**${fb.file}**${fb.line ? `:${fb.line}` : ''}` : ''
            markdown += `${emoji} **${fb.title}**${fileInfo ? ` - ${fileInfo}` : ''}
> ${fb.message}
${fb.suggestion ? `> 💡 ${fb.suggestion}` : ''}

`
        }
        markdown += `</details>

`
    }

    // Show LOW and NIT as collapsed
    const minorFeedbacks = feedbacks.filter(
        (fb) => fb.priority === Priority.LOW || fb.priority === Priority.NIT
    )

    if (minorFeedbacks.length > 0) {
        markdown += `<details>
<summary>Minor Suggestions (${minorFeedbacks.length})</summary>

`
        for (const fb of minorFeedbacks) {
            const emoji = fb.priority === Priority.LOW ? '🟢' : '💭'
            const fileInfo = fb.file ? `${fb.file}${fb.line ? `:${fb.line}` : ''}` : ''
            markdown += `- ${emoji} **${fb.title}**${fileInfo ? ` (${fileInfo})` : ''}: ${fb.message}\n`
        }
        markdown += `
</details>
`
    }

    return markdown
}

/**
 * Get overall status based on feedbacks
 */
export function getReviewStatus(
    feedbacks: Feedback[]
): 'approve' | 'comment' | 'request_changes' {
    const counts = countFeedbacksByPriority(feedbacks)

    if (counts[Priority.HIGH] > 0) {
        return 'request_changes'
    } else if (counts[Priority.MEDIUM] > 0) {
        return 'comment'
    }
    return 'approve'
}
