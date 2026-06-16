const DB_NAME = 'starnote-db'
const DB_VERSION = 3

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
        store.createIndex('archived', 'archived', { unique: false })
      } else if (!d.objectStoreNames.contains('inbox')) {
        // v2 migration: add archived index to existing store
        const tx = e.target.transaction
        const store = tx.objectStore('notes')
        if (!store.indexNames.contains('archived')) {
          store.createIndex('archived', 'archived', { unique: false })
        }
      }
      if (!d.objectStoreNames.contains('inbox')) {
        d.createObjectStore('inbox', { keyPath: 'id' })
      }
      if (!d.objectStoreNames.contains('settings')) {
        d.createObjectStore('settings', { keyPath: 'key' })
      }
    }
    req.onsuccess = (e) => {
      db = e.target.result
      // Handle DB close event (e.g. user cleared data via DevTools)
      db.onclose = () => { db = null }
      resolve(db)
    }
    req.onerror = () => reject(req.error)
  })
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function now() {
  return new Date().toISOString()
}

export const sampleNotes = [
  {
    id: genId(), title: '星记StarNote产品设计文档',
    color: '#7C6FFF',
    tags: ['产品设计', '核心文档', '⭐'],
    blocks: [
      { id: genId(), type: 'h2', content: '一、产品愿景' },
      { id: genId(), type: 'p', content: '打造企业级<span class="hl">AI原生</span>知识工作台，重新定义人与信息的交互方式。以<strong>多模态输入</strong>为核心入口，以<strong>AI增强引擎</strong>为中枢，以<strong>知识图谱</strong>为底层骨架，构建从捕捉到思考的完整闭环。' },
      { id: genId(), type: 'callout', content: '<strong>核心洞察：</strong>市面上尚无同时覆盖"多模态输入 + AI原生 + 知识图谱 + 私有部署"四维能力的笔记产品。星记填补了这一空白，目标成为企业级知识管理的<strong>事实标准</strong>。' },
      { id: genId(), type: 'h2', content: '二、差异化竞争力模型' },
      { id: genId(), type: 'checklist', content: [
        { text: '多模态入口：语音实时转写 + 图像OCR识别 + 链接智能解析 → 信息零损耗', checked: true },
        { text: 'AI增强引擎：基于Claude/DeepSeek的RAG检索增强、摘要生成、智能问答', checked: true },
        { text: '知识图谱网络：双向链接 + 标签聚类 + 时间线 → 隐性知识显性化', checked: true },
        { text: '块编辑器：类Notion的块式交互 + Markdown原生支持 + 模板系统', checked: false },
        { text: '隐私与部署：IndexedDB本地存储 + GitHub Pages部署 + 零服务器依赖', checked: false },
      ]},
      { id: genId(), type: 'h2', content: '三、技术架构' },
      { id: genId(), type: 'code', content: `技术栈选型：
├── 前端：React 19 + Vite
├── 存储：IndexedDB (本地) / Supabase (可选云同步)
├── AI 引擎：Claude Sonnet 4.6 / DeepSeek V3
├── 语音识别：Web Speech API
├── 图像识别：AI Vision API
└── 部署：GitHub Pages + Actions CI/CD` },
      { id: genId(), type: 'h2', content: '四、路线图' },
      { id: genId(), type: 'p', content: '<strong>MVP（Q2）</strong>：三栏布局 + 块编辑器 + IndexedDB + 多模态工具栏<br><strong>V1.0（Q3）</strong>：AI API接入 + 知识图谱 + 语音录制<br><strong>V2.0（Q4）</strong>：协作编辑 + 云同步 + 插件市场' },
      { id: genId(), type: 'image', content: '架构图：前端 → IndexedDB ↔ AI API 三层架构' },
    ],
    archived: false, createdAt: now(), updatedAt: now(),
  },
  {
    id: genId(), title: '企业级AI平台选型调研',
    color: '#00D2D3',
    tags: ['AI平台', '企业架构', '调研'],
    blocks: [
      { id: genId(), type: 'h2', content: '调研背景' },
      { id: genId(), type: 'p', content: '当前主流AI平台在<strong>企业级部署</strong>方面存在显著差异。本次调研覆盖<span class="hl">7个主流平台</span>，从模型能力、生态兼容性、私有部署、性价比四个维度进行量化评估，为团队技术选型提供数据支撑。' },
      { id: genId(), type: 'callout', content: '<strong>关键发现：</strong>Dify 1.14在RAG能力上领先，Claude Sonnet 4.6在推理质量上最高，DeepSeek V3在中文理解和性价比上优势明显。推荐采用<strong>"Dify + 混合模型"</strong>架构。' },
      { id: genId(), type: 'h2', content: '平台评分矩阵' },
      { id: genId(), type: 'code', content: `平台评分总览（满分10分）：
┌─────────────────┬────────┬──────┬──────┬──────┬──────┐
│ 平台              │ 模型能力│ 生态  │ 私有化│ 性价比│ 总分  │
├─────────────────┼────────┼──────┼──────┼──────┼──────┤
│ Dify 1.14.2      │  9.2   │ 8.8  │ 9.0  │ 8.5  │ 8.9  │
│ Claude Sonnet 4.6│  9.5   │ 7.5  │ 6.0  │ 7.0  │ 7.5  │
│ DeepSeek V3      │  8.8   │ 7.0  │ 8.0  │ 9.5  │ 8.3  │
│ Coze 3.0         │  8.0   │ 8.0  │ 5.0  │ 7.5  │ 7.1  │
│ 星辰平台 v2.6     │  7.5   │ 9.0  │ 9.5  │ 8.0  │ 8.5  │
└─────────────────┴────────┴──────┴──────┴──────┴──────┘` },
      { id: genId(), type: 'h2', content: '推荐方案' },
      { id: genId(), type: 'checklist', content: [
        { text: '主力平台：Dify 1.14.2（RAG + 工作流编排）', checked: true },
        { text: '推理模型：Claude Sonnet 4.6（复杂推理）+ DeepSeek V3（中文场景）', checked: true },
        { text: '企业底座：星辰平台 v2.6（内部系统对接 + 权限管控）', checked: false },
        { text: '监控告警：自建Langfuse实例（Token计量 + 质量监控）', checked: false },
      ]},
    ],
    archived: false, createdAt: now(), updatedAt: now(),
  },
  {
    id: genId(), title: 'OpenClaw星辰超级智能体平台规划',
    color: '#FB923C',
    tags: ['星辰平台', '智能体', '战略规划'],
    blocks: [
      { id: genId(), type: 'h2', content: '平台定位' },
      { id: genId(), type: 'p', content: '星辰超级智能体平台是面向省公司<span class="hl">To B场景</span>的企业级AI Agent底座。区别于通用AI平台，星辰聚焦<strong>运营商垂直场景</strong>，提供算力调度、知识库管理、Agent编排、权限审计等全套企业级能力。' },
      { id: genId(), type: 'callout', content: '<strong>战略目标：</strong>2026年底完成30+部门的AI Agent落地，覆盖客服、运维、营销、数据分析四大核心场景，预计节省人力成本<strong>40%以上</strong>。' },
      { id: genId(), type: 'h2', content: '核心能力矩阵' },
      { id: genId(), type: 'checklist', content: [
        { text: '算力调度层：统一纳管GPU/CPU资源，支持弹性伸缩与成本优化', checked: true },
        { text: '知识引擎层：多格式文档解析 + 向量化存储 + 混合检索（BM25+语义）', checked: true },
        { text: 'Agent编排层：可视化工作流 + 子Agent协作 + 工具调用MCP协议', checked: false },
        { text: '安全审计层：全链路权限管控 + 操作日志 + 敏感信息脱敏', checked: false },
        { text: '接入网关层：统一API Gateway + 多模型路由 + 负载均衡', checked: false },
      ]},
      { id: genId(), type: 'h2', content: '落地路径' },
      { id: genId(), type: 'p', content: '<strong>Phase 1（已完成）</strong>：Dify平台部署 & 基础知识库搭建<br><strong>Phase 2（进行中）</strong>：客服知识Agent上线 & 内部测试<br><strong>Phase 3（Q3）</strong>：运维Agent & 营销Agent交付<br><strong>Phase 4（Q4）</strong>：全平台开放 & 地市推广' },
    ],
    archived: false, createdAt: now(), updatedAt: now(),
  },
  {
    id: genId(), title: 'RAG技术深度研究笔记',
    color: '#34D399',
    tags: ['RAG', '技术研究', 'LLM'],
    blocks: [
      { id: genId(), type: 'h2', content: 'RAG核心原理' },
      { id: genId(), type: 'p', content: '检索增强生成（Retrieval-Augmented Generation）通过将<strong>外部知识库</strong>与LLM结合，解决大模型的<strong>幻觉问题</strong>和<strong>知识时效性</strong>瓶颈。核心流程：Query → Embedding → 向量检索 → Top-K召回 → Prompt组装 → LLM生成。' },
      { id: genId(), type: 'h2', content: '检索策略对比' },
      { id: genId(), type: 'code', content: `检索策略性能对比：
策略            准确率  召回率  延迟   适用场景
────────────────────────────────────────
BM25            82%    78%    <50ms  关键词匹配
Dense Embedding 91%    85%    ~200ms 语义搜索
Hybrid (混合)   94%    92%    ~300ms 企业级推荐 ⭐
Reranker叠加    96%    94%    ~500ms 高精度场景` },
      { id: genId(), type: 'callout', content: '<strong>推荐方案：</strong>采用 HyDE（假设文档嵌入）+ BM25 语义混合检索 + BGE-Reranker重排序的三阶段pipeline，在召回率和延迟之间取得最佳平衡。' },
      { id: genId(), type: 'h2', content: '向量数据库选型' },
      { id: genId(), type: 'checklist', content: [
        { text: 'Milvus：分布式性能最优，适合10亿级向量（生产环境首选）', checked: true },
        { text: 'Qdrant：Rust实现，内存效率高，RESTful API友好', checked: false },
        { text: 'Chroma：轻量级，适合POC和开发环境', checked: true },
        { text: 'pgvector：PostgreSQL原生扩展，运维成本最低', checked: false },
      ]},
    ],
    archived: false, createdAt: now(), updatedAt: now(),
  },
  {
    id: genId(), title: '团队AI效能提升计划',
    color: '#F59E0B',
    tags: ['团队管理', '效能', 'AI工具链'],
    blocks: [
      { id: genId(), type: 'h2', content: '现状分析' },
      { id: genId(), type: 'p', content: '团队目前AI工具使用率仅<span class="hl">35%</span>，主要停留在ChatGPT问答层面。通过系统化引入<strong>AI Agent + 自动化工作流</strong>，目标将团队效能提升300%。' },
      { id: genId(), type: 'h2', content: '工具链矩阵' },
      { id: genId(), type: 'checklist', content: [
        { text: '代码开发：Cline + Claude Sonnet 4.6（端到端AI编程）', checked: true },
        { text: '文档协作：星记StarNote + AI摘要/翻译', checked: true },
        { text: '会议效率：飞书妙记 → AI自动生成纪要 + 待办提取', checked: false },
        { text: '运维辅助：ChatGPT + 内部SOP知识库RAG', checked: false },
      ]},
      { id: genId(), type: 'callout', content: '<strong>预期收益：</strong>代码产出 +150%、会议时间 -40%、文档产出 +200%、重复性工作自动化率 >80%。' },
    ],
    archived: false, createdAt: now(), updatedAt: now(),
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

export async function getArchivedNotes() {
  const all = await getAllNotes()
  return all.filter(n => n.archived === true)
}

export async function getActiveNotes() {
  const all = await getAllNotes()
  return all.filter(n => !n.archived)
}

export async function toggleArchive(note) {
  const d = await openDB()
  const n = { ...note, archived: !note.archived, updatedAt: now() }
  const tx = d.transaction('notes', 'readwrite')
  tx.objectStore('notes').put(n)
  return new Promise((resolve) => {
    tx.oncomplete = () => resolve(n)
  })
}

export async function getAllTags() {
  const notes = await getAllNotes()
  const tagMap = {}
  notes.forEach(n => {
    (n.tags || []).forEach(t => {
      if (!tagMap[t]) tagMap[t] = { name: t, count: 0, notes: [] }
      tagMap[t].count++
      tagMap[t].notes.push(n.id)
    })
  })
  return Object.values(tagMap).sort((a, b) => b.count - a.count)
}

export async function getNotesByTag(tag) {
  const notes = await getAllNotes()
  return notes.filter(n => (n.tags || []).includes(tag))
}

// Inbox (AI interactions log)
export async function saveInboxItem(item) {
  const d = await openDB()
  const i = { ...item, id: item.id || genId(), createdAt: now() }
  const tx = d.transaction('inbox', 'readwrite')
  tx.objectStore('inbox').put(i)
  return new Promise((resolve) => { tx.oncomplete = () => resolve(i) })
}

export async function getInboxItems() {
  const d = await openDB()
  const tx = d.transaction('inbox', 'readonly')
  const req = tx.objectStore('inbox').getAll()
  return new Promise((resolve) => {
    req.onsuccess = () => resolve((req.result || []).sort((a, b) => b.createdAt?.localeCompare(a.createdAt)))
    req.onerror = () => resolve([])
  })
}

export async function deleteInboxItem(id) {
  const d = await openDB()
  const tx = d.transaction('inbox', 'readwrite')
  tx.objectStore('inbox').delete(id)
  return new Promise((resolve) => { tx.oncomplete = resolve })
}

export async function getNote(id) {
  const d = await openDB()
  return new Promise((resolve) => {
    const tx = d.transaction('notes', 'readonly')
    const req = tx.objectStore('notes').get(id)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(null)
  })
}

export async function saveNote(note) {
  const d = await openDB()
  const n = { ...note, updatedAt: now() }
  const tx = d.transaction('notes', 'readwrite')
  tx.objectStore('notes').put(n)
  return new Promise((resolve) => {
    tx.oncomplete = () => resolve(n)
    tx.onerror = () => resolve(n)
  })
}

export async function deleteNote(id) {
  const d = await openDB()
  const tx = d.transaction('notes', 'readwrite')
  tx.objectStore('notes').delete(id)
  return new Promise((resolve) => {
    tx.oncomplete = resolve
    tx.onerror = resolve
  })
}

export async function initSampleData() {
  const existing = await getAllNotes()
  if (existing.length > 0) return existing
  const d = await openDB()
  // Insert sample notes
  const tx = d.transaction('notes', 'readwrite')
  const store = tx.objectStore('notes')
  for (const note of sampleNotes) store.add(note)
  await new Promise((resolve) => { tx.oncomplete = resolve })
  // Seed inbox with sample items
  const inboxTx = d.transaction('inbox', 'readwrite')
  const inboxStore = inboxTx.objectStore('inbox')
  const inboxItems = [
    { id: 'i1', type: 'summary', title: 'AI摘要：AI笔记软件调研报告', preview: '核心结论：建议采用Notion AI + 自研Agent桥接的混合架构方案...', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'i2', type: 'qa', title: 'AI问答：RAG技术选型建议', preview: '推荐HyDE + BM25混合检索 + BGE-Reranker的三阶段pipeline...', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'i3', type: 'voice', title: '🎤 语音转录：产品迭代思路', preview: '下个版本重点优化AI面板交互，增加对话历史和上下文记忆功能...', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'i4', type: 'image', title: '📷 OCR识别：白板会议记录', preview: '提取内容：Q3目标-星辰平台v2.6上线、30+部门AI Agent落地...', createdAt: new Date(Date.now() - 172800000).toISOString() },
  ]
  inboxItems.forEach(item => inboxStore.add(item))
  await new Promise((resolve) => { inboxTx.oncomplete = resolve })
  return sampleNotes
}

// User profile
export async function getUserProfile() {
  const d = await openDB()
  return new Promise((resolve) => {
    const tx = d.transaction('settings', 'readonly')
    const req = tx.objectStore('settings').get('userProfile')
    req.onsuccess = () => resolve(req.result || { key: 'userProfile', name: '', role: '' })
    req.onerror = () => resolve({ key: 'userProfile', name: '', role: '' })
  })
}

export async function saveUserProfile(profile) {
  const d = await openDB()
  const tx = d.transaction('settings', 'readwrite')
  tx.objectStore('settings').put({ key: 'userProfile', ...profile })
  return new Promise((resolve) => { tx.oncomplete = () => resolve(profile) })
}

export { genId, now }
