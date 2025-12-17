/**
 * Analyzers index - export all analyzers
 */

export * from './base'
export { StaticAnalyzer } from './static-analyzer'
export { RiskAnalyzer } from './risk-analyzer'
export { StructureAnalyzer } from './structure-analyzer'
export { TestAnalyzer } from './test-analyzer'
export { DocAnalyzer } from './doc-analyzer'
export { ConventionAnalyzer } from './convention-analyzer'

import { type BaseAnalyzer, type AnalyzerConfig } from './base'
import { StaticAnalyzer } from './static-analyzer'
import { RiskAnalyzer } from './risk-analyzer'
import { StructureAnalyzer } from './structure-analyzer'
import { TestAnalyzer } from './test-analyzer'
import { DocAnalyzer } from './doc-analyzer'
import { ConventionAnalyzer } from './convention-analyzer'

/**
 * Create all analyzers with given config
 */
export function createAnalyzers(config?: AnalyzerConfig): BaseAnalyzer[] {
    return [
        new StructureAnalyzer(config),
        new StaticAnalyzer(config),
        new RiskAnalyzer(config),
        new TestAnalyzer(config),
        new DocAnalyzer(config),
        new ConventionAnalyzer(config)
    ]
}
