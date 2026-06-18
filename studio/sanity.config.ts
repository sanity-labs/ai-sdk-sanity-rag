import {contextPlugin} from '@sanity/context/studio'
import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

if (!projectId) {
  throw new Error('Missing SANITY_STUDIO_PROJECT_ID. Copy studio/.env.example to studio/.env.')
}

export default defineConfig({
  name: 'default',
  title: 'Knowledge Base',

  projectId,
  dataset,

  plugins: [structureTool({structure}), visionTool(), contextPlugin()],

  schema: {
    types: schemaTypes,
  },
})
