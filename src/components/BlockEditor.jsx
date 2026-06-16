import { useState } from 'react'

const COLORS = ['#7C6FFF', '#00D2D3', '#34D399', '#FB923C', '#EF4444', '#F59E0B']

export default function BlockEditor({ blocks, onChange }) {
  const [copiedIdx, setCopiedIdx] = useState(null)

  const updateBlock = (idx, content) => {
    const next = blocks.map((b, i) => i === idx ? { ...b, content } : b)
    onChange(next)
  }

  const toggleCheck = (idx, ci) => {
    const block = blocks[idx]
    if (block.type !== 'checklist' || !block.content) return
    const items = block.content.map((item, i) => i === ci ? { ...item, checked: !item.checked } : item)
    updateBlock(idx, items)
  }

  const addTag = (tag) => {
    // handled by parent
  }

  const copyCode = (idx) => {
    const block = blocks[idx]
    navigator.clipboard.writeText(typeof block.content === 'string' ? block.content : JSON.stringify(block.content, null, 2))
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  return (
    <div className="editor-inner">
      {blocks.map((block, idx) => (
        <div className="block" key={block.id}>
          <span className="block-handle">⠿</span>

          {block.type === 'h2' && (
            <div
              className="block-h2"
              contentEditable
              suppressContentEditableWarning
              onBlur={e => updateBlock(idx, e.target.textContent)}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          )}

          {block.type === 'p' && (
            <div
              className="block-p"
              contentEditable
              suppressContentEditableWarning
              onBlur={e => updateBlock(idx, e.target.innerHTML)}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          )}

          {block.type === 'callout' && (
            <div className="block-callout">
              <span className="co-icon">💡</span>
              <div
                className="co-text"
                contentEditable
                suppressContentEditableWarning
                onBlur={e => updateBlock(idx, e.target.innerHTML)}
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            </div>
          )}

          {block.type === 'checklist' && Array.isArray(block.content) && (
            block.content.map((item, ci) => (
              <div className={`block-check${item.checked ? ' done' : ''}`} key={ci}>
                <input type="checkbox" checked={!!item.checked} onChange={() => toggleCheck(idx, ci)} />
                <label onClick={() => toggleCheck(idx, ci)}>{item.text}</label>
              </div>
            ))
          )}

          {block.type === 'code' && (
            <div className="block-code">
              <div className="ch">
                <span>Code</span>
                <button onClick={() => copyCode(idx)}>{copiedIdx === idx ? '✓ 已复制' : '📋 复制'}</button>
              </div>
              <pre>{typeof block.content === 'string' ? block.content : JSON.stringify(block.content, null, 2)}</pre>
            </div>
          )}

          {block.type === 'image' && (
            <div className="block-image" onClick={() => alert('📎 点击上传图片或粘贴截图')}>
              <div className="img-icon">🖼️</div>
              <div className="img-text">{block.content || '点击上传图片或粘贴截图'}</div>
              <div className="img-sub">支持 PNG, JPG, WebP</div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
