import { getPlanSteps } from '@/app/actions/plan'
import { createClient } from '@/lib/supabase/server'
import { PlanWrapper } from '@/components/dashboard/plan/plan-wrapper'

export const dynamic = 'force-dynamic'

export default async function PlanPage() {
  const [steps, supabase] = await Promise.all([
    getPlanSteps(),
    createClient(),
  ])

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="h-full">
      <PlanWrapper
        initialSteps={steps}
        userId={user?.id ?? ''}
      />
    </div>
  )
}
