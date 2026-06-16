const DB_NAME = 'starnote-db'
const DB_VERSION = 1

let db = null

function openDB() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db)
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const d = e.target.result
      if (!d.objectStoreNames.contains('notes')) {
        const store = d.createObjectStore('notes', { keyPath: 'id' })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
      }
      if (!d.objectStoreNames.contains('settings')) {
        d.createObjectStore('settings', { keyPath: 'key' })
      }
    }
    req.onsuccess = (e) => { db = e.target.result; resolve(db) }
    req.onerror = () => reject(req.error)
  })
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function now() {
  return new Date().toISOString()
}

export const defaultBlocks = [
  { id: genId(), type: 'h2', content: '欢迎使用星记' },
  { id: genId(), type: 'p', content: '这是一段示例文字。点击编辑，或使用底部工具栏添加多媒体内容。' },
  { id: genId(), type: 'callout', content: '💡 星记支持语音、图像、链接等多种输入方式，点击下方工具栏试试。' },
  { id: genId(), type: 'checklist', content: [
    { text: '了解块编辑器用法', checked: true },
    { text: '尝试语音输入', checked: false },
    { text: '试试AI助手', checked: false },
  ]},
]

export const sampleNotes = [
  {
    id: genId(), title: '2026年AI笔记软件调研报告',
    blocks: [
      { id: genId(), type: 'h2', content: '调研背景' },
      { id: genId(), type: 'p', content: '随着AI技术快速发展，笔记软件行业正经历变革。本报告对主流AI笔记软件进行调研。' },
      { id: genId(), type: 'callout', content: '核心发现：AI原生笔记工具正在重塑知识工作流。' },
      { id: genId(), type: 'h2', content: '评估维度' },
      { id: genId(), type: 'checklist', content: [
        { text: '智能检索与RAG能力 — 权重25%', checked: true },
        { text: '多模态内容支持 — 权重20%', checked: false },
        { text: '协作与共享体验 — 权重20%', checked: false },
        { text: 'AI生成与改写质量 — 权重20%', checked: true },
        { text: 'API开放性与可集成性 — 权重15%', checked: false },
      ]},
      { id: genId(), type: 'h2', content: '结论' },
      { id: genId(), type: 'p', content: '建议采用 Notion AI + 自研Agent桥接 的混合方案。' },
      { id: genId(), type: 'code', content: '{"notion_ai": {"总分": 8.8, "检索": 9}}' },
    ],
    tags: ['AI', '调研', '产品'], color: '#7C6FFF',
    createdAt: now(), updatedAt: now(),
  },
  {
    id: genId(), title: 'Q2产品路线图评审',
    blocks: [
      { id: genId(), type: 'h2', content: 'Q2重点目标' },
      { id: genId(), type: 'p', content: '1. 星辰平台v2.6发布 2. 企业知识库对接 3. AI Agent落地' },
      { id: genId(), type: 'checklist', content: [
        { text: '星辰平台v2.6核心功能开发', checked: true },
        { text: '企业知识库对接POC', checked: false },
        { text: 'AI Agent场景验证', checked: false },
      ]},
    ],
    tags: ['产品', '路线图'], color: '#00D2D3',
    createdAt: now(), updatedAt: now(),
  },
  {
    id: genId(), title: '团队周会纪要 - 第24周',
    blocks: [
      { id: genId(), type: 'h2', content: '上周进展' },
      { id: genId(), type: 'p', content: '完成Dify调研，确认v1.14.2升级方案，启动知识库对接。' },
      { id: genId(), type: 'h2', content: '本周计划' },
      { id: genId(), type: 'p', content: '推进星辰平台API设计，启动企业级RAG方案评估。' },
    ],
    tags: ['周会', '团队'], color: '#34D399',
    createdAt: now(), updatedAt: now(),
  },
]

export async function getAllNotes() {
  const d = await openDB()
  const tx = d.transaction('notes', 'readonly')
  const store = tx.objectStore('notes')
  const index = store.index('updatedAt')
  const req = index.openCursor(null, 'prev')
  const notes = []
  return new Promise((resolve) => {
    req.onsuccess = (e) => {
      const cursor = e.target.result
      if (cursor) { notes.push(cursor.value); cursor.continue() }
      else resolve(notes)
    }
    req.onerror = () => resolve([])
  })
}

export async function getNote(id) {
  const d = await openDB()
  return d.transaction('notes', 'readonly').objectStore('notes').get(id)
}

export async function saveNote(note) {
  const d = await openDB()
  const n = { ...note, updatedAt: now() }
  await d.transaction('notes', 'readwrite').objectStore('notes').put(n)
  return n
}

export async function deleteNote(id) {
  const d = await openDB()
  await d.transaction('notes', 'readwrite').objectStore('notes').delete(id)
}

export async function initSampleData() {
  const existing = await getAllNotes()
  if (existing.length > 0) return existing
  const d = await openDB()
  const tx = d.transaction('notes', 'readwrite')
  const store = tx.objectStore('notes')
  for (const note of sampleNotes) store.add(note)
  await new Promise((resolve) => { tx.oncomplete = resolve })
  return sampleNotes
}

export { genId, now }
