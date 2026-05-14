import { getApiKey } from '@/app/actions/api-key'
import { PracticeWrapper } from '@/components/dashboard/practice/practice-wrapper'

export default async function CasePracticePage() {
  const apiKey = await getApiKey()
  const hasApiKey = !!apiKey

  return <PracticeWrapper hasApiKey={hasApiKey} apiKey={apiKey} />
}
