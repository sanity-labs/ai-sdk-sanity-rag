import {createClient} from 'next-sanity'
import {env} from '@/lib/env'

export const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-04-08',
  useCdn: false,
  token: env.SANITY_API_READ_TOKEN,
  requestTagPrefix: 'frontend.ai-sdk-sanity-rag',
})

export const writeClient = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-04-08',
  useCdn: false,
  token: env.SANITY_API_WRITE_TOKEN,
  requestTagPrefix: 'frontend.ai-sdk-sanity-rag.write',
})
