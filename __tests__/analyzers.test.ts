import {describe, expect, it} from '@jest/globals'
import {
  parseFileInfo,
  extractAddedLines,
  type FileInfo,
  type ReviewContext
} from '../src/analyzers/base'
import {RiskAnalyzer} from '../src/analyzers/risk-analyzer'
import {StructureAnalyzer} from '../src/analyzers/structure-analyzer'
import {Category, Priority} from '../src/models/feedback'
import {PathFilter} from '../src/options'

const fileWithPatch = (filename: string, patch: string) =>
  parseFileInfo({
    filename,
    status: 'modified',
    additions: 1,
    deletions: 0,
    changes: 1,
    patch
  })

const contextWith = (
  files: FileInfo[],
  overrides: Partial<ReviewContext> = {}
): ReviewContext => ({
  prNumber: 1,
  prTitle: 'feat: add login',
  prBody: 'A description.',
  repo: 'owner/repo',
  diff: '',
  ...overrides,
  files: files.map(parseFileInfo)
})

describe('parseFileInfo / extractAddedLines', () => {
  it('classifies test files and languages', () => {
    const file = parseFileInfo({
      filename: 'src/app/test_auth.py',
      status: 'added',
      additions: 3,
      deletions: 0,
      changes: 3,
      patch: '@@ -0,0 +1,3 @@'
    })
    expect(file.isTestFile).toBe(true)
    expect(file.language).toBe('python')
  })

  it('extracts added lines with new-file line numbers', () => {
    const lines = extractAddedLines(
      '@@ -10,2 +10,3 @@\n context\n-old\n+new one\n+new two'
    )
    expect(lines).toEqual([
      {line: 11, content: 'new one'},
      {line: 12, content: 'new two'}
    ])
  })
})

describe('RiskAnalyzer', () => {
  const analyzer = new RiskAnalyzer()

  it('flags SQL injection via f-string with line number and file', () => {
    const context = contextWith([
      fileWithPatch(
        'app/db.py',
        '@@ -1,2 +1,3 @@\n+def run(user_id):\n+    cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")'
      )
    ])
    const feedbacks = analyzer.analyze(context)
    expect(feedbacks.length).toBeGreaterThan(0)
    expect(feedbacks[0].priority).toBe(Priority.HIGH)
    expect(feedbacks[0].category).toBe(Category.SECURITY)
    expect(feedbacks[0].file).toBe('app/db.py')
    expect(feedbacks[0].line).toBe(2)
  })

  it('flags hardcoded credentials', () => {
    const context = contextWith([
      fileWithPatch(
        'app/conf.ts',
        '@@ -1,1 +1,2 @@\n+export const api_key = "sk-super-secret-value-123";'
      )
    ])
    const feedbacks = analyzer.analyze(context)
    expect(feedbacks.some(f => f.title.includes('Hardcoded Credentials'))).toBe(
      true
    )
  })

  it('returns nothing for clean code', () => {
    const context = contextWith([
      fileWithPatch('app/clean.py', '@@ -1,1 +1,2 @@\n+    total = sum(items)')
    ])
    expect(analyzer.analyze(context)).toEqual([])
  })
})

describe('StructureAnalyzer', () => {
  const analyzer = new StructureAnalyzer()

  it('accepts a conventional-commit title with description', () => {
    const context = contextWith([], {prTitle: 'feat(auth): add login page'})
    expect(analyzer.analyze(context)).toEqual([])
  })

  it('flags a non-conventional title and oversized PRs', () => {
    const oversized = parseFileInfo({
      filename: 'a.py',
      status: 'modified',
      additions: 600,
      deletions: 0,
      changes: 600,
      patch: '@@ -1,1 +1,600 @@\n' + '+line\n'.repeat(600)
    })
    const context = contextWith([oversized], {prTitle: 'some stuff'})
    const feedbacks = analyzer.analyze(context)
    expect(feedbacks.some(f => f.title === 'PR Title Format')).toBe(true)
    expect(feedbacks.some(f => f.message.toLowerCase().includes('lines'))).toBe(
      true
    )
  })

  it('respects a custom title pattern from config', () => {
    const custom = new StructureAnalyzer({
      enabled: true,
      prStructure: {titlePattern: '^\\[JIRA-\\d+\\]'}
    })
    const context = contextWith([], {prTitle: 'feat: fine title otherwise'})
    const feedbacks = custom.analyze(context)
    expect(feedbacks.some(f => f.title === 'PR Title Format')).toBe(true)
  })
})

describe('PathFilter', () => {
  it('excludes lock files but keeps sources when an inclusion rule exists', () => {
    const filter = new PathFilter(['!**/*.lock', 'src/**'])
    expect(filter.check('src/app.ts')).toBe(true)
    expect(filter.check('Cargo.lock')).toBe(false)
  })
})
