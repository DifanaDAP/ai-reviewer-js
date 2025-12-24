import { info, warning, error } from '@actions/core'

export interface ConfigStatus {
  openaiApiKey: {
    configured: boolean
    masked: string
  }
  openaiApiOrg: {
    configured: boolean
    masked: string
  }
  mongodbUri: {
    configured: boolean
    masked: string
    connected: boolean
  }
  githubToken: {
    configured: boolean
    masked: string
  }
}

/**
 * Mask a secret value for display (show first and last 4 characters)
 */
export function maskSecret(value: string | undefined, showChars = 4): string {
  if (!value) return '(not set)'
  if (value.length <= showChars * 2) return '***'
  return `${value.substring(0, showChars)}...${value.substring(value.length - showChars)}`
}

/**
 * Validate and report all configuration settings
 */
export function validateConfig(mongodbUri: string): ConfigStatus {
  const status: ConfigStatus = {
    openaiApiKey: {
      configured: !!process.env.OPENAI_API_KEY,
      masked: maskSecret(process.env.OPENAI_API_KEY)
    },
    openaiApiOrg: {
      configured: !!process.env.OPENAI_API_ORG,
      masked: maskSecret(process.env.OPENAI_API_ORG)
    },
    mongodbUri: {
      configured: !!mongodbUri,
      masked: maskSecret(mongodbUri),
      connected: false
    },
    githubToken: {
      configured: !!process.env.GITHUB_TOKEN,
      masked: maskSecret(process.env.GITHUB_TOKEN)
    }
  }

  return status
}

/**
 * Print configuration status to logs
 */
export function printConfigStatus(status: ConfigStatus): void {
  info('='.repeat(50))
  info('🔧 Configuration Status Report')
  info('='.repeat(50))
  
  // OpenAI API Key
  if (status.openaiApiKey.configured) {
    info(`✅ OPENAI_API_KEY: Configured (${status.openaiApiKey.masked})`)
  } else {
    error('❌ OPENAI_API_KEY: NOT CONFIGURED - This is required!')
  }

  // OpenAI Org
  if (status.openaiApiOrg.configured) {
    info(`✅ OPENAI_API_ORG: Configured (${status.openaiApiOrg.masked})`)
  } else {
    info('ℹ️ OPENAI_API_ORG: Not set (optional)')
  }

  // MongoDB URI
  if (status.mongodbUri.configured) {
    info(`✅ MONGODB_URI: Configured (${status.mongodbUri.masked})`)
  } else {
    warning('⚠️ MONGODB_URI: Not configured - Review history will not be saved')
  }

  // GitHub Token
  if (status.githubToken.configured) {
    info(`✅ GITHUB_TOKEN: Configured (${status.githubToken.masked})`)
  } else {
    error('❌ GITHUB_TOKEN: NOT CONFIGURED - This is required!')
  }

  info('='.repeat(50))
}

/**
 * Generate markdown status for PR comment
 */
export function generateConfigStatusMarkdown(status: ConfigStatus): string {
  let markdown = `
### 🔧 Configuration Status
| Setting | Status | Details |
| :--- | :--- | :--- |
| **OpenAI API Key** | ${status.openaiApiKey.configured ? '✅' : '❌'} | ${status.openaiApiKey.configured ? 'Configured' : 'NOT SET - Required!'} |
| **GitHub Token** | ${status.githubToken.configured ? '✅' : '❌'} | ${status.githubToken.configured ? 'Configured' : 'NOT SET - Required!'} |
| **MongoDB URI** | ${status.mongodbUri.configured ? (status.mongodbUri.connected ? '✅' : '🟡') : '⚪'} | ${status.mongodbUri.configured ? (status.mongodbUri.connected ? 'Connected' : 'Configured but NOT CONNECTED') : 'Not configured (optional)'} |
`
  return markdown
}

/**
 * Check if all required configurations are present
 */
export function hasRequiredConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!process.env.OPENAI_API_KEY) {
    errors.push('OPENAI_API_KEY is not set. This is required for AI review.')
  }
  
  if (!process.env.GITHUB_TOKEN) {
    errors.push('GITHUB_TOKEN is not set. This is required for GitHub API access.')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
