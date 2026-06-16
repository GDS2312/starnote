import { useState, useRef, useEffect } from 'react'

const quickActions = [
  { key: 'summary', label: '📝 摘要' },
  { key: 'expand', label: '✏️ 扩写' },
  { key: 'translate', label: '🌐 翻译' },
  { key: 'qa', label: '💬 问答' },
]

const defaultResponses = [
  '这是一个很有价值的问题。从调研数据来看，<strong>星记</strong>在综合评分上领先，特别是在多模态和AI能力方面表现突出。',
  '根据评估结果，推荐采用<strong>混合架构</strong>：以本地存储为主力，通过AI Agent对接知识库，形成闭环。',
  '关于这个维度的分析：<ul><li><strong>多模态输入</strong> 支持语音/图像/链接多种方式</li><li><strong>AI增强</strong> 支持摘要/扩写/问答</li><li><strong>知识图谱</strong> 可视化笔记关联关系</li></ul>',
]

export default function AIPanel({ open, onClose, note }) {
  const [messages, setMessages] = useState([
    { role: 'ai', content: '你好！我是你的AI写作助手。我可以帮你摘要、扩写或回答问题。有什么需要帮助的吗？' },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const chatRef = useRef(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, typing])

  const send = (text) => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      const resp = defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
      setMessages(prev => [...prev, { role: 'ai', content: resp }])
    }, 1200 + Math.random() * 800)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  const quickAction = (key) => {
    const prompts = {
      summary: `请对笔记"${note?.title}"生成一份简洁的摘要`,
      expand: '请扩写笔记中关于评估维度的部分',
      translate: '请将这篇笔记翻译成英文',
      qa: '基于这篇笔记内容回答我的问题: ',
    }
    setInput(prompts[key] || '')
  }

  return (
    <aside className={`ai-panel${open ? ' open' : ''}`}>
      <div className="ai-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="ai-title">✦ AI助手</span>
          <span className="ai-model">claude-sonnet-4-6</span>
        </div>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="ai-qa">
        {quickActions.map(qa => (
          <button key={qa.key} onClick={() => quickAction(qa.key)}>{qa.label}</button>
        ))}
      </div>

      <div className="ai-chat" ref={chatRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`ai-msg${msg.role === 'user' ? ' user' : ''}`}>
            <div className={`av ${msg.role === 'ai' ? 'ai' : 'user'}`}>
              {msg.role === 'ai' ? 'AI' : 'G'}
            </div>
            <div className={`bubble ${msg.role === 'ai' ? 'ai-bub' : 'user-bub'}`}
              dangerouslySetInnerHTML={{ __html: msg.content }}
            />
          </div>
        ))}
        {typing && (
          <div className="ai-msg">
            <div className="av ai">AI</div>
            <div className="bubble ai-bub">
              <div className="ai-typing"><span></span><span></span><span></span></div>
            </div>
          </div>
        )}
      </div>

      {note && (
        <div className="ai-related">
          <div className="rel-title">当前笔记</div>
          <div className="related-card">
            <div className="rc-title">{note.title}</div>
            <div className="rc-desc">{note.tags?.join(' · ') || '无标签'} · {note.blocks?.length || 0} 个块</div>
          </div>
        </div>
      )}

      <div className="ai-input">
        <div className="ai-input-inner">
          <input
            type="text" placeholder="向AI助手提问..."
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button onClick={() => send(input)}>➤</button>
        </div>
      </div>
    </aside>
  )
}
