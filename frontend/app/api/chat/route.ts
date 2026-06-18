import {createKnowledgeArticle} from '@/lib/actions/knowledge'
import {fetchInitialContext, getContextTools} from '@/lib/sanity/context'
import {writeClient} from '@/lib/sanity/client'
import {sanityInsightsIntegration} from '@sanity/context/ai-sdk'
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from 'ai'
import {z} from 'zod'

export const maxDuration = 30

const AGENT_ID = 'knowledge-base-rag'

const ChatRequestSchema = z.object({
  id: z.string().optional(),
  messages: z.array(z.custom<UIMessage>()).min(1, 'At least one message is required.'),
})

function buildSystemPrompt(initialContext: string): string {
  return `${initialContext}

You are a helpful assistant acting as the user's second brain.

## Tool usage
- Use groq_query to search the knowledge base before answering questions.
- Prefer hybrid queries that combine text::semanticSimilarity() with keyword matching on title and content.
- Use schema_explorer if you need field details for knowledgeArticle documents.
- Use array_field_reader for long content on a specific document.

## Writing knowledge
- If the user shares personal facts unprompted, use addResource to store them as new knowledge articles.

## Response rules
- ONLY answer using information retrieved via tools.
- If nothing relevant is found, respond: "Sorry, I don't know."
- Keep responses short. One sentence when possible.`
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Unexpected chat error.'
}

export async function POST(req: Request) {
  let mcpClient: Awaited<ReturnType<typeof getContextTools>>['mcpClient'] | undefined

  try {
    const body = ChatRequestSchema.safeParse(await req.json())

    if (!body.success) {
      return Response.json(
        {
          error: 'Invalid chat request.',
          issues: body.error.flatten().fieldErrors,
        },
        {status: 400},
      )
    }

    const {messages, id: chatId} = body.data
    const threadId = chatId ?? crypto.randomUUID()
    const initialContext = await fetchInitialContext()
    const context = await getContextTools()
    mcpClient = context.mcpClient

    const result = streamText({
      model: 'openai/gpt-4o',
      system: buildSystemPrompt(initialContext),
      messages: await convertToModelMessages(messages),
      tools: {
        ...context.tools,
        addResource: tool({
          description: `Add a resource to the knowledge base in Sanity Content Lake.
If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
          inputSchema: z.object({
            content: z
              .string()
              .describe('The content or resource to add to the knowledge base'),
          }),
          execute: async ({content}) => createKnowledgeArticle({content}),
        }),
      },
      stopWhen: stepCountIs(10),
      experimental_telemetry: {
        isEnabled: true,
        integrations: [
          sanityInsightsIntegration({
            client: writeClient,
            agentId: AGENT_ID,
            threadId,
          }),
        ],
      },
      onFinish: async () => {
        await mcpClient?.close()
        mcpClient = undefined
      },
    })

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
    })
  } catch (error) {
    await mcpClient?.close()
    console.error('Chat route failed:', error)

    return Response.json(
      {
        error: getErrorMessage(error),
      },
      {status: 500},
    )
  }
}
