'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import type { ParticipantWithProfile } from '@/types/participant'

interface ParticipantsListProps {
  postId: string
}

export function ParticipantsList({ postId }: ParticipantsListProps) {
  const [participants, setParticipants] = useState<ParticipantWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchParticipants()
    
    // リアルタイム更新の設定
    const channel = supabase
      .channel(`participants:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchParticipants()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId])

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select(`
          *,
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .eq('status', 'joined')
        .order('created_at', { ascending: true })

      if (error) throw error
      setParticipants(data || [])
    } catch (error) {
      console.error('参加者取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            参加メンバー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          参加メンバー ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            まだ参加メンバーがいません
          </p>
        ) : (
          <div className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={participant.profiles.avatar_url || undefined} />
                  <AvatarFallback>
                    {participant.profiles.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {participant.profiles.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(participant.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}