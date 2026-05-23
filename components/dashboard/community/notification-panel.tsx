'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/lib/supabase/types'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'şimdi'
  if (m < 60) return `${m}dk önce`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}sa önce`
  return `${Math.floor(h / 24)}g önce`
}

function notifIcon(type: string) {
  switch (type) {
    case 'like': return <Heart className="w-3.5 h-3.5 text-anchor-graphite fill-anchor-graphite" />
    case 'comment': return <MessageCircle className="w-3.5 h-3.5 text-[#2dd4bf]" />
    case 'follow': return <UserPlus className="w-3.5 h-3.5 text-primary" />
    case 'mention': return <AtSign className="w-3.5 h-3.5 text-muted-silver" />
    default: return <Bell className="w-3.5 h-3.5 text-[#999999]" />
  }
}

function notifText(n: Notification) {
  const actor = n.actor?.username || n.actor?.full_name || 'Biri'
  switch (n.type) {
    case 'like': return `@${actor} gönderini beğendi`
    case 'comment': return `@${actor} gönderine yorum yaptı`
    case 'follow': return `@${actor} seni takip etmeye başladı`
    case 'mention': return `@${actor} senden bahsetti`
    case 'reply': return `@${actor} yorumuna yanıt verdi`
    default: return `@${actor} bir işlem yaptı`
  }
}

interface Props {
  currentUserId: string
  initialUnreadCount?: number
}

export function NotificationPanel({ currentUserId, initialUnreadCount = 0 }: Props) {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  // Click outside to close
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Realtime subscription for new notifications
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = (supabase as any)
      .channel('notifications_' + currentUserId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload: { new: Notification }) => {
          setUnreadCount(prev => prev + 1)
          setNotifications(prev => [payload.new, ...prev])
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  async function handleOpen() {
    setOpen(prev => !prev)
    if (!open) {
      setLoading(true)
      try {
        const res = await fetch('/api/community/notifications')
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.data ?? [])
        }
        // Mark as read
        if (unreadCount > 0) {
          await fetch('/api/community/notifications', { method: 'PATCH' })
          setUnreadCount(0)
          setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        }
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-full border border-[rgba(229,231,235,0.08)] text-[#999999] hover:text-[#ffffff] hover:bg-white/5 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-anchor-graphite0 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 w-80 bg-[#161617] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <p className="text-[#ffffff] text-sm font-medium">Bildirimler</p>
              {unreadCount === 0 && notifications.length > 0 && (
                <span className="text-[#999999] text-xs">Tümü okundu</span>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-[#999999]" />
                </div>
              )}
              {!loading && notifications.length === 0 && (
                <div className="py-8 text-center">
                  <Bell className="w-6 h-6 mx-auto mb-2 text-[#999999] opacity-40" />
                  <p className="text-[#999999] text-sm">Bildirim yok</p>
                </div>
              )}
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 flex items-start gap-3 transition-colors hover:bg-white/5 ${
                    !n.read ? 'bg-[#2dd4bf]/5' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] flex items-center justify-center shrink-0 overflow-hidden">
                    {n.actor?.avatar_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={n.actor.avatar_url} alt="" className="w-full h-full object-cover" />
                      : <span className="text-[#ffffff] text-xs font-semibold">
                          {(n.actor?.full_name || n.actor?.username || '?').charAt(0).toUpperCase()}
                        </span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {notifIcon(n.type)}
                      <p className="text-[#ffffff] text-xs leading-snug">{notifText(n)}</p>
                    </div>
                    {n.post?.content && (
                      <p className="text-[#999999] text-[11px] truncate mt-0.5">
                        &ldquo;{n.post.content.slice(0, 60)}&rdquo;
                      </p>
                    )}
                    <p className="text-[#999999] text-[10px] mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] mt-1 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
