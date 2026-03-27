import type { VercelRequest, VercelResponse } from '@vercel/node'

const DASHSCOPE_BASE = 'https://coding.dashscope.aliyuncs.com/v1'
const MODEL = 'kimi-k2.5'

const CARDS_PROMPT_EN = (readMode: 'skim' | 'deep') => {
  const modeRule = readMode === 'skim'
    ? 'MODE — Quick Read: extract only the 3 most essential concepts. Total cards: 6–10.'
    : 'MODE — Deep Read: cover every core concept, sub-concept, nuance, and implication comprehensively. Total cards: 12–20.'

  return `You are an expert educator. Follow this exact process:

STEP 1 — ANALYZE INTERNALLY (do not output this step)
• Article type: argumentative | tutorial | news | opinion
  → argumentative: emphasize reasoning chains; tutorial: emphasize steps & order; news: emphasize facts & context; opinion: emphasize claims vs evidence
• One-sentence thesis
• 3–5 core concepts and their relationships (parallel / progressive / causal)
• The single most counterintuitive point → assign to trueFalse card
• The most commonly confused concept pair → assign to a contrast content card

STEP 2 — PLAN SEQUENCE INTERNALLY (do not output this step)
• Order cards: known → unknown → application
• Never place a quiz before the content card that introduces its concept
• Every core concept must appear in at least one content card

STEP 3 — GENERATE CARDS

${modeRule}

Rules:
- Content cards ≥ 2× quiz/interactive cards
- Insert 1 interactive card every 2–3 content cards
- Exactly 1 "review" card (keyword summary at the midpoint)
- Exactly 1 "trueFalse" card (targets the most counterintuitive point)
- Exactly 1 "output" card as the final card (synthesis + real-world application)
- All other interactive cards are "quiz" type

Card schemas (output as JSON array, no markdown fences):

content card:
{"type":"content","tag":"<short category>","tagCls":"tagConcept","title":"<title>","html":"<p> and <strong> tags only, use class='kblock' for key terms>"}

quiz card:
{"type":"quiz","tag":"Quiz","tagCls":"tagQuiz","title":"<title>","question":"<question>","options":[{"l":"A","t":"..."},{"l":"B","t":"..."},{"l":"C","t":"..."},{"l":"D","t":"..."}],"correct":"A","explain":"<why correct>"}

review card:
{"type":"review","tag":"Review","tagCls":"tagReview","title":"<title>","keyPoints":"keyword1, keyword2, keyword3, keyword4","question":"<comprehensive question>","options":[{"l":"A","t":"..."},{"l":"B","t":"..."},{"l":"C","t":"..."},{"l":"D","t":"..."}],"correct":"B","explain":"<why correct>"}

trueFalse card:
{"type":"trueFalse","tag":"True or False","tagCls":"tagQuiz","title":"<title>","statement":"<statement targeting the counterintuitive point>","isTrue":false,"explain":"<clear correction of the misconception>"}

output card:
{"type":"output","tag":"Summary","tagCls":"tagOutput","title":"<title>","summary":"<2–3 sentence synthesis>","question":"<real-world application question>","options":[{"l":"A","t":"..."},{"l":"B","t":"..."},{"l":"C","t":"..."},{"l":"D","t":"..."}],"correct":"C","explain":"<why correct>"}

Output ONLY a valid JSON array of card objects. No markdown, no explanation.`
}

const CARDS_PROMPT_ZH = (readMode: 'skim' | 'deep') => {
  const modeRule = readMode === 'skim'
    ? '模式 — 略读：只提炼最核心的3个概念，卡片总数：6–10张。'
    : '模式 — 精读：全面覆盖所有核心概念、子概念、细节与含义，卡片总数：12–20张。'

  return `你是一位专业教育者。无论原文是什么语言，所有卡片内容必须全部用中文输出。请严格按以下步骤执行：

第一步 — 内部分析（不要输出此步骤）
• 文章类型：论述型 | 教程型 | 报道型 | 观点型
  → 论述型：重点体现推理链；教程型：重点体现步骤与顺序；报道型：重点体现事实与背景；观点型：重点体现论点与依据对比
• 一句话概括文章主旨
• 识别3–5个核心概念及其关系（并列 / 递进 / 因果）
• 找出最反直觉的一个点 → 分配给 trueFalse 卡
• 找出最容易混淆的概念对 → 分配给对比型 content 卡

第二步 — 内部规划卡片顺序（不要输出此步骤）
• 顺序：已知 → 陌生 → 应用
• 测验卡不得出现在其对应概念卡之前
• 每个核心概念至少有一张内容卡覆盖

第三步 — 生成卡片

${modeRule}

规则：
- 内容卡数量 ≥ 测验/互动卡的2倍
- 每2–3张内容卡后穿插1张互动卡
- 必须且仅含1张"review"卡（中途关键词归纳）
- 必须且仅含1张"trueFalse"卡（针对最反直觉的点）
- 最后1张必须是"output"卡（综合总结+应用场景题）
- 其他互动卡均为"quiz"类型

卡片格式（输出为JSON数组，无markdown代码块）：

content卡：
{"type":"content","tag":"<短类别名>","tagCls":"tagConcept","title":"<标题>","html":"<只用<p>和<strong>标签，关键词用class='kblock'>"}

quiz卡：
{"type":"quiz","tag":"测验","tagCls":"tagQuiz","title":"<标题>","question":"<题目>","options":[{"l":"A","t":"..."},{"l":"B","t":"..."},{"l":"C","t":"..."},{"l":"D","t":"..."}],"correct":"A","explain":"<解析>"}

review卡：
{"type":"review","tag":"复习","tagCls":"tagReview","title":"<标题>","keyPoints":"关键词1, 关键词2, 关键词3, 关键词4","question":"<综合题目>","options":[{"l":"A","t":"..."},{"l":"B","t":"..."},{"l":"C","t":"..."},{"l":"D","t":"..."}],"correct":"B","explain":"<解析>"}

trueFalse卡：
{"type":"trueFalse","tag":"判断题","tagCls":"tagQuiz","title":"<标题>","statement":"<针对最反直觉点的陈述>","isTrue":false,"explain":"<清晰纠正误区>"}

output卡：
{"type":"output","tag":"总结","tagCls":"tagOutput","title":"<标题>","summary":"<2–3句综合总结>","question":"<现实应用场景题目>","options":[{"l":"A","t":"..."},{"l":"B","t":"..."},{"l":"C","t":"..."},{"l":"D","t":"..."}],"correct":"C","explain":"<解析>"}

只输出有效的JSON数组，不要markdown，不要解释。`
}

const AI_SUMMARY_PROMPT = (lang: string) => lang === 'zh'
  ? `你是一位善于提炼要点的分析师。无论原文是什么语言，请用中文对以下文章内容进行深度总结，输出4-6个关键洞察，每条洞察一句话，直接输出，以「• 」开头，不要序号，不要其他说明。`
  : `You are an insightful analyst. Summarize the following article into 4-6 key insights. Each insight is one sentence. Output each on its own line starting with "• ". No numbering, no preamble.`

const FIND_RELATED_PROMPT = (lang: string) => lang === 'zh'
  ? `基于以下文章主题，使用网络搜索找到3-5篇高质量的相关文章或资源。无论原文是什么语言，title 和 description 字段必须用中文填写。输出以下格式的JSON数组（无markdown代码块）：
[{"title":"文章标题","url":"https://...","description":"一句话描述为什么值得阅读"}]
只输出JSON数组。`
  : `Based on the topic of the following article, use web search to find 3-5 high-quality related articles or resources. For each result, output a JSON array (no markdown fences):
[{"title":"Article title","url":"https://...","description":"One sentence on why it's worth reading"}]
Output only the JSON array.`

const CHAT_SYSTEM_PROMPT = (lang: string, context: string) => lang === 'zh'
  ? `你是一位耐心的知识导师，正在帮助用户学习一篇文章。用简单易懂的语言回答问题，多用类比和例子，避免堆砌术语。回答简洁（2–4句为宜）。如果问题与文章相关，结合文章内容回答。\n\n【文章内容】\n${context.slice(0, 4000)}`
  : `You are a patient tutor helping someone study an article. Answer clearly and simply — use analogies and examples, avoid jargon. Keep responses concise (2–4 sentences). Reference the article when relevant.\n\n[Article]\n${context.slice(0, 4000)}`

async function callDashScope(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY
  if (!apiKey) throw new Error('DASHSCOPE_API_KEY not set')

  const res = await fetch(`${DASHSCOPE_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      max_tokens: 8000,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DashScope error ${res.status}: ${err}`)
  }

  const json = await res.json()
  return json.choices?.[0]?.message?.content ?? ''
}

async function callDashScopeChat(
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY
  if (!apiKey) throw new Error('DASHSCOPE_API_KEY not set')

  const res = await fetch(`${DASHSCOPE_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DashScope error ${res.status}: ${err}`)
  }

  const json = await res.json()
  return json.choices?.[0]?.message?.content ?? ''
}

async function callDashScopeWithSearch(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY
  if (!apiKey) throw new Error('DASHSCOPE_API_KEY not set')

  const tools = [{
    type: 'builtin_function',
    function: { name: '$web_search' },
  }]

  let messages: { role: string; content: string; tool_call_id?: string; name?: string }[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ]

  // Agentic loop: keep calling until no more tool calls
  for (let i = 0; i < 5; i++) {
    const res = await fetch(`${DASHSCOPE_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        tools,
        max_tokens: 8000,
        temperature: 0.7,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`DashScope error ${res.status}: ${err}`)
    }

    const json = await res.json()
    const choice = json.choices?.[0]
    if (!choice) throw new Error('No response from model')

    const msg = choice.message
    messages.push(msg)

    if (choice.finish_reason === 'tool_calls' && msg.tool_calls?.length) {
      // Add tool result placeholders (the model handles actual search)
      for (const tc of msg.tool_calls) {
        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          name: tc.function.name,
          content: '', // model fills in results via its built-in search
        })
      }
      continue
    }

    return msg.content ?? ''
  }

  throw new Error('Max tool call iterations reached')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { mode, text, lang = 'en', readMode = 'deep', messages, context } = req.body ?? {}

  try {
    if (mode === 'chat') {
      if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'messages required' })
      const systemPrompt = CHAT_SYSTEM_PROMPT(lang, context ?? '')
      const reply = await callDashScopeChat(systemPrompt, messages)
      return res.json({ reply })
    }

    if (!text) return res.status(400).json({ error: 'text is required' })

    if (mode === 'cards') {
      const systemPrompt = lang === 'zh' ? CARDS_PROMPT_ZH(readMode) : CARDS_PROMPT_EN(readMode)
      const raw = await callDashScope(systemPrompt, text)
      const cleaned = raw.replace(/^```[\w]*\n?/m, '').replace(/\n?```$/m, '').trim()
      const cards = JSON.parse(cleaned)
      return res.json({ cards })
    }

    if (mode === 'ai-summary') {
      const raw = await callDashScope(AI_SUMMARY_PROMPT(lang), text)
      const bullets = raw
        .split('\n')
        .map(l => l.replace(/^[•\-]\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 6)
      return res.json({ bullets })
    }

    if (mode === 'find-related') {
      const raw = await callDashScopeWithSearch(FIND_RELATED_PROMPT(lang), text)
      const match = raw.match(/\[[\s\S]*\]/)
      if (!match) return res.json({ links: [] })
      const links = JSON.parse(match[0])
      return res.json({ links })
    }

    return res.status(400).json({ error: `Unknown mode: ${mode}` })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[generate]', msg)
    return res.status(500).json({ error: msg })
  }
}
