import { useState, useEffect } from 'react'
import { getArchivedNotes, toggleArchive, deleteNote } from '../store/db.js'

export default function ArchiveView({ onSelectNote, onRefresh }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getArchivedNotes().then(n => { setNotes(n); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const handleUnarchive = async (note, e) => {
    e.stopPropagation()
    await toggleArchive(note)
    load()
    if (onRefresh) onRefresh()
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('确定永久删除这条笔记？')) return
    await deleteNote(id)
    load()
    if (onRefresh) onRefresh()
  }

  if (loading) return <div className="panel-view"><div className="panel-loading">✦ 加载归档...</div></div>

  return (
    <div className="panel-view">
      <div className="panel-header">
        <h2>🗄️ 已归档</h2>
        <p>{notes.length} 篇笔记已安全归档</p>
      </div>

      <div className="panel-list">
        {notes.map(note => (
          <div key={note.id} className="panel-card" onClick={() => onSelectNote(note.id)}>
            <div className="panel-card-icon" style={{ color: note.color || '#6B7A9F' }}>📦</div>
            <div className="panel-card-body">
              <div className="panel-card-title">{note.title}</div>
              <div className="panel-card-preview">
                {(note.blocks?.[0]?.content || '').toString().replace(/<[^>]*>/g, '').slice(0, 60)}
              </div>
              <div className="panel-card-time">
                {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                {(note.tags || []).map(t => <span key={t} className="mini-tag">#{t}</span>)}
              </div>
            </div>
            <div className="panel-card-btns">
              <button className="panel-card-action unarchive" onClick={(e) => handleUnarchive(note, e)} title="取消归档">
                ↩
              </button>
              <button className="panel-card-action delete" onClick={(e) => handleDelete(note.id, e)} title="删除">
                🗑
              </button>
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="panel-empty">
            <div style={{ fontSize: 32, marginBottom: 8 }}>🗄️</div>
            暂无归档笔记
            <div style={{ fontSize: 12, color: '#4A5A7A', marginTop: 4 }}>
              在编辑器顶栏点击 ··· → 归档即可将笔记移入此处
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
