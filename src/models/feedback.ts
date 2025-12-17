/**
 * Feedback models for AI PR Reviewer
 * Defines priority levels, categories, and feedback structure
 */

export enum Priority {
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW',
    NIT = 'NIT'
}

export enum Category {
    SECURITY = 'security',
    PERFORMANCE = 'performance',
    STYLE = 'style',
    STRUCTURE = 'structure',
    TEST = 'test',
    DOCUMENTATION = 'documentation',
    CONVENTION = 'convention'
}

export interface Feedback {
    file?: string
    line?: number
    endLine?: number
    priority: Priority
    category: Category
    title: string
    message: string
    suggestion?: string
    codeSnippet?: string
}

/**
 * Get emoji for priority level
 */
export function getPriorityEmoji(priority: Priority): string {
    switch (priority) {
        case Priority.HIGH:
            return '🔴'
        case Priority.MEDIUM:
            return '🟡'
        case Priority.LOW:
            return '🟢'
        case Priority.NIT:
            return '💭'
        default:
            return '📝'
    }
}

/**
 * Format feedback as markdown comment
 */
export function formatFeedback(feedback: Feedback): string {
    const emoji = getPriorityEmoji(feedback.priority)
    let comment = `${emoji} **${feedback.priority}**: ${feedback.title}\n\n${feedback.message}`

    if (feedback.suggestion) {
        comment += `\n\n**Suggestion:** ${feedback.suggestion}`
    }

    if (feedback.codeSnippet) {
        comment += `\n\n\`\`\`\n${feedback.codeSnippet}\n\`\`\``
    }

    return comment
}
