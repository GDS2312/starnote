import { useMemo } from 'react'

// Build a multi-layered knowledge graph with logical connections
function buildGraph(notes) {
  if (notes.length === 0) return { nodes: [], edges: [], categories: [] }

  // Category definitions
  const CATEGORIES = [
    { id: 'cat-design', label: '产品设计', color: '#7C6FFF', cx: 400, cy: 120, r: 30, layer: 1 },
    { id: 'cat-ai', label: 'AI技术', color: '#00D2D3', cx: 680, cy: 300, r: 30, layer: 1 },
    { id: 'cat-platform', label: '平台架构', color: '#34D399', cx: 120, cy: 300, r: 30, layer: 1 },
    { id: 'cat-team', label: '团队效能', color: '#FB923C', cx: 400, cy: 480, r: 30, layer: 1 },
  ]

  // Map notes to categories based on tags
  function assignCategory(note) {
    const tags = (note.tags || []).join(' ').toLowerCase()
    if (tags.includes('产品') || tags.includes('⭐')) return 'cat-design'
    if (tags.includes('ai') || tags.includes('rag') || tags.includes('技术') || tags.includes('llm')) return 'cat-ai'
    if (tags.includes('平台') || tags.includes('调研') || tags.includes('架构')) return 'cat-platform'
    if (tags.includes('团队') || tags.includes('管理') || tags.includes('效能')) return 'cat-team'
    return 'cat-platform' // default
  }

  const assigned = notes.map(n => ({ ...n, catId: assignCategory(n) }))

  // Layout notes around their category center
  const nodes = []
  const edges = []

  // Hub node
  nodes.push({
    id: 'hub', label: '星记', subtitle: 'AI知识中枢', color: '#7C6FFF', cx: 400, cy: 280, r: 40,
    type: 'hub'
  })

  // Category nodes
  CATEGORIES.forEach(c => {
    nodes.push({
      id: c.id, label: c.label, color: c.color, cx: c.cx, cy: c.cy, r: c.r, type: 'category'
    })
    // Hub → Category
    edges.push({ from: 'hub', to: c.id, width: 2, style: 'solid', label: '' })
  })

  // Inter-category connections (meaningful cross-links)
  edges.push({ from: 'cat-design', to: 'cat-ai', width: 1, style: 'dashed', label: 'AI赋能' })
  edges.push({ from: 'cat-ai', to: 'cat-platform', width: 1.2, style: 'dashed', label: '技术底座' })
  edges.push({ from: 'cat-platform', to: 'cat-team', width: 1, style: 'dashed', label: '效能落地' })
  edges.push({ from: 'cat-design', to: 'cat-platform', width: 1, style: 'dashed', label: '架构支撑' })

  // Place notes around their categories
  const catCounts = {}
  const LAYER2_RADIUS = 90
  CATEGORIES.forEach(c => {
    const catNotes = assigned.filter(n => n.catId === c.id)
    catCounts[c.id] = catNotes.length
    catNotes.forEach((note, i) => {
      const total = catNotes.length
      const angleOffset = total > 1 ? (2 * Math.PI * i) / total : 0
      // Vary angle start per category for visual diversity
      const startAngle = c.id === 'cat-design' ? -Math.PI/2 : c.id === 'cat-ai' ? 0 : c.id === 'cat-platform' ? Math.PI : Math.PI/2
      const angle = startAngle + angleOffset

      const x = c.cx + LAYER2_RADIUS * Math.cos(angle)
      const y = c.cy + LAYER2_RADIUS * Math.sin(angle)

      const shortLabel = note.title.length > 8 ? note.title.slice(0, 8) + '…' : note.title
      nodes.push({
        id: note.id, label: shortLabel, fullTitle: note.title,
        color: note.color || c.color, cx: x, cy: y, r: 16,
        type: 'note', catId: c.id
      })

      // Category → Note
      edges.push({
        from: c.id, to: note.id, width: 1, style: 'solid', label: ''
      })
    })
  })

  // Add cross-note connections for notes with overlapping tags
  const noteNodes = nodes.filter(n => n.type === 'note')
  for (let i = 0; i < noteNodes.length; i++) {
    for (let j = i + 1; j < noteNodes.length; j++) {
      const ni = assigned.find(n => n.id === noteNodes[i].id)
      const nj = assigned.find(n => n.id === noteNodes[j].id)
      if (ni && nj) {
        const commonTags = (ni.tags || []).filter(t => (nj.tags || []).includes(t))
        if (commonTags.length > 0) {
          edges.push({
            from: noteNodes[i].id, to: noteNodes[j].id,
            width: 0.6, style: 'dotted', label: commonTags[0]
          })
        }
      }
    }
  }

  return { nodes, edges, categories: CATEGORIES, catCounts }
}

// Pre-defined gradient colors
const GRADS = ['#7C6FFF', '#00D2D3', '#34D399', '#FB923C', '#F59E0B']

export default function GraphView({ notes, onSelectNote }) {
  const { nodes, edges, categories } = useMemo(() => buildGraph(notes), [notes])

  if (notes.length === 0) {
    return (
      <div className="graph-view">
        <div style={{ color: '#6B7A9F', fontSize: 14 }}>
          暂无笔记，创建笔记后图谱将自动生成
        </div>
      </div>
    )
  }

  return (
    <div className="graph-view">
      <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" style={{ maxWidth: 900, maxHeight: 650 }}>
        <defs>
          {GRADS.map((c, i) => (
            <radialGradient key={`g${i}`} id={`gg${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity=".3" />
              <stop offset="100%" stopColor={c} stopOpacity="0" />
            </radialGradient>
          ))}
          <radialGradient id="ghub" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7C6FFF" stopOpacity=".35" />
            <stop offset="60%" stopColor="#7C6FFF" stopOpacity=".08" />
            <stop offset="100%" stopColor="#7C6FFF" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glowStrong">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background glow for categories */}
        {categories.map((c, i) => (
          <circle key={`bg-${c.id}`} cx={c.cx} cy={c.cy} r={130}
            fill={`url(#gg${i % GRADS.length})`} />
        ))}
        {/* Hub glow */}
        <circle cx={400} cy={280} r={160} fill="url(#ghub)" />

        {/* Edges */}
        {edges.map((e, i) => {
          const fromN = nodes.find(n => n.id === e.from)
          const toN = nodes.find(n => n.id === e.to)
          if (!fromN || !toN) return null

          const strokeColors = {
            solid: 'rgba(124,111,255,.25)',
            dashed: 'rgba(124,111,255,.15)',
            dotted: 'rgba(124,111,255,.08)',
          }
          const stroke = strokeColors[e.style] || 'rgba(124,111,255,.15)'

          // Calculate midpoint for label
          const mx = (fromN.cx + toN.cx) / 2
          const my = (fromN.cy + toN.cy) / 2

          return (
            <g key={`edge-${i}`}>
              <line x1={fromN.cx} y1={fromN.cy} x2={toN.cx} y2={toN.cy}
                stroke={stroke} strokeWidth={e.width * 1.5}
                strokeDasharray={e.style === 'dashed' ? '5,4' : e.style === 'dotted' ? '2,3' : 'none'}
              />
              {e.label && (
                <text x={mx} y={my - 6} textAnchor="middle" fill="#4A5A7A" fontSize="8" fontWeight="500"
                  style={{ pointerEvents: 'none' }}>
                  {e.label}
                </text>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const isHub = node.type === 'hub'
          const isCategory = node.type === 'category'
          const glow = isHub ? 'url(#glowStrong)' : 'url(#glow)'
          const strokeW = isHub ? 3 : isCategory ? 2.2 : 1.8

          return (
            <g key={node.id} filter={glow}
              style={{ cursor: node.type === 'note' ? 'pointer' : 'default' }}
              onClick={() => node.type === 'note' && onSelectNote(node.id)}
            >
              {/* Outer ring glow for hub */}
              {isHub && (
                <circle cx={node.cx} cy={node.cy} r={node.r + 8}
                  fill="none" stroke="rgba(124,111,255,.2)" strokeWidth="1.5"
                  strokeDasharray="8,4" opacity="0.4" />
              )}

              {/* Node circle */}
              <circle cx={node.cx} cy={node.cy} r={node.r}
                fill={isHub ? '#1A1F35' : isCategory ? '#161B2E' : '#161B2E'}
                stroke={node.color} strokeWidth={strokeW}
                style={{ transition: 'all .2s' }}
                onMouseEnter={e => {
                  if (node.type === 'note') { e.target.setAttribute('stroke-width', '3.5'); e.target.setAttribute('r', String(node.r + 3)) }
                }}
                onMouseLeave={e => {
                  if (node.type === 'note') { e.target.setAttribute('stroke-width', String(strokeW)); e.target.setAttribute('r', String(node.r)) }
                }}
              />

              {/* Label */}
              <text x={node.cx} y={node.cy + (isHub ? 1 : 0.5)} textAnchor="middle"
                fill={isHub ? '#E2E8F0' : isCategory ? '#E2E8F0' : '#C8D0E0'}
                fontSize={isHub ? 15 : isCategory ? 12 : 9}
                fontWeight={isHub ? 700 : isCategory ? 600 : 500}
                style={{ pointerEvents: 'none' }}>
                {node.label}
              </text>

              {/* Subtitle below hub */}
              {isHub && node.subtitle && (
                <text x={node.cx} y={node.cy + 18} textAnchor="middle"
                  fill="#6B7A9F" fontSize="9" fontWeight="400"
                  style={{ pointerEvents: 'none' }}>
                  {node.subtitle}
                </text>
              )}

              {/* Count badge on categories */}
              {isCategory && (
                <circle cx={node.cx + node.r - 4} cy={node.cy - node.r + 4} r="10"
                  fill={node.color} opacity="0.2" />
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="graph-info">
        <span><span className="g-dot purple"></span>产品设计</span>
        <span><span className="g-dot teal"></span>AI技术</span>
        <span><span className="g-dot green"></span>平台架构</span>
        <span><span className="g-dot orange"></span>团队效能</span>
      </div>
    </div>
  )
}
