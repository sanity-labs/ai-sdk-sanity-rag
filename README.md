# Vercel AI SDK + Sanity Content Lake RAG Starter

A retrieval-augmented generation (RAG) chatbot powered by the [Vercel AI SDK](https://ai-sdk.dev), [Sanity Context](https://www.sanity.io/docs/ai/sanity-context), and [dataset embeddings](https://www.sanity.io/docs/content-lake/dataset-embeddings). Based on the popular [AI SDK RAG template](https://github.com/vercel-labs/ai-sdk-preview-rag), but retrieves knowledge through Sanity Context MCP tools instead of a custom Postgres vector store.

## What's included

- **Next.js 16** chat UI with `useChat` and streaming responses
- **Sanity Context MCP** — `groq_query`, `schema_explorer`, and `array_field_reader` tools scoped by a Studio document
- **Dataset embeddings** — semantic search via GROQ `text::semanticSimilarity()` inside agent queries
- **Sanity Studio** — manage knowledge articles and configure the agent's context (instructions, content filter)
- **Conversation insights** — optional telemetry via `@sanity/context/ai-sdk`
- **Write path** — `addResource` tool creates new `knowledgeArticle` documents (Context is read-only)

## Architecture

```
User → Next.js Chat UI → /api/chat (streamText)
                              ↓
                    Sanity Context MCP (groq_query, schema_explorer, …)
                              ↓
                    Content Lake (knowledgeArticle + embeddings)
                              ↑
                    addResource → create document (custom tool)
                              ↑
                    Sanity Studio (content + Sanity Context config)
```

Unlike the Postgres-based AI SDK RAG starter, vectors live in Sanity. Unlike a fully custom GROQ layer, retrieval is schema-aware and configurable in Studio without code changes.

## Prerequisites

- Node.js 20.19+ or 22.12+
- pnpm 10+
- A Sanity account ([sanity.io](https://www.sanity.io))
- A Vercel AI Gateway API key ([vercel.com/dashboard/ai-gateway](https://vercel.com/dashboard/ai-gateway))

Dataset embeddings require a Sanity plan that includes the feature. See [Sanity pricing](https://www.sanity.io/pricing).

## Getting Started

### 1. Install

```bash
git clone https://github.com/sanity-labs/ai-sdk-sanity-rag.git
cd ai-sdk-sanity-rag
pnpm install
```

### 2. Create a Sanity project

Create a project at [sanity.io/manage](https://www.sanity.io/manage), then copy the same project ID and dataset into both environment files. The Studio and frontend must point at the same Content Lake.

```bash
cp studio/.env.example studio/.env
cp frontend/.env.example frontend/.env.local
```

**Studio (`studio/.env`)**

| Variable | Description |
| --- | --- |
| `SANITY_STUDIO_PROJECT_ID` | Your Sanity project ID |
| `SANITY_STUDIO_DATASET` | Dataset name, usually `production` |

**Frontend (`frontend/.env.local`)**

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Same as `SANITY_STUDIO_PROJECT_ID` |
| `NEXT_PUBLIC_SANITY_DATASET` | Same as `SANITY_STUDIO_DATASET` |
| `SANITY_API_READ_TOKEN` | API token with Viewer role for MCP and initial context |
| `SANITY_API_WRITE_TOKEN` | API token with Editor role for `addResource` and insights |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway key |
| `SANITY_CONTEXT_SLUG` | Context document slug, defaults to `knowledge-base` |

Create API tokens at [sanity.io/manage](https://www.sanity.io/manage) → your project → **API** → **Tokens**. Keep both tokens server-only. Do not prefix them with `NEXT_PUBLIC_`.

Create an AI Gateway key at [vercel.com/dashboard/ai-gateway](https://vercel.com/dashboard/ai-gateway).

### 3. Log in to the Sanity CLI

Bootstrap uses your Sanity CLI session to deploy schema and import seed content. This is separate from the API tokens used by the frontend.

```bash
pnpm --filter studio exec sanity login
```

For CI or other non-interactive environments, use a Sanity auth token with schema deploy and dataset import permissions.

### 4. Bootstrap

Deploy schema, import seed articles + Sanity Context document, and enable embeddings:

```bash
pnpm bootstrap
```

Embeddings generation may take a few minutes:

```bash
pnpm --filter studio exec sanity datasets embeddings status <your-dataset>
```

For the default dataset:

```bash
pnpm --filter studio exec sanity datasets embeddings status production
```

### 5. Start development

```bash
pnpm dev
```

- Chat UI: [http://localhost:3000](http://localhost:3000)
- Sanity Studio: [http://localhost:3333](http://localhost:3333)

## Sanity Context

The seed data includes a **Sanity Context** document (`knowledge-base`) that:

- Scopes the agent to `_type == "knowledgeArticle"`
- Provides instructions for hybrid semantic + keyword search
- Exposes an MCP endpoint the chat route connects to via `@ai-sdk/mcp`

Edit the document in Studio under **Sanity Context** to change agent behavior without touching code. The MCP URL is shown on the document form.

Initial context is fetched from `/initial-context` and injected into the system prompt (saving a tool call per conversation).

## Try it out

Ask questions the seed data can answer:

- "What's my favorite coffee order?"
- "What should I check before deploying?"
- "Where do I like to hike on weekends?"

Teach the bot something new:

- "My dog's name is Pixel and he loves tennis balls."

The `addResource` tool stores it as a `knowledgeArticle`. After embeddings reindex (usually under a minute), ask about it.

## Deploy

### Frontend on Vercel

Create a Vercel project from this repository and set the **Root Directory** to `frontend`.

Required environment variables:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`
- `SANITY_API_WRITE_TOKEN`
- `AI_GATEWAY_API_KEY`
- `SANITY_CONTEXT_SLUG`

This starter uses the Vercel AI Gateway model string `openai/gpt-4o`. The AI SDK reads `AI_GATEWAY_API_KEY` from the environment.

For a deploy button, include the frontend root directory:

```text
https://vercel.com/new/clone?repository-url=https://github.com/sanity-labs/ai-sdk-sanity-rag&root-directory=frontend
```

### Sanity Studio

You can run Studio locally with `pnpm --filter studio dev`, or deploy it with:

```bash
pnpm --filter studio deploy
```

Before deploying Studio, update `studioHost` in `studio/sanity.cli.ts` if you want a custom hosted Studio URL.

### Production safety

The chat route is intentionally open for local demos. In production, add authentication and rate limiting before exposing it publicly. Without those controls, anyone who can call `/api/chat` can spend AI Gateway credits and use the write token through the `addResource` tool.

Conversation insights are enabled in `frontend/app/api/chat/route.ts` through `experimental_telemetry`. Remove that block if you do not want to write conversation insights to Sanity.

## Project structure

```
ai-sdk-sanity-rag/
├── frontend/
│   ├── app/api/chat/         # streamText + Sanity Context MCP + addResource
│   ├── components/           # Chat UI
│   └── lib/sanity/
│       ├── context.ts        # MCP client + initial context fetch
│       └── client.ts         # Sanity read/write clients
├── studio/
│   ├── schemaTypes/          # knowledgeArticle schema
│   ├── seed/                 # Articles + sanity.agentContext document
│   └── scripts/bootstrap.ts
└── packages/tsconfig/
```

## Customization

### Change what the agent can see

Edit the **Sanity Context** document in Studio — update `instructions` or `groqFilter`. No deploy needed for instruction changes; republish the document.

### Change the content model

Edit `studio/schemaTypes/knowledgeArticle.ts`, update the context document's `groqFilter`, and adjust the embeddings projection in `studio/scripts/bootstrap.ts`.

### Disable conversation insights

Remove `experimental_telemetry` from `frontend/app/api/chat/route.ts`, or disable in Studio:

```typescript
contextPlugin({insights: {enabled: false}})
```

## Template Notes

This repository is structured to work as both a Vercel starter and a Sanity template candidate:

- The deployable Next.js app lives in `frontend`.
- The Sanity Studio lives in `studio`.
- The README includes this `## Getting Started` section for Sanity template validation.
- Sanity template submissions require a public GitHub repository and a 1200×750 screenshot or preview image.

Before submitting to a template gallery, run:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

## Troubleshooting

### `sanity: command not found`

Use the package-local CLI:

```bash
pnpm --filter studio exec sanity <command>
```

### Studio shows `Failed to fetch dynamically imported module`

This is usually a stale Vite dependency URL after changing dependencies. Stop dev servers, restart `pnpm dev`, then hard-refresh Studio with `Cmd+Shift+R`.

### Next.js dev server uses webpack

`frontend` runs `next dev --webpack` because Next.js 16.2 + Turbopack can infer the wrong project root in this pnpm workspace. Production builds still use the normal Next.js build pipeline.

### Embeddings are not ready yet

Check status:

```bash
pnpm --filter studio exec sanity datasets embeddings status <your-dataset>
```

If status is still indexing, wait a few minutes and try again.

## Learn more

- [Sanity Context](https://www.sanity.io/docs/ai/sanity-context)
- [Sanity Context insights](https://www.sanity.io/docs/ai/sanity-context-insights)
- [AI SDK RAG chatbot guide](https://ai-sdk.dev/cookbook/guides/rag-chatbot)
- [Dataset embeddings](https://www.sanity.io/docs/content-lake/dataset-embeddings)

## License

MIT
