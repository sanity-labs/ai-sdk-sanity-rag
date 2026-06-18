import {defineQuery} from 'next-sanity'

export const semanticSearchQuery = defineQuery(`
  *[_type == "knowledgeArticle" && !(_id in path("drafts.**"))]
    | score(
        boost([title, content] match text::query($query), 2),
        text::semanticSimilarity($query)
      )
    | order(_score desc)
    [0...$limit]
    {
      _id,
      title,
      content,
      category,
      _score,
      "fragments": _embeddings[].fragments
    }
`)

export const semanticOnlySearchQuery = defineQuery(`
  *[_type == "knowledgeArticle" && !(_id in path("drafts.**"))]
    | score(text::semanticSimilarity($query))
    | order(_score desc)
    [0...$limit]
    {
      _id,
      title,
      content,
      category,
      _score,
      "fragments": _embeddings[].fragments
    }
`)
