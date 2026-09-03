import {defineField, defineType} from 'sanity'

export const knowledgeArticle = defineType({
  name: 'knowledgeArticle',
  title: 'Knowledge Article',
  type: 'document',
  icon: () => '📚',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().min(3).max(200),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'text',
      rows: 12,
      description: 'Plain text knowledge the chatbot can retrieve and cite.',
      validation: (rule) => rule.required().min(10),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Personal', value: 'personal'},
          {title: 'Work', value: 'work'},
          {title: 'Reference', value: 'reference'},
        ],
      },
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      description:
        'Where this article came from. The chat sets "chat" on everything its addResource tool creates so user-submitted knowledge stays distinguishable from curated content.',
      options: {
        list: [
          {title: 'Studio', value: 'studio'},
          {title: 'Seed data', value: 'seed'},
          {title: 'Chat (addResource)', value: 'chat'},
        ],
        layout: 'radio',
      },
      initialValue: 'studio',
    }),
    defineField({
      name: 'chatThreadId',
      title: 'Chat thread',
      type: 'string',
      description: 'The chat thread that asked to save this article.',
      readOnly: true,
      hidden: ({document}) => document?.source !== 'chat',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted at',
      type: 'datetime',
      readOnly: true,
      hidden: ({document}) => document?.source !== 'chat',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      source: 'source',
    },
    prepare({title, category, source}) {
      const details = [
        category ? `Category: ${category}` : undefined,
        source === 'chat' ? 'Added via chat' : undefined,
      ].filter(Boolean)

      return {
        title,
        subtitle: details.length > 0 ? details.join(' · ') : undefined,
      }
    },
  },
})
