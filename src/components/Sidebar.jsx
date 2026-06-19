import { useState, useMemo, useEffect, useRef } from 'react'
import { getUserProfile, saveUserProfile, getInitials } from '../store/db.js'

const navItems = [
  { key: 'all', label: '全部笔记', icon: '📝', view: 'editor', badge: true },
  { key: 'inbox', label: 'AI收件箱', icon: '📥', view: 'inbox' },
  { key: 'graph', label: '知识图谱', icon: '🕸️', view: 'graph' },
  { key: 'capture', label: '快速捕捉', icon: '⚡', view: 'capture' },
  { key: 'tags', label: '标签', icon: '🏷️', view: 'tags' },
  { key: 'archived', label: '已归档', icon: '🗄️', view: 'archived' },
]

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}分钟前`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}小时前`
  const days = Math.floor(hrs / 24)
  return days < 7 ? `${days}天前` : new Date(dateStr).toLocaleDateString('zh-CN')
}

export default function Sidebar({ notes, activeId, onSelect, onNew, onDelete, onViewChange, viewMode, sidebarOpen }) {
  const [search, setSearch] = useState('')
  const [profile, setProfile] = useState({ name: '', role: '' })
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const nameRef = useRef(null)

  useEffect(() => {
    getUserProfile().then(p => { setProfile(p); setEditName(p.name || ''); setEditRole(p.role || '') })
  }, [])

  const displayName = profile.name || '点击设置'
  const displayRole = profile.role || '你的身份'
  const initials = getInitials(profile.name)

  const saveProfile = async () => {
    try {
      const p = await saveUserProfile({ name: editName.trim(), role: editRole.trim() })
      setProfile(p)
      setEditing(false)
    } catch (err) {
      console.warn('保存用户信息失败:', err)
      setEditing(false)
    }
  }

  const handleEditClick = () => {
    setEditName(profile.name || '')
    setEditRole(profile.role || '')
    setEditing(true)
    setTimeout(() => nameRef.current?.focus(), 100)
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return notes
    const q = search.toLowerCase()
    return notes.filter(n => n.title.toLowerCase().includes(q) || n.tags?.some(t => t.toLowerCase().includes(q)))
  }, [notes, search])

  return (
    <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
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
        {editing ? (
          <div className="user-edit-popup">
            <input ref={nameRef} className="user-edit-input" placeholder="你的名字" value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveProfile() }} />
            <input className="user-edit-input" placeholder="你的身份/角色" value={editRole}
              onChange={e => setEditRole(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveProfile() }} />
            <div className="user-edit-btns">
              <button className="new-btn" onClick={saveProfile}>✓ 保存</button>
              <button className="user-cancel-btn" onClick={() => setEditing(false)}>取消</button>
            </div>
          </div>
        ) : (
          <div className="sidebar-user" onClick={handleEditClick} title="点击设置姓名">
            <div className="user-info">
              <div className="user-avatar">{initials}</div>
              <div>
                <div className="user-name">{displayName}</div>
                <div className="user-role">{displayRole}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="new-btn" onClick={e => { e.stopPropagation(); onNew() }}>+</button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
