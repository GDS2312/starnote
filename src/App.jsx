import { useState, useEffect, useCallback } from 'react'
import { getNote, getAllNotes, saveNote, deleteNote as dbDelete, initSampleData, genId, now } from './store/db.js'
import Sidebar from './components/Sidebar.jsx'
import Editor from './components/Editor.jsx'
import AIPanel from './components/AIPanel.jsx'
import GraphView from './components/GraphView.jsx'
import RecordingOverlay from './components/RecordingOverlay.jsx'
import './App.css'

export default function App() {
  const [notes, setNotes] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [activeNote, setActiveNote] = useState(null)
  const [viewMode, setViewMode] = useState('editor')
  const [aiOpen, setAiOpen] = useState(false)
  const [recording, setRecording] = useState(false)

  useEffect(() => {
    initSampleData().then(all => {
      setNotes(all)
      if (all.length > 0) {
        setActiveId(all[0].id)
        setActiveNote(all[0])
      }
    })
  }, [])

  const handleSelectNote = useCallback(async (id) => {
    setActiveId(id)
    setViewMode('editor')
    const n = await getNote(id)
    if (n) setActiveNote(n)
  }, [])

  const handleSaveNote = useCallback(async (updates) => {
    const current = activeNote
    if (!current || !current.id) return
    const updated = await saveNote({ ...current, ...updates })
    setActiveNote(updated)
    setNotes(prev => prev.map(n => n.id === updated.id ? updated : n))
  }, [activeNote])

  const handleNewNote = useCallback(async () => {
    const note = {
      id: genId(), title: '未命名笔记',
      blocks: [{ id: genId(), type: 'p', content: '开始记录...' }],
      tags: [], color: '#7C6FFF',
      createdAt: now(), updatedAt: now(),
    }
    const saved = await saveNote(note)
    setNotes(prev => [saved, ...prev])
    setActiveId(saved.id)
    setActiveNote(saved)
    setViewMode('editor')
  }, [])

  const handleDeleteNote = useCallback(async (id) => {
    const targetId = id || activeNote?.id
    if (!targetId) return
    await dbDelete(targetId)
    const remaining = notes.filter(n => n.id !== targetId)
    setNotes(remaining)
    if (remaining.length > 0) {
      setActiveId(remaining[0].id)
      setActiveNote(remaining[0])
    } else { setActiveId(null); setActiveNote(null) }
  }, [activeNote, notes])

  return (
    <div className="app">
      <Sidebar
        notes={notes} activeId={activeId}
        onSelect={handleSelectNote} onNew={handleNewNote}
        onDelete={handleDeleteNote} onViewChange={setViewMode} viewMode={viewMode}
      />
      <main className="editor">
        {viewMode === 'graph' ? (
          <GraphView notes={notes} onSelectNote={handleSelectNote} />
        ) : activeNote ? (
          <Editor
            key={activeNote.id}
            note={activeNote} onSave={handleSaveNote}
            onToggleAi={() => setAiOpen(v => !v)} aiOpen={aiOpen}
            onRecording={() => setRecording(true)}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <h3>欢迎使用星记</h3>
            <p>创建第一篇笔记，开始你的AI知识之旅</p>
            <button className="btn-primary" onClick={handleNewNote}>+ 创建笔记</button>
          </div>
        )}
      </main>
      <AIPanel open={aiOpen} onClose={() => setAiOpen(false)} note={activeNote} />
      <RecordingOverlay
        show={recording}
        onClose={() => setRecording(false)}
        onResult={async (text) => {
          if (activeNote && text) {
            const newBlock = { id: genId(), type: 'p', content: `🎤 ${text}` }
            await handleSaveNote({ blocks: [...activeNote.blocks, newBlock] })
          }
          setRecording(false)
        }}
      />
    </div>
  )
}
