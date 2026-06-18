import {Loader2} from 'lucide-react'

export function LoadingIcon() {
  return <Loader2 className="h-4 w-4 animate-spin" />
}

export function SanityIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M7.03 4.72 2.4 7.38a1.2 1.2 0 0 0 0 2.08l4.63 2.66v5.32a1.2 1.2 0 0 0 1.8 1.04l4.17-2.41V9.12l4.63 2.66a1.2 1.2 0 0 0 1.8-1.04V4.72a1.2 1.2 0 0 0-1.8-1.04L12 6.09 8.83 3.68a1.2 1.2 0 0 0-1.8 1.04Z" />
    </svg>
  )
}

export function VercelIcon() {
  return (
    <svg viewBox="0 0 76 65" className="h-3 w-3" fill="currentColor" aria-hidden>
      <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
    </svg>
  )
}
