// データベース型定義
export interface User {
  id: string;
  display_name: string;
  bio?: string;
  area?: string;
  trust_score: number;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  created_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  category_id?: string;
  title: string;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  blurred_latitude?: number;
  blurred_longitude?: number;
  event_date: string;
  max_participants: number;
  status: 'open' | 'closed' | 'cancelled';
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  // リレーション
  author?: User;
  category?: Category;
  participants?: Participant[];
  participant_count?: number;
}

export interface Participant {
  id: string;
  post_id: string;
  user_id: string;
  status: 'joined' | 'left' | 'kicked';
  joined_at: string;
  // リレーション
  user?: User;
}

export interface Message {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  is_system: boolean;
  created_at: string;
  // リレーション
  user?: User;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: 'post' | 'message' | 'user';
  target_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at?: string;
}

// フォーム型定義
export interface PostFormData {
  title: string;
  description: string;
  category_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  event_date: string;
  max_participants: number;
}

export interface ProfileFormData {
  display_name: string;
  bio?: string;
  area?: string;
}

export interface ReportFormData {
  target_type: 'post' | 'message' | 'user';
  target_id: string;
  reason: string;
  description?: string;
}

// API レスポンス型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
