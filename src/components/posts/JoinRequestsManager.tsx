'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { UserPlus, Loader2 } from 'lucide-react'
import type { ParticipantWithProfile } from '@/types/participant'

interface JoinRequestsManagerProps {
  postId: string
  isOwner: boolean
}

export function JoinRequestsManager({ postId, isOwner }: JoinRequestsManagerProps) {
  const router = useRouter()
  const [requests, setRequests] = useState<ParticipantWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: 'approve' | 'reject'
    participant: ParticipantWithProfile | null
  }>({
    open: false,
    action: 'approve',
    participant: null,
  })
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!isOwner) return
    
    fetchRequests()
    
    // リアルタイム更新の設定
    const channel = supabase
      .channel(`join-requests:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchRequests()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, isOwner])

  const fetchRequests = async () => {
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
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('参加申請取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (action: 'approve' | 'reject') => {
    const participant = confirmDialog.participant
    if (!participant) return

    setActioningId(participant.id)
    
    try {
      const response = await fetch(
        `/api/posts/${postId}/participants/${participant.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'エラーが発生しました')
        return
      }

      router.refresh()
      fetchRequests()
    } catch (error) {
      console.error('参加申請処理エラー:', error)
      alert('エラーが発生しました')
    } finally {
      setActioningId(null)
      setConfirmDialog({ open: false, action: 'approve', participant: null })
    }
  }

  if (!isOwner) return null

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            参加申請
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            参加申請
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            現在、参加申請はありません
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            参加申請 ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.profiles.avatar_url || undefined} />
                    <AvatarFallback>
                      {request.profiles.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {request.profiles.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {request.request_message && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">
                      {request.request_message}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        action: 'approve',
                        participant: request,
                      })
                    }
                    disabled={actioningId === request.id}
                  >
                    {actioningId === request.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      '承認する'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        action: 'reject',
                        participant: request,
                      })
                    }
                    disabled={actioningId === request.id}
                  >
                    拒否する
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'approve' ? '参加を承認' : '参加を拒否'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'approve'
                ? `${confirmDialog.participant?.profiles.username}さんの参加を承認しますか？承認すると、この方がグループチャットに参加できるようになります。`
                : `${confirmDialog.participant?.profiles.username}さんの参加を拒否しますか？この操作は取り消せません。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction(confirmDialog.action)}
              className={
                confirmDialog.action === 'reject' ? 'bg-destructive' : ''
              }
            >
              {confirmDialog.action === 'approve' ? '承認する' : '拒否する'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}