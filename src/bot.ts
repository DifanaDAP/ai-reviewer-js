import {info, warning} from '@actions/core'
import OpenAI from 'openai'
import type {ChatCompletionMessageParam} from 'openai/resources/chat/completions'
import {OpenAIOptions, Options} from './options'

// define type to save parentMessageId and conversationId
export interface Ids {
  parentMessageId?: string
  conversationId?: string
}

// Conversation threads keyed by the completion id that ended the previous
// exchange. The deprecated `chatgpt` library kept this state internally; with
// the raw SDK we track it ourselves for the lifetime of the action run.
const MAX_THREADS = 200

export class Bot {
  private readonly client: OpenAI

  private readonly model: string

  private readonly options: Options

  private readonly systemMessage: string

  private readonly threads = new Map<string, ChatCompletionMessageParam[]>()

  constructor(options: Options, openaiOptions: OpenAIOptions) {
    this.options = options
    this.model = openaiOptions.model
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "Unable to initialize the OpenAI API: the 'OPENAI_API_KEY' environment variable is not available"
      )
    }
    const currentDate = new Date().toISOString().split('T')[0]
    this.systemMessage = `${options.systemMessage}
Knowledge cutoff: ${openaiOptions.tokenLimits.knowledgeCutOff}
Current date: ${currentDate}

IMPORTANT: Entire response must be in the language with ISO code: ${options.language}
`
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: options.apiBaseUrl,
      organization: process.env.OPENAI_API_ORG ?? undefined,
      timeout: options.openaiTimeoutMS,
      maxRetries: options.openaiRetries
    })
  }

  chat = async (message: string, ids: Ids): Promise<[string, Ids]> => {
    if (!message) {
      return ['', {}]
    }

    const start = Date.now()
    try {
      const history =
        ids.parentMessageId != null
          ? this.threads.get(ids.parentMessageId)
          : undefined
      const messages: ChatCompletionMessageParam[] = history ?? [
        {role: 'system', content: this.systemMessage}
      ]
      messages.push({role: 'user', content: message})

      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature: this.options.openaiModelTemperature,
        messages
      })

      const responseText = completion.choices[0]?.message?.content ?? ''
      if (this.threads.size >= MAX_THREADS) {
        const oldest = this.threads.keys().next().value
        if (oldest != null) this.threads.delete(oldest)
      }
      this.threads.set(completion.id, [
        ...messages,
        {role: 'assistant', content: responseText}
      ])

      const end = Date.now()
      info(
        `openai chat completion (model: ${this.model}) response time: ${
          end - start
        } ms`
      )
      if (this.options.debug) {
        info(`openai responses: ${responseText}`)
      }
      let text = responseText
      // remove the prefix "with " in the response (kept from upstream behavior)
      if (text.startsWith('with ')) {
        text = text.substring(5)
      }
      return [
        text,
        {parentMessageId: completion.id, conversationId: completion.id}
      ]
    } catch (e: unknown) {
      warning(`Failed to chat with model ${this.model}: ${e}`)
      return ['', {}]
    }
  }
}
