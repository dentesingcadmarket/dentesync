export type SubscriptionTier = 'm1' | 'm2' | 'm3'
export type SubscriptionStatus = 'active' | 'inactive' | 'trial'
export type CaseStatus = 'open' | 'in_progress' | 'completed' | 'archived'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type PlanStepStatus = 'pending' | 'in_progress' | 'completed'

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  stripe_customer_id: string | null
  created_at: string
}

export interface Case {
  id: string
  user_id: string
  title: string
  description: string | null
  status: CaseStatus
  stl_file_url: string | null
  attachments: unknown[]
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ErrorAnalysis {
  id: string
  case_id: string
  user_id: string
  error_description: string
  ai_analysis: string | null
  roadmap_impact: string | null
  severity: Severity
  created_at: string
}

export interface PlanStep {
  id: string
  user_id: string
  step_number: number | null
  title: string
  description: string | null
  status: PlanStepStatus
  ai_generated: boolean
  parent_step_id: string | null
  created_at: string
}

export interface PracticeSession {
  id: string
  user_id: string
  case_data: unknown
  user_answers: Record<string, unknown>
  ai_feedback: string | null
  score: number | null
  completed: boolean
  created_at: string
}

export interface CommunityPost {
  id: string
  user_id: string
  content: string | null
  image_url: string | null
  likes: number
  created_at: string
  profiles?: Pick<Profile, 'username' | 'full_name' | 'avatar_url'>
}

export interface CommunityComment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: Pick<Profile, 'username' | 'full_name' | 'avatar_url'>
}

export interface News {
  id: string
  title: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  published_at: string | null
  is_published: boolean
  author_id: string | null
}

export interface StoreProduct {
  id: string
  name: string
  description: string | null
  price: number
  image_urls: string[]
  stripe_price_id: string | null
  stock: number | null
  category: string | null
  is_active: boolean
}

export interface ConsoleSession {
  id: string
  user_id: string
  messages: unknown[]
  files: unknown[]
  created_at: string
  updated_at: string
}

export type CaseInsert = Omit<Case, 'id' | 'created_at' | 'updated_at'> & { id?: string }
export type CaseUpdate = Partial<Omit<Case, 'id' | 'user_id' | 'created_at'>>

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      cases: { Row: Case; Insert: CaseInsert; Update: CaseUpdate }
      error_analyses: { Row: ErrorAnalysis; Insert: Partial<ErrorAnalysis>; Update: Partial<ErrorAnalysis> }
      plan_steps: { Row: PlanStep; Insert: Partial<PlanStep>; Update: Partial<PlanStep> }
      practice_sessions: { Row: PracticeSession; Insert: Partial<PracticeSession>; Update: Partial<PracticeSession> }
      community_posts: { Row: CommunityPost; Insert: Partial<CommunityPost>; Update: Partial<CommunityPost> }
      community_comments: { Row: CommunityComment; Insert: Partial<CommunityComment>; Update: Partial<CommunityComment> }
      news: { Row: News; Insert: Partial<News>; Update: Partial<News> }
      store_products: { Row: StoreProduct; Insert: Partial<StoreProduct>; Update: Partial<StoreProduct> }
      console_sessions: { Row: ConsoleSession; Insert: Partial<ConsoleSession>; Update: Partial<ConsoleSession> }
    }
  }
}
