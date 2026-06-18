import {createMCPClient} from '@ai-sdk/mcp'
import {env} from '@/lib/env'

const API_VERSION = '2026-04-08'

export function getContextMcpUrl() {
  const url = new URL(
    `https://api.sanity.io/v${API_VERSION}/context/mcp/${env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${env.NEXT_PUBLIC_SANITY_DATASET}/${env.SANITY_CONTEXT_SLUG}`,
  )
  url.searchParams.set('embeddings', 'true')
  return url.toString()
}

export function getInitialContextUrl() {
  const url = new URL(getContextMcpUrl())
  url.pathname = `${url.pathname}/initial-context`
  return url.toString()
}

export async function fetchInitialContext(): Promise<string> {
  const response = await fetch(getInitialContextUrl(), {
    headers: {
      Authorization: `Bearer ${env.SANITY_API_READ_TOKEN}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Sanity Context initial context (${response.status}). Is the context document published?`,
    )
  }

  return response.text()
}

export async function createContextMcpClient() {
  return createMCPClient({
    transport: {
      type: 'http',
      url: getContextMcpUrl(),
      headers: {
        Authorization: `Bearer ${env.SANITY_API_READ_TOKEN}`,
      },
    },
  })
}

/** MCP tools minus initial_context — injected via system prompt instead. */
export async function getContextTools() {
  const mcpClient = await createContextMcpClient()

  try {
    const allTools = await mcpClient.tools()
    const {initial_context: _initialContext, ...tools} = allTools
    return {mcpClient, tools}
  } catch (error) {
    await mcpClient.close()
    throw error
  }
}
