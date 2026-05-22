'use client'

import { Chat } from './chat'
import type { Message } from './chat'

interface ConsoleWrapperProps {
  sessionId?: string
  initialMessages?: Message[]
}

export function ConsoleWrapper({ sessionId, initialMessages }: ConsoleWrapperProps) {
  return (
    <div className="h-full flex flex-col">
      <Chat
        initialSessionId={sessionId}
        initialMessages={initialMessages}
      />
    </div>
  )
}
