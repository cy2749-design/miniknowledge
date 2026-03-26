export async function fetchArticle(url: string): Promise<{ title: string; text: string }> {
  const res = await fetch('/api/fetch-article', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) {
    throw new Error('Failed to fetch article')
  }
  return res.json()
}
