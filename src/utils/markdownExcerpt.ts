/**
 * 카드 목록 등에서 마크다운 문법을 제거한 짧은 평문 미리보기용.
 * 완전한 파서가 아니라 가독성 위주의 단순 처리입니다.
 */
export function markdownToPlainExcerpt(
  markdown: string,
  maxLength = 160
): string {
  if (!markdown.trim()) return ''

  let t = markdown
  t = t.replace(/```[\s\S]*?```/g, ' ')
  t = t.replace(/`([^`]+)`/g, '$1')
  t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  t = t.replace(/^#{1,6}\s+/gm, '')
  t = t.replace(/\*{2}([^*]+)\*{2}/g, '$1')
  t = t.replace(/\*([^*\n]+)\*/g, '$1')
  t = t.replace(/[_~`#|[\]()]/g, ' ')
  t = t.replace(/\s+/g, ' ').trim()

  if (t.length <= maxLength) return t
  return `${t.slice(0, maxLength)}…`
}
