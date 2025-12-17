/**
 * Configuration loader for .ai-reviewer.yml
 */

import * as fs from 'fs'
import * as path from 'path'
import { type AnalyzerConfig } from './analyzers/base'

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AnalyzerConfig = {
    enabled: true,
    prStructure: {
        titlePattern: '^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\\(.+\\))?(!)?: .+',
        requireDescription: true
    },
    prSize: {
        maxFiles: 20,
        maxLinesAdded: 500
    },
    ignore: [
        '*.lock',
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        '*.min.js',
        '*.min.css',
        'dist/*',
        'build/*',
        '.next/*',
        'node_modules/*',
        'vendor/*',
        '*.generated.*'
    ],
    naming: {
        python: {
            class: '^[A-Z][a-zA-Z0-9]*$',
            function: '^[a-z_][a-z0-9_]*$'
        },
        typescript: {
            class: '^[A-Z][a-zA-Z0-9]*$',
            function: '^[a-z][a-zA-Z0-9]*$'
        },
        javascript: {
            class: '^[A-Z][a-zA-Z0-9]*$',
            function: '^[a-z][a-zA-Z0-9]*$'
        }
    }
}

/**
 * Load configuration from .ai-reviewer.yml or use defaults
 */
export function loadConfig(workspaceRoot?: string): AnalyzerConfig {
    const configPaths = [
        workspaceRoot ? path.join(workspaceRoot, '.ai-reviewer.yml') : null,
        workspaceRoot ? path.join(workspaceRoot, '.ai-reviewer.yaml') : null
    ].filter(Boolean) as string[]

    for (const configPath of configPaths) {
        try {
            if (fs.existsSync(configPath)) {
                const content = fs.readFileSync(configPath, 'utf8')
                const parsed = parseYaml(content)
                return mergeConfig(DEFAULT_CONFIG, parsed)
            }
        } catch {
            // Config file not found or invalid, use defaults
        }
    }

    return DEFAULT_CONFIG
}

/**
 * Simple YAML parser for basic config files
 */
function parseYaml(content: string): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    const lines = content.split('\n')
    let currentKey: string | null = null
    let currentIndent = 0
    const stack: Array<{ key: string; obj: Record<string, unknown>; indent: number }> = []

    for (const rawLine of lines) {
        const line = rawLine.trimEnd()
        if (!line || line.startsWith('#')) continue

        const indent = line.length - line.trimStart().length
        const trimmed = line.trim()

        // Simple key: value or key:
        const keyValueMatch = trimmed.match(/^(\w+):\s*(.*)$/)
        if (keyValueMatch) {
            const key = keyValueMatch[1]
            const value = keyValueMatch[2]

            // Pop stack if we're at a lower indent level
            while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
                stack.pop()
            }

            const target = stack.length > 0 ? stack[stack.length - 1].obj : result

            if (value) {
                // Parse value
                target[key] = parseValue(value)
            } else {
                // Nested object
                target[key] = {}
                stack.push({ key, obj: target[key] as Record<string, unknown>, indent })
            }
            currentKey = key
            currentIndent = indent
        }

        // Array item
        const arrayMatch = trimmed.match(/^-\s*(.+)$/)
        if (arrayMatch && currentKey) {
            const target = stack.length > 0 ? stack[stack.length - 1].obj : result
            const parent = stack.length > 1 ? stack[stack.length - 2].obj : result

            if (!Array.isArray(parent[currentKey])) {
                parent[currentKey] = []
            }
            (parent[currentKey] as unknown[]).push(parseValue(arrayMatch[1]))
        }
    }

    return result
}

/**
 * Parse a YAML value
 */
function parseValue(value: string): unknown {
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        return value.slice(1, -1)
    }

    // Boolean
    if (value === 'true') return true
    if (value === 'false') return false

    // Number
    const num = Number(value)
    if (!isNaN(num)) return num

    return value
}

/**
 * Deep merge config objects
 */
function mergeConfig(
    defaults: AnalyzerConfig,
    overrides: Record<string, unknown>
): AnalyzerConfig {
    const result: Record<string, unknown> = { ...defaults }

    for (const key of Object.keys(overrides)) {
        const value = overrides[key]
        const defaultVal = (defaults as unknown as Record<string, unknown>)[key]
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = mergeConfig(
                (defaultVal as AnalyzerConfig) ?? { enabled: true },
                value as Record<string, unknown>
            )
        } else {
            result[key] = value
        }
    }

    return result as unknown as AnalyzerConfig
}

export { DEFAULT_CONFIG }
