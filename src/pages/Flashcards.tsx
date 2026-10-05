import { useMemo, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { supabase } from '../lib/supabase'
import { Card, EmptyState, PageHeader } from '../components/shared'

export default function Flashcards() {
  const { user } = useAuth()
  const { courses, flashcards, refresh } = useData()
  const [courseId, setCourseId] = useState('')
  const [deck, setDeck] = useState('General')
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [studyDeck, setStudyDeck] = useState<string | null>(null)
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const decks = useMemo(() => Array.from(new Set(flashcards.map((f) => f.deck))), [flashcards])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!front.trim() || !back.trim() || !user) return
    await supabase.from('flashcards').insert({ user_id: user.id, course_id: courseId || null, deck: deck.trim() || 'General', front: front.trim(), back: back.trim() })
    setFront('')
    setBack('')
    await refresh()
  }

  async function remove(id: string) {
    await supabase.from('flashcards').delete().eq('id', id)
    await refresh()
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(flashcards.map(({ deck, front, back }) => ({ deck, front, back })), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flashcards.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const text = await file.text()
    try {
      const data = JSON.parse(text) as { deck?: string; front: string; back: string }[]
      const rows = data.map((d) => ({ user_id: user.id, deck: d.deck || 'General', front: d.front, back: d.back }))
      await supabase.from('flashcards').insert(rows)
      await refresh()
    } catch {
      alert('Could not parse that file. Expected a JSON array of {deck, front, back}.')
    }
    e.target.value = ''
  }

  if (studyDeck) {
    const cards = flashcards.filter((f) => f.deck === studyDeck)
    if (cards.length === 0) return <div className="p-4"><EmptyState text="No cards in this deck." /></div>
    const card = cards[idx % cards.length]
    return (
      <div className="p-4 min-h-dvh flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setStudyDeck(null)} className="text-sm opacity-60">Exit</button>
          <span className="text-xs opacity-50">{(idx % cards.length) + 1} / {cards.length}</span>
        </div>
        <button onClick={() => setFlipped((f) => !f)} className="flex-1 w-full">
          <Card className="h-full p-6 flex items-center justify-center text-center">
            <p className="text-lg font-medium">{flipped ? card.back : card.front}</p>
          </Card>
        </button>
        <div className="flex gap-2 mt-4">
          <button onClick={() => { setIdx((i) => i + 1); setFlipped(false) }} className="flex-1 rounded-xl bg-indigo-600 text-white py-2.5 text-sm font-medium">Next card</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Flashcards" right={
        <div className="flex gap-2">
          <button onClick={exportJson} className="text-xs font-medium bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full">Export</button>
          <button onClick={() => fileRef.current?.click()} className="text-xs font-medium bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full">Import</button>
          <input ref={fileRef} type="file" accept="application/json" onChange={importJson} className="hidden" />
        </div>
      } />

      <div className="px-4 space-y-4">
        <form onSubmit={submit} className="rounded-2xl border border-black/10 dark:border-white/15 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-2 text-xs outline-none">
              <option value="">No course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
            <input value={deck} onChange={(e) => setDeck(e.target.value)} placeholder="Deck name" className="rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-2 text-xs outline-none" />
          </div>
          <input value={front} onChange={(e) => setFront(e.target.value)} placeholder="Front" className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 text-sm outline-none" />
          <input value={back} onChange={(e) => setBack(e.target.value)} placeholder="Back" className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 text-sm outline-none" />
          <button type="submit" className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium">Add card</button>
        </form>

        {decks.length === 0 ? (
          <EmptyState text="No flashcards yet." />
        ) : (
          decks.map((d) => {
            const cards = flashcards.filter((f) => f.deck === d)
            return (
              <Card key={d} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{d} <span className="opacity-40 font-normal">({cards.length})</span></p>
                  <button onClick={() => { setStudyDeck(d); setIdx(0); setFlipped(false) }} className="text-xs font-medium text-indigo-500">Study</button>
                </div>
                <div className="space-y-1">
                  {cards.slice(0, 3).map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-xs opacity-60">
                      <span className="truncate">{c.front}</span>
                      <button onClick={() => remove(c.id)} className="opacity-50 hover:opacity-100 ml-2">✕</button>
                    </div>
                  ))}
                  {cards.length > 3 && <p className="text-[10px] opacity-40">+{cards.length - 3} more</p>}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
