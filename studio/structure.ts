import {CONTEXT_SCHEMA_TYPE_NAME} from '@sanity/context/studio'
import {CommentIcon, DocumentTextIcon} from '@sanity/icons'
import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Knowledge Base')
    .items([
      S.listItem()
        .title('Knowledge Articles')
        .icon(DocumentTextIcon)
        .child(S.documentTypeList('knowledgeArticle').title('Knowledge Articles')),
      // Everything the chat's addResource tool wrote, so it can be reviewed or removed.
      S.listItem()
        .title('Chat submissions')
        .icon(CommentIcon)
        .child(
          S.documentList()
            .title('Chat submissions')
            .apiVersion('2026-04-08')
            .filter('_type == "knowledgeArticle" && source == "chat"')
            .defaultOrdering([{field: 'submittedAt', direction: 'desc'}]),
        ),
      S.divider(),
      S.documentTypeListItem(CONTEXT_SCHEMA_TYPE_NAME).title('Sanity Context'),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== 'knowledgeArticle' && item.getId() !== CONTEXT_SCHEMA_TYPE_NAME,
      ),
    ])
