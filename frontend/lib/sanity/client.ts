import {createClient} from '@sanity/client'
import {env} from '@/lib/env'

export const readClient = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-04-08',
  token: env.SANITY_API_READ_TOKEN,
  useCdn: false,
  requestTagPrefix: 'frontend.ai-sdk-sanity-rag',
})

export const writeClient = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-04-08',
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  requestTagPrefix: 'frontend.ai-sdk-sanity-rag.write',
})
