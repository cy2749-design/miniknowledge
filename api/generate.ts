import type { VercelRequest, VercelResponse } from '@vercel/node'

const DASHSCOPE_BASE = 'https://coding.dashscope.aliyuncs.com/v1'
const MODEL = 'kimi-k2.5'

const CARDS_PROMPT_EN = `You are an expert educator. Analyze the provided text and generate a structured learning card sequence.

First, assess the complexity:
- Simple (short/single concept): 4-5 content cards + 2-3 quiz cards = 6-8 total
- Medium (multi-concept article): 6-8 content cards + 3-4 quiz cards = 9-12 total
- Complex (technical/academic/multi-layered): 8-10 content cards + 4-5 quiz cards = 12-15 total

Rules:
- Content cards must be at least 2x the number of quiz/interactive cards
- Every 2-3 content cards, insert one interactive card
- Must include exactly 1 "review" card (mid-point keyword summary)
- Must include exactly 1 "trueFalse" card (to correct a common misconception)
- Must end with exactly 1 "output" card (synthesis + application question)
- All other interactive cards are "quiz" type

Card type schemas (output as JSON array, no markdown fences):

content card:
{"type":"content","tag":"<short category>","tagCls":"tagConcept","title":"<title>","html":"<p> and <strong> tags only, use class='kblock' for key terms>"}

quiz card:
{"type":"quiz","tag":"Quiz","tagCls":"tagQuiz","title":"<title>","question":"<question>","options":[{"l":"A","t":"..."},{"l":"B","t":"..."},{"l":"C","t":"..."},{"l":"D","t":"..."}],"correct":"A","explain":"<why correct>"}

review card:
{"type":"review","tag":"Review","tagCls":"tagReview","title":"<title>","keyPoints":"keyword1, keyword2, keyword3, keyword4","question":"<comprehensive question>","options":[{"l":"A","t":"..."},{"l":"B","t":"..."},{"l":"C","t":"..."},{"l":"D","t":"..."}],"correct":"B","explain":"<why correct>"}

trueFalse card:
{"type":"trueFalse","tag":"True or False","tagCls":"tagQuiz","title":"<title>","statement":"<a statement about the topic that may be true or false>","isTrue":false,"explain":"<explanation of why true or false, correcting the misconception if false>"}

output card:
{"type":"output","tag":"Summary","tagCls":"tagOutput","title":"<title>","summary":"<2-3 sentence synthesis paragraph>","question":"<application scenario question>","options":[{"l":"A","t":"..."},{"l":"B","t":"..."},{"l":"C","t":"..."},{"l":"D","t":"..."}],"correct":"C","explain":"<why correct>"}

Output ONLY a valid JSON array of card objects. No markdown, no explanation.`

const CARDS_PROMPT_ZH = `你是一位专业教育者。分析提供的文字，生成结构化学习卡片序列。

首先评估内容复杂度：
- 简单（短文/单一概念）：4-5张内容卡 + 2-3张测验卡 = 共6-8张
- 中等（多概念文章）：6-8张内容卡 + 3-4张测验卡 = 共9-12张
- 复杂（技术/学术/多层次）：8-10张内容卡 + 4-5张测验卡 = 共12-15张

规则：
- 内容卡数量必须至少是测验/互动卡的2倍
- 每2-3张内容卡后穿插一张互动卡
- 必须包含且仅包含1张"review"卡（中途关键词归纳）
- 必须包含且仅包含1张"trueFalse"卡（纠正常见误区）
- 必须以1张"output"卡结尾（综合总结+应用题）
- 其他互动卡均为"quiz"类型

卡片类型（输出为JSON数组，无markdown代码块）：

content卡：
{"type":"content","tag":"<短类别名>","tagCls":"tagConcept","title":"<标题>","html":"<只用<p>和<strong>标签，关键词用class='kblock'>"}

quiz卡：
{"type":"quiz","tag":"测验","tagCls":"tagQuiz","title":"<标题>","question":"<题目>","options":[{"l":"A","t":"..."},{"l":"B","t":"..."},{"l":"C","t":"..."},{"l":"D","t":"..."}],"correct":"A","explain":"<解析>"}

review卡：
{"type":"review","tag":"复习","tagCls":"tagReview","title":"<标题>","keyPoints":"关键词1, 关键词2, 关键词3, 关键词4","question":"<综合题目>","options":[{"l":"A","t":"..."},{"l":"B","t":"..."},{"l":"C","t":"..."},{"l":"D","t":"..."}],"correct":"B","explain":"<解析>"}

trueFalse卡：
{"type":"trueFalse","tag":"判断题","tagCls":"tagQuiz","title":"<标题>","statement":"<关于主题的一个陈述，可能正确或错误>","isTrue":false,"explain":"<解释为何正确/错误，如错误则纠正误区>"}

output卡：
{"type":"output","tag":"总结","tagCls":"tagOutput","title":"<标题>","summary":"<2-3句综合总结>","question":"<应用场景题目>","options":[{"l":"A","t":"..."},{"l":"B","t":"..."},{"l":"C","t":"..."},{"l":"D","t":"..."}],"correct":"C","explain":"<解析>"}

只输出有效的JSON数组，不要markdown，不要解释。`

const DEEPER_PROMPT = (lang: string) => lang === 'zh'
  ? '用简体中文，对上文核心概念进行深度解析，150-200字，分段叙述，不用标题。'
  : 'In English, provide a deeper explanation of the core concepts from the text above. 150-200 words, paragraph form, no headings.'

const EXAMPLES_PROMPT = (lang: string) => lang === 'zh'
  ? '用简体中文，基于上文内容，给出3个现实世界的应用案例。每个案例一句话，以数字序号开头（1. 2. 3.），直接输出，不要额外说明。'
  : 'In English, based on the text above, provide 3 real-world application examples. One sentence each, numbered (1. 2. 3.). Output directly, no preamble.'

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { mode, text, lang = 'en' } = req.body ?? {}
  if (!text) return res.status(400).json({ error: 'text is required' })

  try {
    if (mode === 'cards') {
      const systemPrompt = lang === 'zh' ? CARDS_PROMPT_ZH : CARDS_PROMPT_EN
      const raw = await callDashScope(systemPrompt, text)
      // Strip possible markdown fences
      const cleaned = raw.replace(/^```[\w]*\n?/m, '').replace(/\n?```$/m, '').trim()
      const cards = JSON.parse(cleaned)
      return res.json({ cards })
    }

    if (mode === 'deeper') {
      const content = await callDashScope(DEEPER_PROMPT(lang), text)
      return res.json({ content })
    }

    if (mode === 'examples') {
      const raw = await callDashScope(EXAMPLES_PROMPT(lang), text)
      const examples = raw
        .split('\n')
        .map(l => l.replace(/^\d+\.\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 3)
      return res.json({ examples })
    }

    return res.status(400).json({ error: `Unknown mode: ${mode}` })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[generate]', msg)
    return res.status(500).json({ error: msg })
  }
}
