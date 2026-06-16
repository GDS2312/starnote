import { useMemo } from 'react'

const NODE_COLORS = ['#7C6FFF', '#00D2D3', '#34D399', '#FB923C', '#EF4444', '#F59E0B']

// Simple force-directed-like layout for graph nodes
function layoutNodes(notes) {
  const centerX = 400, centerY = 280
  const radius = 160
  return notes.map((note, i) => {
    const angle = (2 * Math.PI * i) / notes.length - Math.PI / 2
    return {
      id: note.id,
      title: note.title.length > 10 ? note.title.slice(0, 10) + '…' : note.title,
      color: note.color || NODE_COLORS[i % NODE_COLORS.length],
      r: 22,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      fullTitle: note.title,
    }
  })
}

export default function GraphView({ notes, onSelectNote }) {
  const nodes = useMemo(() => layoutNodes(notes), [notes])

  // Generate edges: connect each note to next one, plus some cross-connections
  const edges = useMemo(() => {
    const result = []
    if (nodes.length < 2) return result
    for (let i = 0; i < nodes.length; i++) {
      // Ring connections
      result.push({ from: i, to: (i + 1) % nodes.length })
      // Cross connections for more than 4 nodes
      if (nodes.length > 4) {
        result.push({ from: i, to: (i + 3) % nodes.length })
      }
    }
    // Center hub when enough nodes
    if (nodes.length >= 3) {
      const centerX = 400, centerY = 280
      nodes.forEach((_, i) => {
        result.push({ from: i, to: 'hub' })
      })
    }
    return result
  }, [nodes])

  return (
    <div className="graph-view" style={{ display: 'flex' }}>
      <svg width="100%" height="100%" viewBox="0 0 800 600" style={{ maxWidth: 800, maxHeight: 600 }}>
        <defs>
          {NODE_COLORS.map((c, i) => (
            <radialGradient key={i} id={`g${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity=".25" />
              <stop offset="100%" stopColor={c} stopOpacity="0" />
            </radialGradient>
          ))}
          <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        {/* Glow backgrounds */}
        {nodes.map((node, i) => (
          <circle key={`glow-${i}`} cx={node.x} cy={node.y} r={50} fill={`url(#g${i % NODE_COLORS.length})`} />
        ))}

        {/* Edges */}
        {edges.map((e, i) => {
          if (e.to === 'hub') {
            return <line key={`e${i}`} x1={nodes[e.from].x} y1={nodes[e.from].y} x2={400} y2={280}
              stroke="#2D3555" strokeWidth="1" strokeDasharray="4,3" opacity={0.6} />
          }
          return <line key={`e${i}`} x1={nodes[e.from].x} y1={nodes[e.from].y}
            x2={nodes[e.to].x} y2={nodes[e.to].y}
            stroke="#2D3555" strokeWidth="1.2" strokeDasharray="3,3" opacity={0.5} />
        })}

        {/* Center hub glow */}
        {nodes.length >= 3 && <circle cx={400} cy={280} r={45} fill="#7C6FFF" opacity={0.06} />}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <g key={node.id} filter="url(#glow)" style={{ cursor: 'pointer' }}
            onClick={() => onSelectNote(node.id)}>
            <circle cx={node.x} cy={node.y} r={node.r}
              fill="#161B2E" stroke={node.color} strokeWidth="2.5"
              onMouseEnter={e => { e.target.setAttribute('stroke-width', '3.5') }}
              onMouseLeave={e => { e.target.setAttribute('stroke-width', '2.5') }}
            />
            <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#E2E8F0" fontSize="10" fontWeight="500">
              {node.title}
            </text>
          </g>
        ))}
      </svg>

      {nodes.length === 0 && (
        <div style={{ position: 'absolute', color: '#6B7A9F', fontSize: 14 }}>
          暂无笔记，创建笔记后图谱将自动生成
        </div>
      )}

      <div className="graph-info">
        <span><span className="g-dot purple"></span>核心主题</span>
        <span><span className="g-dot teal"></span>AI产品</span>
        <span><span className="g-dot green"></span>工具平台</span>
        <span><span className="g-dot orange"></span>相关方案</span>
      </div>
    </div>
  )
}
