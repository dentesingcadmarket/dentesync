'use client'

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { addPlanStep } from '@/app/actions/plan'
import { PlanChat } from './plan-chat'
import { PlanBoard } from './plan-board'
import type { PlanStep } from '@/app/actions/plan'

interface NextStepTrigger {
  completedTitle: string
  nextNumber: number
  timestamp: number
}

interface PlanWrapperProps {
  initialSteps: PlanStep[]
  userId: string
  apiKey: string | null
}

export function PlanWrapper({ initialSteps, userId, apiKey }: PlanWrapperProps) {
  const [steps, setSteps] = useState<PlanStep[]>(initialSteps)
  const [nextStepTrigger, setNextStepTrigger] = useState<NextStepTrigger | null>(null)
  const supabase = createClient()

  // Supabase Realtime subscription for live step updates
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = (supabase as any)
      .channel('plan-steps-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'plan_steps',
          filter: `user_id=eq.${userId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setSteps(prev =>
              [...prev, payload.new as PlanStep].sort((a, b) => a.step_number - b.step_number)
            )
          } else if (payload.eventType === 'UPDATE') {
            setSteps(prev =>
              prev.map(s => (s.id === payload.new.id ? (payload.new as PlanStep) : s))
            )
          } else if (payload.eventType === 'DELETE') {
            setSteps(prev => prev.filter(s => s.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(supabase as any).removeChannel(channel)
    }
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStepGenerated = useCallback(
    async (stepData: { title: string; description: string }) => {
      const nextNumber = steps.length + 1
      const result = await addPlanStep(stepData.title, stepData.description, nextNumber)
      if (result.error) {
        toast.error(result.error)
      }
    },
    [steps.length]
  )

  const handleStepCompleted = useCallback(
    (completedTitle: string) => {
      setNextStepTrigger({
        completedTitle,
        nextNumber: steps.filter(s => s.status === 'completed').length + 2,
        timestamp: Date.now(),
      })
    },
    [steps]
  )

  const handleClearPlan = useCallback(() => {
    setSteps([])
  }, [])

  return (
    <div className="h-full flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-[rgba(255,255,255,0.07)]">
      {/* Sol: AI Sohbet */}
      <div className="flex-1 min-h-0 min-w-0">
        <PlanChat
          apiKey={apiKey}
          steps={steps}
          nextStepTrigger={nextStepTrigger}
          onStepGenerated={handleStepGenerated}
        />
      </div>

      {/* Sağ: Plan Board */}
      <div className="lg:w-[400px] shrink-0 min-h-0">
        <PlanBoard
          steps={steps}
          onStepCompleted={handleStepCompleted}
          onClearPlan={handleClearPlan}
        />
      </div>
    </div>
  )
}
