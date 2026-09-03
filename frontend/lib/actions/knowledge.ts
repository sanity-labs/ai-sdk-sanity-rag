import {writeClient} from '@/lib/sanity/client'

/**
 * Creates a `knowledgeArticle` from something the user explicitly asked the
 * chat to remember. Every document is stamped with `source: 'chat'` plus the
 * originating thread so user-submitted knowledge stays distinguishable from
 * seeded or Studio-authored content when it comes back through retrieval.
 *
 * @param content - The text the user asked to save.
 * @param threadId - The chat thread that requested the write.
 */
export async function createKnowledgeArticle({
  content,
  threadId,
}: {
  content: string
  threadId: string
}) {
  const trimmedContent = content.trim()

  if (trimmedContent.length < 10) {
    throw new Error('Knowledge article content must be at least 10 characters.')
  }

  const title = trimmedContent.slice(0, 80)

  if (title.length < 3) {
    throw new Error('Knowledge article title must be at least 3 characters.')
  }

  const document = await writeClient.create({
    _type: 'knowledgeArticle',
    title,
    content: trimmedContent,
    category: 'personal',
    source: 'chat',
    chatThreadId: threadId,
    submittedAt: new Date().toISOString(),
  })

  return {
    id: document._id,
    title: document.title,
    content: document.content,
    message: `Saved to the knowledge base as "${document.title}". Tell the user exactly what was stored.`,
  }
}
