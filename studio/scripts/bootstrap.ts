/**
 * Bootstrap the project after configuring `studio/.env`.
 *
 * 1. Deploy schema to the Content Lake (includes @sanity/context types)
 * 2. Import seed knowledge articles + Sanity Context document
 * 3. Enable dataset embeddings for semantic search
 *
 * Usage: pnpm bootstrap
 */

import {execFileSync} from 'node:child_process'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-04-08'})
const {dataset} = client.config()

const EMBEDDINGS_PROJECTION = `{
  _type == "knowledgeArticle" => {
    title,
    content,
    category
  }
}`

function run(cmd: string, args: string[]) {
  execFileSync(cmd, args, {stdio: 'inherit'})
}

function sanity(...args: string[]) {
  run('pnpm', ['exec', 'sanity', ...args])
}

function heading(label: string) {
  console.log(`\n── ${label} ${'─'.repeat(60 - label.length)}`)
}

heading('Deploy schema')
sanity('schema', 'deploy')

heading('Import seed data')
sanity('dataset', 'import', 'seed/data.ndjson', dataset!, '--missing')

heading('Enable dataset embeddings')
console.log('Projection:', EMBEDDINGS_PROJECTION)
try {
  sanity(
    'datasets',
    'embeddings',
    'enable',
    dataset!,
    '--projection',
    EMBEDDINGS_PROJECTION,
  )
} catch (error) {
  console.warn('Could not enable dataset embeddings. They may already be enabled.')
  console.warn(error)
}

heading('Check embeddings status')
sanity('datasets', 'embeddings', 'status', dataset!)

console.log('\nBootstrap complete. Embeddings may take a few minutes to become ready.')
console.log(`Run \`pnpm --filter studio exec sanity datasets embeddings status ${dataset}\` to check progress.`)
