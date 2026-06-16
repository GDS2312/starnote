import { useState, useMemo } from 'react'

const navItems = [
  { key: 'all', label: '全部笔记', icon: '📝', view: 'editor', badge: true },
  { key: 'inbox', label: 'AI收件箱', icon: '📥', view: 'inbox' },
  { key: 'graph', label: '知识图谱', icon: '🕸️', view: 'graph' },
  { key: 'capture', label: '快速捕捉', icon: '⚡', view: 'capture' },
  { key: 'tags', label: '标签', icon: '🏷️', view: 'tags' },
  { key: 'archived', label: '已归档', icon: '🗄️', view: 'archived' },
]

const colors = { '#7C6FFF': 'purple', '#00D2D3': 'teal', '#34D399': 'green', '#FB923C': 'orange' }

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}分钟前`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}小时前`
  const days = Math.floor(hrs / 24)
  return days < 7 ? `${days}天前` : new Date(dateStr).toLocaleDateString('zh-CN')
}

export default function Sidebar({ notes, activeId, onSelect, onNew, onDelete, onViewChange, viewMode }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return notes
    const q = search.toLowerCase()
    return notes.filter(n => n.title.toLowerCase().includes(q) || n.tags?.some(t => t.toLowerCase().includes(q)))
  }, [notes, search])

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text"><span>✦</span> 星记</div>
        <div className="logo-sub">AI知识工作台</div>
      </div>
      <div className="sidebar-search">
        <input type="text" placeholder="搜索笔记..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const isActive = item.key === 'all'
            ? (viewMode === 'editor' && activeId)
            : (viewMode === item.view)
          return (
            <div
              key={item.key}
              className={`nav-item${isActive ? ' active' : ''}`}
              onClick={() => onViewChange(item.view)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="badge">{notes.filter(n => !n.archived).length}</span>}
            </div>
          )
        })}
      </nav>
      <div className="sidebar-section">
        <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>最近笔记</span>
          <button className="new-btn" onClick={onNew}>+ 新建</button>
        </div>
        {filtered.map(note => (
          <div
            key={note.id}
            className={`recent-item${note.id === activeId ? ' active' : ''}`}
            onClick={() => onSelect(note.id)}
            title={note.title}
          >
            <span className="dot" style={{ background: note.color || '#7C6FFF' }} />
            <div className="item-text">
              <div className="item-title">{note.title}</div>
              <div className="item-date">{note.tags?.length > 0 ? note.tags.join(' · ') : timeAgo(note.updatedAt)}</div>
            </div>
            <button className="del-small" onClick={e => { e.stopPropagation(); onDelete(note.id) }} title="删除">✕</button>
          </div>
        ))}
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="user-info">
            <div className="user-avatar">G</div>
            <div>
              <div className="user-name">郭哥</div>
              <div className="user-role">AI项目经理</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="new-btn" onClick={onNew}>+</button>
          </div>
        </div>
      </div>
    </aside>
  )
}
