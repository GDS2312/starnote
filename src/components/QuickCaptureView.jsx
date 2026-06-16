import { useState, useRef } from 'react'
import { genId, now, saveNote } from '../store/db.js'

export default function QuickCaptureView({ onNew, onSelect }) {
  const [text, setText] = useState('')
  const [captured, setCaptured] = useState([])
  const inputRef = useRef(null)

  const capture = async () => {
    const v = text.trim()
    if (!v) return
    const note = {
      id: genId(), title: v.slice(0, 40) + (v.length > 40 ? '…' : ''),
      blocks: [{ id: genId(), type: 'p', content: v }],
      tags: [], color: '#7C6FFF', archived: false,
      createdAt: now(), updatedAt: now(),
    }
    const saved = await saveNote(note)
    setCaptured(prev => [saved, ...prev])
    setText('')
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      capture()
    }
  }

  return (
    <div className="panel-view">
      <div className="panel-header">
        <h2>⚡ 快速捕捉</h2>
        <p>瞬间记录灵感，⌘+Enter 发送</p>
      </div>

      <div className="capture-area">
        <textarea
          ref={inputRef}
          className="capture-input"
          placeholder="在此输入任何想法、灵感、待办...&#10;&#10;按 ⌘+Enter 快速保存"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          rows={6}
          autoFocus
        />
        <div className="capture-actions">
          <div className="capture-hints">
            <span>🎤 语音输入</span>
            <span>📷 拍照识别</span>
            <span>📎 上传文件</span>
          </div>
          <button className="btn-primary capture-btn" onClick={capture} disabled={!text.trim()}>
            ⚡ 捕捉
          </button>
        </div>
      </div>

      {captured.length > 0 && (
        <div className="captured-list">
          <div className="section-title">最近捕捉 ({captured.length})</div>
          {captured.map(note => (
            <div key={note.id} className="panel-card" onClick={() => onSelect(note.id)}>
              <div className="panel-card-icon">✓</div>
              <div className="panel-card-body">
                <div className="panel-card-title">{note.title}</div>
                <div className="panel-card-preview">{(note.blocks?.[0]?.content || '').slice(0, 60)}</div>
                <div className="panel-card-time">刚刚</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="capture-tips">
        <div className="section-title">💡 使用技巧</div>
        <ul>
          <li>会议闪记：语音转文字，一键捕捉关键信息</li>
          <li>灵感速记：⌘+N 新建笔记，快速保存一闪而过的想法</li>
          <li>图片速记：拍下白板/文档，AI自动OCR提取文字</li>
        </ul>
      </div>
    </div>
  )
}
