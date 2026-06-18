'use client'

import {Input} from '@/components/ui/input'
import {LoadingIcon} from '@/components/icons'
import {cn} from '@/lib/utils'
import {useChat} from '@ai-sdk/react'
import {getToolName, isToolUIPart, lastAssistantMessageIsCompleteWithToolCalls, type UIMessage} from 'ai'
import {AnimatePresence, motion} from 'framer-motion'
import {useEffect, useMemo, useState} from 'react'
import {toast} from 'sonner'
import {Streamdown} from 'streamdown'

export function Chat() {
  const [chatId] = useState(() => crypto.randomUUID())

  const {messages, status, sendMessage} = useChat({
    id: chatId,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onError: () => {
      toast.error('Something went wrong. Check your API keys and try again.')
    },
  })

  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (messages.length > 0) setIsExpanded(true)
  }, [messages])

  const currentToolCall = useMemo(() => {
    const lastAssistant = [...messages].reverse().find((message) => message.role === 'assistant')
    if (!lastAssistant) return undefined

    const pendingPart = [...lastAssistant.parts].reverse().find((part) => {
      if (part.type === 'dynamic-tool') {
        return part.state !== 'output-available' && part.state !== 'output-error'
      }

      if (!isToolUIPart(part)) return false

      const toolPart = part as {state?: string}
      return toolPart.state !== 'output-available' && toolPart.state !== 'output-error'
    })

    if (!pendingPart) return undefined
    if (pendingPart.type === 'dynamic-tool') return pendingPart.toolName
    if (isToolUIPart(pendingPart)) return getToolName(pendingPart)
    return undefined
  }, [messages])

  const isAwaitingResponse =
    status === 'submitted' || status === 'streaming' || currentToolCall != null

  const [showLoading, setShowLoading] = useState(isAwaitingResponse)

  useEffect(() => {
    if (isAwaitingResponse) {
      setShowLoading(true)
      return
    }

    const timeout = setTimeout(() => setShowLoading(false), 120)
    return () => clearTimeout(timeout)
  }, [isAwaitingResponse])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (input.trim() === '') return
    sendMessage({text: input})
    setInput('')
  }

  const userQuery = messages.filter((message) => message.role === 'user').slice(-1)[0]
  const lastAssistantMessage = messages.filter((message) => message.role !== 'user').slice(-1)[0]

  return (
    <div className="w-full">
      <motion.div
        animate={{
          minHeight: isExpanded ? 200 : 0,
          padding: isExpanded ? 12 : 0,
        }}
        transition={{type: 'spring', bounce: 0.5}}
        className={cn(
          'w-full rounded-lg',
          isExpanded ? 'bg-neutral-200 dark:bg-neutral-800' : 'bg-transparent',
        )}
      >
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about your knowledge base..."
          />
        </form>

        <motion.div transition={{type: 'spring'}} className="mt-4 flex min-h-fit flex-col gap-2">
          <AnimatePresence mode="wait">
            {showLoading ? (
              <Loading tool={currentToolCall} userQuery={userQuery} />
            ) : lastAssistantMessage ? (
              <AssistantMessage message={lastAssistantMessage} userQuery={userQuery} />
            ) : null}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}

function AssistantMessage({
  message,
  userQuery,
}: {
  message: UIMessage
  userQuery?: UIMessage
}) {
  const text = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join(' ')

  const question = userQuery?.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join(' ')

  return (
    <motion.div
      key={message.id}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      className="space-y-3"
    >
      {question ? (
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{question}</p>
      ) : null}
      <div className="overflow-hidden whitespace-pre-wrap font-mono text-sm text-neutral-800 dark:text-neutral-200">
        <Streamdown>{text}</Streamdown>
      </div>
    </motion.div>
  )
}

function Loading({tool, userQuery}: {tool?: string; userQuery?: UIMessage}) {
  const toolName =
    tool === 'groq_query'
      ? 'Searching Content Lake'
      : tool === 'schema_explorer'
        ? 'Exploring schema'
        : tool === 'array_field_reader'
          ? 'Reading document'
          : tool === 'addResource'
            ? 'Adding to knowledge base'
            : 'Thinking'

  const question = userQuery?.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join(' ')

  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={{type: 'spring'}}
      className="flex items-center gap-3 overflow-hidden"
    >
      <LoadingIcon />
      <div className="space-y-1">
        {question ? (
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{question}</p>
        ) : null}
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{toolName}...</p>
      </div>
    </motion.div>
  )
}
