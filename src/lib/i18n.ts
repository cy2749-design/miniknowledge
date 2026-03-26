import type { Lang } from '../types'

const translations = {
  en: {
    // Header
    'header.logo': 'MiniKnowledge',
    'header.archive': 'Archive',

    // Home
    'home.title': 'Learn Anything, Deeply.',
    'home.subtitle': 'Paste a URL or text. Get a structured learning experience with cards, quizzes, and deep dives.',
    'home.tab.url': 'URL',
    'home.tab.text': 'Text',
    'home.url.placeholder': 'Paste an article URL...',
    'home.text.placeholder': 'Paste any text you want to learn from...',
    'home.submit': 'Generate Learning Cards',
    'home.submitting': 'Analyzing...',
    'home.error.empty': 'Please enter a URL or some text.',
    'home.error.fetch': 'Failed to fetch article. Try pasting the text directly.',

    // Loading
    'loading.step1': 'Fetching content...',
    'loading.step2': 'Analyzing structure...',
    'loading.step3': 'Creating learning cards...',
    'loading.step4': 'Preparing your session...',
    'loading.title': 'Building your learning experience',

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

    // Deeper
    'deeper.title': 'Deeper Understanding',
    'deeper.subtitle': 'A richer explanation of the core concepts',
    'deeper.continue': 'See Real-World Examples',
    'deeper.loading': 'Generating deeper explanation...',

    // Examples
    'examples.title': 'Real-World Examples',
    'examples.subtitle': 'How these concepts apply in practice',
    'examples.continue': 'View My Results',
    'examples.loading': 'Generating examples...',

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
    'archive.title': 'Learning Archive',
    'archive.empty': 'No sessions yet. Start learning!',
    'archive.score': 'Score',
    'archive.replay': 'Review',
    'archive.delete': 'Delete',
    'archive.source.url': 'URL',
    'archive.source.text': 'Text',

    // Complete card
    'complete.title': 'Well done!',
    'complete.subtitle': 'You have completed all cards.',
    'complete.continue': 'See Deeper Explanation',
  },
  zh: {
    // Header
    'header.logo': 'MiniKnowledge',
    'header.archive': '学习记录',

    // Home
    'home.title': '深度学习任何知识',
    'home.subtitle': '粘贴链接或文字，获得结构化的卡片学习体验，包含测验和深度解析。',
    'home.tab.url': '链接',
    'home.tab.text': '文字',
    'home.url.placeholder': '粘贴文章链接...',
    'home.text.placeholder': '粘贴你想学习的任何文字...',
    'home.submit': '生成学习卡片',
    'home.submitting': '分析中...',
    'home.error.empty': '请输入链接或文字。',
    'home.error.fetch': '抓取文章失败，请直接粘贴文字内容。',

    // Loading
    'loading.step1': '获取内容中...',
    'loading.step2': '分析结构中...',
    'loading.step3': '生成学习卡片...',
    'loading.step4': '准备学习会话...',
    'loading.title': '正在为你构建学习体验',

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

    // Deeper
    'deeper.title': '深度理解',
    'deeper.subtitle': '对核心概念更丰富的解释',
    'deeper.continue': '查看实际案例',
    'deeper.loading': '正在生成深度解析...',

    // Examples
    'examples.title': '实际案例',
    'examples.subtitle': '这些概念在现实中的应用',
    'examples.continue': '查看学习结果',
    'examples.loading': '正在生成案例...',

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
    'archive.empty': '暂无学习记录，开始学习吧！',
    'archive.score': '得分',
    'archive.replay': '回顾',
    'archive.delete': '删除',
    'archive.source.url': '链接',
    'archive.source.text': '文字',

    // Complete card
    'complete.title': '太棒了！',
    'complete.subtitle': '你已完成所有卡片。',
    'complete.continue': '查看深度解析',
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
