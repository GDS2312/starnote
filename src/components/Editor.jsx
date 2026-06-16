import { useState } from 'react'
import BlockEditor from './BlockEditor.jsx'

export default function Editor({ note, onSave, onToggleAi, aiOpen, onRecording }) {
  const [title, setTitle] = useState(note?.title || '')
  const [blocks, setBlocks] = useState(note?.blocks || [])

  const handleSave = () => {
    if (title !== note.title || blocks !== note.blocks) {
      onSave({ title, blocks })
    }
  }

  const timeAgo = note?.updatedAt
    ? (() => {
        const diff = Date.now() - new Date(note.updatedAt).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return '刚刚'
        if (mins < 60) return `${mins}分钟前`
        const hrs = Math.floor(mins / 60)
        return `${hrs}小时前`
      })()
    : ''

  return (
    <>
      <div className="editor-top">
        <div className="breadcrumb">
          <span>📂 我的空间</span>
          <span className="sep">/</span>
          <span style={{ color: '#E2E8F0' }}>{note.title?.slice(0, 16) || '笔记'}</span>
        </div>
        <div className="editor-actions">
          <button onClick={handleSave} title="保存">💾</button>
          <button title="导出">📤</button>
          <div className="view-toggle">
            <button className="active">编辑</button>
            <button>图谱</button>
            <button>表格</button>
          </div>
        </div>
      </div>

      <div className="editor-content">
        <div className="editor-inner">
          <input
            className="editor-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleSave}
            placeholder="未命名笔记"
          />
          <div className="editor-meta">
            {(note.tags || []).map((t, i) => (
              <span className={['tag', i % 3 === 1 ? 'teal' : i % 3 === 2 ? 'green' : ''].filter(Boolean).join(' ')} key={t}>
                #{t}
              </span>
            ))}
            <span className="sep">|</span>
            <span>📅 {note.createdAt ? new Date(note.createdAt).toLocaleDateString('zh-CN') : ''}</span>
            <span className="sep">·</span>
            <span>约 {blocks.reduce((s, b) => s + (typeof b.content === 'string' ? b.content.length : JSON.stringify(b.content).length), 0)} 字</span>
            {timeAgo && <><span className="sep">·</span><span>{timeAgo}</span></>}
            <span className="add-tag">+ 标签</span>
          </div>

          <BlockEditor blocks={blocks} onChange={(b) => { setBlocks(b); onSave({ title, blocks: b }) }} />
        </div>
      </div>

      <div className="editor-bottom">
        <div className="toolbar">
          <button onClick={onRecording} title="语音输入">🎤</button>
          <button title="图片上传" onClick={() => {
            setBlocks([...blocks, { id: Date.now().toString(36), type: 'image', content: '点击上传图片' }])
          }}>📷</button>
          <button title="插入链接" onClick={() => {
            const url = prompt('输入链接地址:')
            if (url) setBlocks([...blocks, { id: Date.now().toString(36), type: 'p', content: `🔗 ${url}` }])
          }}>🔗</button>
          <div className="divider"></div>
          <input type="text" placeholder="输入文字或使用 AI 生成..." id="toolbarInput"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const v = e.target.value.trim()
                if (v) { setBlocks([...blocks, { id: Date.now().toString(36), type: 'p', content: v }]); e.target.value = '' }
              }
            }}
          />
          <button className="ai-btn" onClick={onToggleAi}>✦ AI生成</button>
          <button className="send-btn" title="添加文本"
            onClick={() => {
              const input = document.getElementById('toolbarInput')
              const v = input.value.trim()
              if (v) { setBlocks([...blocks, { id: Date.now().toString(36), type: 'p', content: v }]); input.value = '' }
            }}
          >➤</button>
        </div>
      </div>
    </>
  )
}
