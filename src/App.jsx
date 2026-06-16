import { useState, useEffect, useCallback } from 'react'
import { getNote, getAllNotes, saveNote, deleteNote as dbDelete, initSampleData, genId, now, toggleArchive } from './store/db.js'
import Sidebar from './components/Sidebar.jsx'
import Editor from './components/Editor.jsx'
import AIPanel from './components/AIPanel.jsx'
import GraphView from './components/GraphView.jsx'
import RecordingOverlay from './components/RecordingOverlay.jsx'
import InboxView from './components/InboxView.jsx'
import QuickCaptureView from './components/QuickCaptureView.jsx'
import TagsView from './components/TagsView.jsx'
import ArchiveView from './components/ArchiveView.jsx'
import './App.css'

export default function App() {
  const [notes, setNotes] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [activeNote, setActiveNote] = useState(null)
  const [viewMode, setViewMode] = useState('editor')
  const [aiOpen, setAiOpen] = useState(false)
  const [recording, setRecording] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = () => setSidebarOpen(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false)

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
    closeSidebar()
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
      tags: [], color: '#7C6FFF', archived: false,
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

  const handleArchiveNote = useCallback(async () => {
    if (!activeNote) return
    const updated = await toggleArchive(activeNote)
    setActiveNote(updated)
    setNotes(prev => prev.map(n => n.id === updated.id ? updated : n))
  }, [activeNote])

  const refreshNotes = useCallback(async () => {
    const all = await getAllNotes()
    setNotes(all)
    if (activeId) {
      const n = await getNote(activeId)
      if (n) setActiveNote(n)
    }
  }, [activeId])

  // Render the main content based on viewMode
  const renderMain = () => {
    switch (viewMode) {
      case 'inbox':
        return <InboxView onSelectNote={handleSelectNote} />
      case 'graph':
        return <GraphView notes={notes} onSelectNote={handleSelectNote} />
      case 'capture':
        return <QuickCaptureView onNew={handleNewNote} onSelect={handleSelectNote} />
      case 'tags':
        return <TagsView onSelectNote={handleSelectNote} />
      case 'archived':
        return <ArchiveView onSelectNote={handleSelectNote} onRefresh={refreshNotes} />
      case 'editor':
      default:
        if (activeNote) {
          return (
            <Editor
              key={activeNote.id}
              note={activeNote} onSave={handleSaveNote}
              onToggleAi={() => setAiOpen(v => !v)} aiOpen={aiOpen}
              onRecording={() => setRecording(true)}
              onArchive={handleArchiveNote}
            />
          )
        }
        return (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <h3>欢迎使用星记</h3>
            <p>创建第一篇笔记，开始你的AI知识之旅</p>
            <button className="btn-primary" onClick={handleNewNote}>+ 创建笔记</button>
          </div>
        )
    }
  }

  return (
    <div className="app">
      {/* Mobile hamburger toggle */}
      <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <Sidebar
        notes={notes} activeId={activeId}
        onSelect={handleSelectNote} onNew={handleNewNote}
        onDelete={handleDeleteNote} onViewChange={(v) => { setViewMode(v); closeSidebar() }} viewMode={viewMode}
        sidebarOpen={sidebarOpen}
      />
      <main className="editor">
        {renderMain()}
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
