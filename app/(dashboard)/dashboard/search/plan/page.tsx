import { getPlanSteps } from '@/app/actions/plan'
import { getApiKey } from '@/app/actions/api-key'
import { createClient } from '@/lib/supabase/server'
import { PlanWrapper } from '@/components/dashboard/plan/plan-wrapper'

export const dynamic = 'force-dynamic'

export default async function PlanPage() {
  const [steps, apiKey, supabase] = await Promise.all([
    getPlanSteps(),
    getApiKey(),
    createClient(),
  ])

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="h-full">
      <PlanWrapper
        initialSteps={steps}
        userId={user?.id ?? ''}
        apiKey={apiKey}
      />
    </div>
  )
}
