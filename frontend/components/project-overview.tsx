'use client'

import {motion} from 'framer-motion'
import Link from 'next/link'
import {SanityLogo, SanityMonogram} from '@sanity/logos'
import {VercelIcon} from './icons'

export default function ProjectOverview() {
  return (
    <motion.div
      className="my-4 w-full max-w-[600px]"
      initial={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -20}}
      transition={{duration: 0.5}}
    >
      <div className="flex items-center justify-between gap-4">
        <Link href="https://www.sanity.io" target="_blank" rel="noreferrer" aria-label="Sanity">
          <SanityLogo className="h-8 w-auto dark:hidden" />
          <SanityLogo dark className="hidden h-8 w-auto dark:block" />
        </Link>
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <VercelIcon />
          <span>+</span>
          <SanityMonogram className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
        The <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">useChat</code>{' '}
        hook and <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">streamText</code>{' '}
        function build a RAG chatbot powered by{' '}
        <Link
          href="https://www.sanity.io/docs/ai/sanity-context"
          className="underline underline-offset-4"
          target="_blank"
          rel="noreferrer"
        >
          Sanity Context
        </Link>
        . The agent queries your Content Lake via MCP tools (
        <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">groq_query</code>,{' '}
        <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">schema_explorer</code>
        ) with dataset embeddings for semantic search.
      </p>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Learn more in the{' '}
        <Link
          href="https://ai-sdk.dev/cookbook/guides/rag-chatbot"
          className="underline underline-offset-4"
          target="_blank"
          rel="noreferrer"
        >
          AI SDK RAG guide
        </Link>{' '}
        and{' '}
        <Link
          href="https://www.sanity.io/docs/content-lake/dataset-embeddings"
          className="underline underline-offset-4"
          target="_blank"
          rel="noreferrer"
        >
          Sanity dataset embeddings docs
        </Link>
        .
      </p>
    </motion.div>
  )
}
