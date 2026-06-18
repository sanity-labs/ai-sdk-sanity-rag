import {writeClient} from '@/lib/sanity/client'

export async function createKnowledgeArticle({content}: {content: string}) {
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
  })

  return {
    id: document._id,
    title: document.title,
    message: 'Knowledge article added to your Content Lake.',
  }
}
