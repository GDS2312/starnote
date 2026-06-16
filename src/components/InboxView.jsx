import { useState, useEffect } from 'react'
import { getInboxItems } from '../store/db.js'

export default function InboxView({ onSelectNote }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInboxItems().then(data => {
      setItems(data.length > 0 ? data : dummyInbox)
      setLoading(false)
    })
  }, [])

  const dummyInbox = [
    { id: 'd1', type: 'summary', title: 'AI摘要：AI笔记软件调研报告', preview: '核心结论：建议采用Notion AI + 自研Agent桥接的混合架构方案...', noteId: null, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'd2', type: 'qa', title: 'AI问答：RAG技术选型建议', preview: '推荐HyDE + BM25混合检索 + BGE-Reranker的三阶段pipeline...', noteId: null, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'd3', type: 'voice', title: '🎤 语音转录：产品迭代思路', preview: '下个版本重点优化AI面板交互，增加对话历史和上下文记忆功能...', noteId: null, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'd4', type: 'image', title: '📷 OCR识别：白板会议记录', preview: '提取内容：Q3目标-星辰平台v2.6上线、30+部门AI Agent落地...', noteId: null, createdAt: new Date(Date.now() - 172800000).toISOString() },
  ]

  const typeIcons = { summary: '📝', qa: '💬', voice: '🎤', image: '📷', expand: '✏️', translate: '🌐' }

  if (loading) return <div className="panel-view"><div className="panel-loading">✦ 加载AI收件箱...</div></div>

  return (
    <div className="panel-view">
      <div className="panel-header">
        <h2>📥 AI收件箱</h2>
        <p>AI生成的摘要、问答记录和智能处理结果</p>
      </div>
      <div className="panel-list">
        {items.map(item => (
          <div key={item.id} className="panel-card"
            onClick={() => item.noteId && onSelectNote(item.noteId)}>
            <div className="panel-card-icon">{typeIcons[item.type] || '✦'}</div>
            <div className="panel-card-body">
              <div className="panel-card-title">{item.title}</div>
              <div className="panel-card-preview">{item.preview}</div>
              <div className="panel-card-time">{formatTime(item.createdAt)}</div>
            </div>
            <button className="panel-card-action" title="查看详情">→</button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="panel-empty">暂无AI处理记录，使用AI助手生成内容后将自动归档</div>
        )}
      </div>
    </div>
  )
}

function formatTime(d) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}分钟前`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}小时前`
  return `${Math.floor(hrs / 24)}天前`
}
