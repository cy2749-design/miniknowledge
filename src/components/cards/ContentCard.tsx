import type { ContentCard as ContentCardType } from '../../types'

interface Props {
  card: ContentCardType
}

const tagColors: Record<string, string> = {
  tagConcept: 'bg-blue-100 text-blue-700',
  tagQuiz: 'bg-amber-100 text-amber-700',
  tagReview: 'bg-purple-100 text-purple-700',
  tagOutput: 'bg-green-100 text-green-700',
}

export default function ContentCard({ card }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <span className={`self-start px-2.5 py-0.5 rounded-full text-xs font-semibold ${tagColors[card.tagCls] ?? 'bg-gray-100 text-gray-600'}`}>
        {card.tag}
      </span>
      <h2 className="text-xl font-bold text-gray-900 leading-snug">{card.title}</h2>
      <div
        className="text-gray-700 text-base leading-relaxed prose prose-sm max-w-none [&_.kblock]:bg-blue-50 [&_.kblock]:text-blue-800 [&_.kblock]:px-1 [&_.kblock]:rounded [&_.kblock]:font-medium"
        dangerouslySetInnerHTML={{ __html: card.html }}
      />
    </div>
  )
}
