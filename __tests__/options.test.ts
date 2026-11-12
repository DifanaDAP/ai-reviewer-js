import {describe, expect, it} from '@jest/globals'
import {Options, PathFilter} from '../src/options'
import {TokenLimits} from '../src/limits'

describe('Options defaults', () => {
  it('configures current-generation model defaults and a large token budget', () => {
    const options = new Options(false, false, false)
    expect(options.openaiLightModel).toBe('gpt-6-luna')
    expect(options.openaiHeavyModel).toBe('gpt-6.1-sol')
    expect(options.heavyTokenLimits.maxTokens).toBe(120000)
    expect(options.ingestUrl).toBe('')
  })
})

describe('TokenLimits', () => {
  it('gives legacy models their historic budget', () => {
    const limits = new TokenLimits('gpt-4')
    expect(limits.maxTokens).toBe(8000)
  })

  it('gives gpt-5/gpt-6/glm models a large shared budget', () => {
    for (const model of ['gpt-5.6', 'gpt-6-luna', 'glm-4.7']) {
      expect(new TokenLimits(model).maxTokens).toBe(120000)
    }
  })
})

describe('PathFilter', () => {
  it('allows everything when no rules are given', () => {
    expect(new PathFilter(null).check('anything.lock')).toBe(true)
  })
})
