import { getApiKey } from '@/app/actions/api-key'
import { createClient } from '@/lib/supabase/server'
import { ConsoleWrapper } from '@/components/console/console-wrapper'
import type { Message } from '@/components/console/chat'

export const dynamic = 'force-dynamic'

export default async function ConsolePage() {
  const [apiKey, supabase] = await Promise.all([
    getApiKey(),
    createClient(),
  ])

  const { data: { user } } = await supabase.auth.getUser()

  let sessionId: string | undefined
  let initialMessages: Message[] = []

  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('console_sessions')
      .select('id, messages')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      sessionId = data.id
      initialMessages = data.messages ?? []
    }
  }

  return (
    <div className="h-full relative">
      <ConsoleWrapper
        initialApiKey={apiKey}
        sessionId={sessionId}
        initialMessages={initialMessages}
      />
    </div>
  )
}
