/**
 * HTTPS ingest sink — pushes the finished review to our own backend
 * (e.g. spotkargo.com) instead of / in addition to MongoDB. The endpoint
 * stores it in our PostgreSQL; the reviewer never talks to the database
 * directly, only to the public HTTPS API with a bearer token.
 */
import {info, warning} from '@actions/core'

export interface IngestPayload {
  repoOwner: string
  repoName: string
  prNumber: number
  commitId: string
  summary: string
  securityIssues: string[]
  performanceIssues: string[]
  codeStyleIssues: string[]
  feedbacks: Array<{
    file?: string
    priority: string
    category: string
    message: string
  }>
  lightModel: string
  heavyModel: string
}

export async function sendReviewToIngest(
  url: string,
  token: string,
  payload: IngestPayload
): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      let body = ''
      try {
        body = await response.text()
      } catch {
        // ignore body read errors; the status code is what matters here
      }
      warning(`Ingest failed: HTTP ${response.status} ${body.slice(0, 300)}`)
      return false
    }
    info('Review data delivered to ingest endpoint')
    return true
  } catch (e: unknown) {
    warning(`Ingest request failed: ${e}`)
    return false
  }
}
