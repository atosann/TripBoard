'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface JoinRequestFormProps {
  postId: string
  onSuccess?: () => void
}

export function JoinRequestForm({ postId, onSuccess }: JoinRequestFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/posts/${postId}/join-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || '参加申請に失敗しました')
        return
      }

      setMessage('')
      setOpen(false)
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }

      alert('参加申請を送信しました')
    } catch (error) {
      console.error('参加申請エラー:', error)
      alert('参加申請に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">参加申請を送る</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>参加申請</DialogTitle>
            <DialogDescription>
              投稿者にメッセージを送って参加申請をしましょう
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <Textarea
              placeholder="自己紹介や参加したい理由を書いてください（任意）"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-sm text-muted-foreground mt-2">
              {message.length}/500文字
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              送信する
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}