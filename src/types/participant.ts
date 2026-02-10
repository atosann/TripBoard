// 参加者のステータス型
export type ParticipantStatus = 'pending' | 'joined' | 'left' | 'kicked' | 'rejected'

// 参加者型
export interface Participant {
  id: string
  post_id: string
  user_id: string
  status: ParticipantStatus
  request_message?: string | null
  reviewed_at?: string | null
  created_at: string
  updated_at: string
}

// プロフィール情報を含む参加者型
export interface ParticipantWithProfile extends Participant {
  profiles: {
    id: string
    username: string
    avatar_url?: string | null
  }
}