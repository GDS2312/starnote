import { useState, useEffect, useMemo } from 'react'
import { getAllTags, getNotesByTag } from '../store/db.js'

const TAG_COLORS = ['#7C6FFF', '#00D2D3', '#34D399', '#FB923C', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899']

export default function TagsView({ onSelectNote }) {
  const [tags, setTags] = useState([])
  const [selectedTag, setSelectedTag] = useState(null)
  const [tagNotes, setTagNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllTags().then(t => { setTags(t); setLoading(false) })
  }, [])

  useEffect(() => {
    if (selectedTag) {
      getNotesByTag(selectedTag).then(setTagNotes)
    } else {
      setTagNotes([])
    }
  }, [selectedTag])

  const maxCount = useMemo(() => Math.max(...tags.map(t => t.count), 1), [tags])

  if (loading) return <div className="panel-view"><div className="panel-loading">✦ 加载标签...</div></div>

  return (
    <div className="panel-view">
      <div className="panel-header">
        <h2>🏷️ 标签</h2>
        <p>{tags.length} 个标签，覆盖 {tags.reduce((s, t) => s + t.count, 0)} 篇笔记</p>
      </div>

      <div className="tag-cloud">
        {tags.map((tag, i) => {
          const ratio = tag.count / maxCount
          const size = 12 + ratio * 14
          const color = TAG_COLORS[i % TAG_COLORS.length]
          return (
            <span
              key={tag.name}
              className={`tag-chip${selectedTag === tag.name ? ' selected' : ''}`}
              style={{
                fontSize: `${size}px`,
                borderColor: selectedTag === tag.name ? color : 'transparent',
                color: selectedTag === tag.name ? color : '#C8D0E0',
                background: selectedTag === tag.name ? `${color}18` : 'rgba(255,255,255,.04)',
              }}
              onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
            >
              {tag.name}
              <span className="tag-count">{tag.count}</span>
            </span>
          )
        })}
        {tags.length === 0 && (
          <div className="panel-empty">暂无标签，编辑笔记时添加标签即可自动汇集</div>
        )}
      </div>

      {selectedTag && (
        <div className="tag-notes">
          <div className="section-title">
            标签 <span style={{ color: '#7C6FFF' }}>#{selectedTag}</span> 下的笔记 ({tagNotes.length})
            <button className="tag-clear" onClick={() => setSelectedTag(null)}>✕ 清除</button>
          </div>
          {tagNotes.map(note => (
            <div key={note.id} className="panel-card" onClick={() => onSelectNote(note.id)}>
              <div className="panel-card-icon" style={{ color: note.color }}>●</div>
              <div className="panel-card-body">
                <div className="panel-card-title">{note.title}</div>
                <div className="panel-card-time">
                  {(note.tags || []).map(t => (
                    <span key={t} className="mini-tag" style={{
                      background: t === selectedTag ? 'rgba(124,111,255,.15)' : 'rgba(255,255,255,.04)',
                      color: t === selectedTag ? '#7C6FFF' : '#6B7A9F'
                    }}>#{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
