export type SubscriptionTier = 'm1' | 'm2' | 'm3'
export type SubscriptionStatus = 'active' | 'inactive' | 'trial'
export type CaseStatus = 'open' | 'in_progress' | 'completed' | 'archived'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type PlanStepStatus = 'pending' | 'in_progress' | 'completed'
export type PostType =
  | 'consultation'
  | 'error_solution'
  | 'material_review'
  | 'step_by_step'
  | 'showcase'
  | 'critique_request'

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  cover_url: string | null
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  stripe_customer_id: string | null
  is_admin: boolean
  created_at: string
  followers_count: number
  following_count: number
  posts_count: number
  specialty: string | null
  experience_years: number | null
  technical_score: number
  solution_score: number
  teaching_score: number
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Hashtag {
  id: string
  name: string
  post_count: number
  created_at: string
}

export interface PostHashtag {
  post_id: string
  hashtag_id: string
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'reply'

export interface Notification {
  id: string
  user_id: string
  actor_id: string
  type: NotificationType
  post_id: string | null
  read: boolean
  created_at: string
  actor?: Pick<Profile, 'username' | 'full_name' | 'avatar_url'>
  post?: Pick<CommunityPost, 'content' | 'image_url'>
}

export interface SavedPost {
  user_id: string
  post_id: string
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
  comment_count: number
  created_at: string
  post_type: PostType
  title: string | null
  metadata: Record<string, unknown> | null
  profiles?: Pick<Profile, 'username' | 'full_name' | 'avatar_url' | 'subscription_tier'>
}

export interface CommunityComment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  helpful_count: number
  is_best_answer: boolean
  technical_note: string | null
  suggestion: string | null
  profiles?: Pick<Profile, 'username' | 'full_name' | 'avatar_url'>
}

export interface UserBadge {
  id: string
  user_id: string
  badge_key: string
  badge_label: string
  earned_at: string
}

export interface ActiveMember {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  specialty: string | null
  activity_count: number
}

export const BADGE_DEFINITIONS = [
  { key: 'ilk_adim', label: 'İlk Adım', description: 'İlk gönderi paylaşımı', color: 'bg-primary/15 text-primary border-primary/30' },
  { key: 'aktif_uye', label: 'Aktif Üye', description: '10+ gönderi', color: 'bg-primary/20 text-primary border-primary/40' },
  { key: 'cozum_uretici', label: 'Çözüm Üretici', description: '10+ en iyi yanıt', color: 'bg-primary/25 text-primary border-primary/50' },
  { key: 'guvenilir_kaynak', label: 'Güvenilir Kaynak', description: 'Yanıtların %70+ yardımcı', color: 'bg-white/[0.06] text-cloud-white border-white/15' },
  { key: 'zirkonyum_uzmani', label: 'Zirkonyum Uzmanı', description: '20+ #zirkonyum post', color: 'bg-white/[0.08] text-cloud-white border-white/20' },
  { key: 'implant_uzmani', label: 'İmplant Uzmanı', description: '20+ #implant post', color: 'bg-white/[0.08] text-cloud-white border-white/20' },
  { key: 'hata_avcisi', label: 'Hata Avcısı', description: '10+ hata çözümü paylaşımı', color: 'bg-anchor-graphite/30 text-cloud-white border-anchor-graphite/50' },
  { key: 'surec_ustasi', label: 'Süreç Ustası', description: '5+ step-by-step paylaşımı', color: 'bg-primary/20 text-primary border-primary/40' },
] as const

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
  created_at?: string
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
      follows: { Row: Follow; Insert: Partial<Follow>; Update: Partial<Follow> }
      hashtags: { Row: Hashtag; Insert: Partial<Hashtag>; Update: Partial<Hashtag> }
      post_hashtags: { Row: PostHashtag; Insert: PostHashtag; Update: PostHashtag }
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> }
      saved_posts: { Row: SavedPost; Insert: SavedPost; Update: SavedPost }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user_badges: { Row: UserBadge; Insert: Partial<UserBadge>; Update: Partial<UserBadge> }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      comment_helpful_votes: { Row: any; Insert: any; Update: any }
    }
  }
}
