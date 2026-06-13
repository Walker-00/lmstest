'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { EmptyState } from '@/components/shared/EmptyState'
import { getDocs, collection, query, orderBy, where, addDoc, serverTimestamp, Timestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Discussion } from '@/models'
import { formatDateTime } from '@/lib/utils'
import { MessageSquare, ThumbsUp, Flag, Reply, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DiscussionsPage() {
  const { user, userData } = useAuth()
  const [discussions, setDiscussions] = useState<(Discussion & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => { loadDiscussions() }, [])

  async function loadDiscussions() {
    try {
      const q = query(collection(db, 'discussions'), where('parentId', '==', null), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setDiscussions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Discussion & { id: string })))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const addDiscussion = async () => {
    if (!newComment.trim() || !user) return
    setSending(true)
    try {
      const ref = await addDoc(collection(db, 'discussions'), {
        courseId: '',
        lessonId: '',
        userId: user.uid,
        userName: userData?.displayName || 'User',
        userPhoto: userData?.photoURL || '',
        content: newComment,
        parentId: null,
        likes: 0,
        likedBy: [],
        isModerated: false,
        isFlagged: false,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      })
      setDiscussions(prev => [{ id: ref.id, courseId: '', lessonId: '', userId: user.uid, userName: userData?.displayName || 'User', userPhoto: '', content: newComment, parentId: null, likes: 0, likedBy: [], isModerated: false, isFlagged: false, createdAt: undefined as unknown as Timestamp, updatedAt: undefined as unknown as Timestamp }, ...prev])
      setNewComment('')
      toast.success('Comment added')
    } catch { toast.error('Failed to add comment') }
    finally { setSending(false) }
  }

  const addReply = async (parentId: string) => {
    if (!replyText.trim() || !user) return
    try {
      await addDoc(collection(db, 'discussions'), {
        courseId: '', lessonId: '',
        userId: user.uid,
        userName: userData?.displayName || 'User',
        userPhoto: '',
        content: replyText,
        parentId,
        likes: 0, likedBy: [],
        isModerated: false, isFlagged: false,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      })
      setReplyText('')
      setReplyingTo(null)
      toast.success('Reply added')
    } catch { toast.error('Failed to reply') }
  }

  const toggleLike = async (discussion: Discussion & { id: string }) => {
    if (!user) return
    const isLiked = discussion.likedBy?.includes(user.uid)
    try {
      await updateDoc(doc(db, 'discussions', discussion.id), {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? discussion.likedBy.filter(id => id !== user.uid) : [...(discussion.likedBy || []), user.uid],
      })
      setDiscussions(prev => prev.map(d => d.id === discussion.id ? {
        ...d,
        likes: isLiked ? d.likes - 1 : d.likes + 1,
        likedBy: isLiked ? d.likedBy.filter(id => id !== user.uid) : [...(d.likedBy || []), user.uid],
      } : d))
    } catch { toast.error('Failed to like') }
  }

  return (
    <div className="animate-fade-in mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Discussions</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Share your thoughts and engage with the community</p>
      </div>

      {user && (
        <Card>
          <CardContent className="p-4">
            <Textarea
              placeholder="Start a discussion..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={addDiscussion} isLoading={sending} leftIcon={<Send className="h-4 w-4" />}>
                Post Comment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>
      ) : discussions.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState icon={<MessageSquare className="h-12 w-12" />} title="No discussions yet" description="Be the first to start a discussion" />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <div key={discussion.id}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                      {discussion.userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{discussion.userName}</span>
                        <span className="text-xs text-gray-500">{formatDateTime(discussion.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{discussion.content}</p>
                      <div className="mt-3 flex items-center gap-4">
                        <button onClick={() => toggleLike(discussion)} className={`flex items-center gap-1 text-xs ${discussion.likedBy?.includes(user?.uid || '') ? 'text-indigo-600' : 'text-gray-500'} hover:text-indigo-600`}>
                          <ThumbsUp className="h-3.5 w-3.5" /> {discussion.likes || 0}
                        </button>
                        <button onClick={() => setReplyingTo(replyingTo === discussion.id ? null : discussion.id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600">
                          <Reply className="h-3.5 w-3.5" /> Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {replyingTo === discussion.id && (
                <div className="ml-12 mt-2">
                  <Card>
                    <CardContent className="p-3">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="text-sm"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                        <Button size="sm" onClick={() => addReply(discussion.id)} leftIcon={<Reply className="h-3 w-3" />}>Reply</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
