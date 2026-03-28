import type { Lang } from '../types'

const translations = {
  en: {
    // Header
    'header.logo': 'MiniKnowledge',
    'header.archive': 'Archive',
    'header.generating': 'Generating…',

    // Home
    'home.title': 'Turn any content into essential cards.',
    'home.subtitle': 'Paste any URL or text — we turn it into bite-sized cards, quizzes, and AI insights.',
    'home.subtitle2': 'Start learning in seconds.',
    'home.badge': 'AI-Powered Learning',
    'home.tab.url': 'URL',
    'home.tab.text': 'Text',
    'home.tab.pdf': 'PDF',
    'home.url.placeholder': 'Paste an article URL...',
    'home.text.placeholder': 'Paste any text you want to learn from...',
    'home.pdf.button': 'Choose a PDF file',
    'home.pdf.selected': 'Selected: {name}',
    'home.pdf.notice': 'Text-based PDFs only — scanned documents are not supported',
    'home.submit': 'Generate Learning Cards',
    'home.submitting': 'Analyzing...',
    'home.error.empty': 'Please enter a URL or some text.',
    'home.error.fetch': 'Failed to fetch article. Try pasting the text directly.',
    'home.error.pdf_empty': 'Please select a PDF file.',
    'home.error.pdf_parse': 'Could not extract text. Make sure it\'s a text-based PDF, not a scanned image.',
    'home.mode.skim': 'Quick Read',
    'home.mode.skim_desc': 'Core concepts · 6–10 cards',
    'home.mode.deep': 'Deep Read',
    'home.mode.deep_desc': 'Full analysis · 12–20 cards',

    // Loading
    'loading.step1': 'Fetching content...',
    'loading.step2': 'Analyzing structure...',
    'loading.step3': 'Creating learning cards...',
    'loading.step4': 'Preparing your session...',
    'loading.title': 'Building your learning experience',
    'loading.background': "Go do something else — it'll appear in your archive when ready →",

    // Learning
    'learning.progress': 'Card {current} of {total}',
    'learning.next': 'Next',
    'learning.answer_first': 'Answer to continue',
    'learning.correct': 'Correct!',
    'learning.wrong': 'Incorrect',
    'learning.true': 'True',
    'learning.false': 'False',
    'learning.tag.concept': 'Concept',
    'learning.tag.quiz': 'Quiz',
    'learning.tag.review': 'Review',
    'learning.tag.output': 'Summary',
    'learning.tag.trueFalse': 'True or False',
    'learning.keypoints': 'Key Points',
    'learning.summary_label': 'Summary',

    // AI Summary
    'aisummary.title': 'AI Summary',
    'aisummary.subtitle': 'Key insights from this article',
    'aisummary.loading': 'Generating summary...',
    'aisummary.continue': 'View Results',
    'aisummary.find_related': 'Find Related Reading',
    'aisummary.finding': 'Searching...',
    'aisummary.related_title': 'Related Articles',
    'aisummary.add_read_later': 'Save',
    'aisummary.added': 'Saved',

    // Summary
    'summary.title': 'Session Complete!',
    'summary.score': 'Your Score',
    'summary.correct': 'correct',
    'summary.out_of': 'out of',
    'summary.mastery': 'Mastery',
    'summary.save': 'Save to Archive',
    'summary.saved': 'Saved!',
    'summary.restart': 'Learn Something New',
    'summary.review_again': 'Review Cards',

    // Archive
    'archive.title': 'Archive',
    'archive.tab.learned': 'Learned',
    'archive.tab.read_later': 'Read Later',
    'archive.empty': 'No sessions yet. Start learning!',
    'archive.read_later_empty': 'No saved articles yet.',
    'archive.score': 'Score',
    'archive.replay': 'Review',
    'archive.delete': 'Delete',
    'archive.source.url': 'URL',
    'archive.source.text': 'Text',
    'archive.source.pdf': 'PDF',
    'archive.open_link': 'Open',
    'archive.learn': 'Learn now',
    'archive.expand': 'Show key takeaways',
    'archive.collapse': 'Hide key takeaways',
    'archive.key_takeaways': 'Key Takeaways',
    'archive.no_takeaways': 'No key takeaways recorded.',
    'archive.takeaways_count': 'takeaways',
    'archive.queued': 'Queued',
    'archive.start': 'Start Learning',
    'archive.status.generating': 'Generating…',
    'archive.status.failed': 'Generation failed',
    'archive.mode.skim': 'Quick',
    'archive.mode.deep': 'Deep',

    // Chat
    'chat.toggle': 'Ask AI',
    'chat.placeholder': 'Ask anything about this article...',
    'chat.send': 'Send',
    'chat.thinking': 'Thinking...',
    'chat.label': 'AI Tutor · temporary',

    // Complete card
    'complete.title': 'Well done!',
    'complete.subtitle': 'You have completed all cards.',
    'complete.continue': 'See AI Summary',

    // Auth
    'auth.login_title': 'Welcome back',
    'auth.login_sub': 'Sign in to save your learning sessions',
    'auth.signup_title': 'Create account',
    'auth.signup_sub': 'Save and revisit your learning sessions',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.username_short': 'Username must be at least 2 characters.',
    'auth.password_short': 'Password must be at least 6 characters.',
    'auth.invalid': 'Incorrect username or password.',
    'auth.login_btn': 'Sign in',
    'auth.signup_btn': 'Create account',
    'auth.no_account': "Don't have an account? Sign up",
    'auth.has_account': 'Already have an account? Sign in',
    'auth.skip': 'Continue without account',
    'auth.logout': 'Sign out',
  },
  zh: {
    // Header
    'header.logo': 'MiniKnowledge',
    'header.archive': '学习记录',
    'header.generating': '生成中…',

    // Home
    'home.title': '把任何内容，变成几张精华卡片',
    'home.subtitle': '粘贴任意链接或文字，自动生成卡片、测验与 AI 解析。',
    'home.subtitle2': '几秒钟，开始学习。',
    'home.badge': 'AI 驱动学习',
    'home.tab.url': '链接',
    'home.tab.text': '文字',
    'home.tab.pdf': 'PDF',
    'home.url.placeholder': '粘贴文章链接...',
    'home.text.placeholder': '粘贴你想学习的任何文字...',
    'home.pdf.button': '选择 PDF 文件',
    'home.pdf.selected': '已选择：{name}',
    'home.pdf.notice': '仅支持文字版 PDF，扫描件暂不支持',
    'home.submit': '生成学习卡片',
    'home.submitting': '分析中...',
    'home.error.empty': '请输入链接或文字。',
    'home.error.fetch': '抓取文章失败，请直接粘贴文字内容。',
    'home.error.pdf_empty': '请选择一个 PDF 文件。',
    'home.error.pdf_parse': '无法提取文字，请确认是文字版 PDF，而非扫描图片。',
    'home.mode.skim': '略读',
    'home.mode.skim_desc': '核心概念 · 6–10 张',
    'home.mode.deep': '精读',
    'home.mode.deep_desc': '深度分析 · 12–20 张',

    // Loading
    'loading.step1': '获取内容中...',
    'loading.step2': '分析结构中...',
    'loading.step3': '生成学习卡片...',
    'loading.step4': '准备学习会话...',
    'loading.title': '正在为你构建学习体验',
    'loading.background': '去做别的吧，生成好了学习记录里会出现 →',

    // Learning
    'learning.progress': '第 {current} 张，共 {total} 张',
    'learning.next': '下一张',
    'learning.answer_first': '请先作答',
    'learning.correct': '回答正确！',
    'learning.wrong': '回答错误',
    'learning.true': '正确',
    'learning.false': '错误',
    'learning.tag.concept': '概念',
    'learning.tag.quiz': '测验',
    'learning.tag.review': '复习',
    'learning.tag.output': '总结',
    'learning.tag.trueFalse': '判断题',
    'learning.keypoints': '关键词',
    'learning.summary_label': '总结',

    // AI Summary
    'aisummary.title': 'AI 总结',
    'aisummary.subtitle': '本文核心洞察',
    'aisummary.loading': '正在生成总结...',
    'aisummary.continue': '查看结果',
    'aisummary.find_related': '找相关阅读',
    'aisummary.finding': '搜索中...',
    'aisummary.related_title': '相关文章',
    'aisummary.add_read_later': '保存',
    'aisummary.added': '已保存',

    // Summary
    'summary.title': '学习完成！',
    'summary.score': '你的得分',
    'summary.correct': '答对',
    'summary.out_of': '共',
    'summary.mastery': '掌握度',
    'summary.save': '保存到记录',
    'summary.saved': '已保存！',
    'summary.restart': '学习新内容',
    'summary.review_again': '回顾卡片',

    // Archive
    'archive.title': '学习记录',
    'archive.tab.learned': '已学',
    'archive.tab.read_later': '稍后阅读',
    'archive.empty': '暂无学习记录，开始学习吧！',
    'archive.read_later_empty': '暂无保存的文章。',
    'archive.score': '得分',
    'archive.replay': '回顾',
    'archive.delete': '删除',
    'archive.source.url': '链接',
    'archive.source.text': '文字',
    'archive.source.pdf': 'PDF',
    'archive.open_link': '打开',
    'archive.learn': '立即学习',
    'archive.expand': '展开要点',
    'archive.collapse': '收起要点',
    'archive.key_takeaways': '核心要点',
    'archive.no_takeaways': '暂无记录的要点。',
    'archive.takeaways_count': '个要点',
    'archive.queued': '待学习',
    'archive.start': '开始学习',
    'archive.status.generating': '生成中…',
    'archive.status.failed': '生成失败',
    'archive.mode.skim': '略读',
    'archive.mode.deep': '精读',

    // Chat
    'chat.toggle': '问 AI',
    'chat.placeholder': '对文章内容有疑问？直接问...',
    'chat.send': '发送',
    'chat.thinking': '思考中...',
    'chat.label': 'AI 助教 · 临时对话',

    // Complete card
    'complete.title': '太棒了！',
    'complete.subtitle': '你已完成所有卡片。',
    'complete.continue': '查看 AI 总结',

    // Auth
    'auth.login_title': '欢迎回来',
    'auth.login_sub': '登录以保存你的学习记录',
    'auth.signup_title': '创建账号',
    'auth.signup_sub': '保存并回顾你的学习历程',
    'auth.username': '用户名',
    'auth.password': '密码',
    'auth.username_short': '用户名至少需要 2 个字符。',
    'auth.password_short': '密码至少需要 6 位。',
    'auth.invalid': '用户名或密码错误。',
    'auth.login_btn': '登录',
    'auth.signup_btn': '注册',
    'auth.no_account': '没有账号？立即注册',
    'auth.has_account': '已有账号？立即登录',
    'auth.skip': '先不登录，直接使用',
    'auth.logout': '退出登录',
  },
}

export function t(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const map = translations[lang] as Record<string, string>
  let str = map[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v))
    }
  }
  return str
}

export type I18nKey = keyof typeof translations.en
