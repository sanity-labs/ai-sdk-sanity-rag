import {Chat} from '@/components/chat'
import ProjectOverview from '@/components/project-overview'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 px-4 py-12">
      <ProjectOverview />
      <Chat />
    </main>
  )
}
