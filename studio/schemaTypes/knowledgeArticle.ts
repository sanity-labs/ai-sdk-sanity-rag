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
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
    },
    prepare({title, category}) {
      return {
        title,
        subtitle: category ? `Category: ${category}` : undefined,
      }
    },
  },
})
