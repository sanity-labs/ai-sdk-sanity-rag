import {CONTEXT_SCHEMA_TYPE_NAME} from '@sanity/context/studio'
import {DocumentTextIcon} from '@sanity/icons'
import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Knowledge Base')
    .items([
      S.listItem()
        .title('Knowledge Articles')
        .icon(DocumentTextIcon)
        .child(S.documentTypeList('knowledgeArticle').title('Knowledge Articles')),
      S.divider(),
      S.documentTypeListItem(CONTEXT_SCHEMA_TYPE_NAME).title('Sanity Context'),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== 'knowledgeArticle' && item.getId() !== CONTEXT_SCHEMA_TYPE_NAME,
      ),
    ])
