'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'

const MarkdownViewer = dynamic(() => import('./MarkdownViewer'), {
  ssr: false,
  loading: () => (
    <p className="text-gray-500 text-sm animate-pulse">본문을 불러오는 중...</p>
  ),
})

interface MemoDetailModalProps {
  memo: Memo | null
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void | Promise<void>
}

export default function MemoDetailModal({
  memo,
  onClose,
  onEdit,
  onDelete,
}: MemoDetailModalProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  useEffect(() => {
    if (!memo) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [memo, onClose])

  useEffect(() => {
    setSummary(null)
    setSummaryError(null)
    setSummaryLoading(false)
  }, [memo?.id])

  const handleSummarize = useCallback(async () => {
    if (!memo || summaryLoading) return
    const trimmed = memo.content.trim()
    if (!trimmed) return

    setSummaryLoading(true)
    setSummaryError(null)

    try {
      const res = await fetch('/api/memos/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: memo.title,
          content: memo.content,
        }),
      })

      let data: { summary?: string; error?: string }
      try {
        data = await res.json()
      } catch {
        setSummaryError('서버 응답을 해석할 수 없습니다.')
        return
      }

      if (!res.ok) {
        setSummaryError(
          typeof data.error === 'string' ? data.error : '요약에 실패했습니다.'
        )
        return
      }

      if (typeof data.summary === 'string' && data.summary.trim()) {
        setSummary(data.summary.trim())
      } else {
        setSummaryError('요약 결과가 비어 있습니다.')
      }
    } catch {
      setSummaryError('네트워크 오류가 발생했습니다.')
    } finally {
      setSummaryLoading(false)
    }
  }, [memo, summaryLoading])

  if (!memo) return null

  const handleBackdropClick = () => {
    onClose()
  }

  const handlePanelClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleEditClick = () => {
    onEdit(memo)
    onClose()
  }

  const handleDeleteClick = () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
      onClose()
    }
  }

  const categoryLabel =
    MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
    memo.category

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="presentation"
      onClick={handleBackdropClick}
      data-testid="memo-detail-modal-backdrop"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="memo-detail-title"
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={handlePanelClick}
        data-testid="memo-detail-modal-panel"
      >
        <div className="p-6">
          <div className="flex justify-between items-start gap-4 mb-4">
            <h2
              id="memo-detail-title"
              className="text-xl font-semibold text-gray-900 flex-1 break-words"
            >
              {memo.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(memo.category)}`}
            >
              {categoryLabel}
            </span>
            <span className="text-xs text-gray-500">
              작성 {formatDate(memo.createdAt)}
            </span>
            <span className="text-xs text-gray-500">
              수정 {formatDate(memo.updatedAt)}
            </span>
          </div>

          <section
            className="mb-6 rounded-lg border border-indigo-100 bg-indigo-50/60 p-4"
            aria-labelledby="memo-ai-summary-heading"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h3
                id="memo-ai-summary-heading"
                className="text-sm font-semibold text-indigo-900"
              >
                AI 요약 (Gemini)
              </h3>
              <button
                type="button"
                onClick={handleSummarize}
                disabled={
                  summaryLoading || !memo.content.trim()
                }
                className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                aria-busy={summaryLoading}
                data-testid="memo-detail-summarize-btn"
              >
                {summaryLoading ? '요약 생성 중…' : 'AI 요약 생성'}
              </button>
            </div>

            {summaryError && (
              <p
                className="mb-2 text-sm text-red-700"
                role="alert"
                data-testid="memo-detail-summary-error"
              >
                {summaryError}
              </p>
            )}

            {summary && (
              <div
                className="rounded-md border border-white bg-white p-3 text-sm shadow-sm"
                data-testid="memo-detail-summary-body"
              >
                <MarkdownViewer source={summary} />
              </div>
            )}

            {!summary && !summaryError && !summaryLoading && (
              <p className="text-xs text-indigo-800/80">
                버튼을 눌러 현재 메모를 Gemini가 요약합니다. API 키가 필요합니다.
              </p>
            )}
          </section>

          <div
            className="mb-6 min-h-[4rem]"
            data-testid="memo-detail-markdown"
          >
            <h3 className="mb-2 text-sm font-medium text-gray-700">본문</h3>
            <MarkdownViewer source={memo.content} />
          </div>

          {memo.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-6">
              {memo.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3 justify-end border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleDeleteClick}
              className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              data-testid="memo-detail-delete-btn"
            >
              삭제
            </button>
            <button
              type="button"
              onClick={handleEditClick}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              data-testid="memo-detail-edit-btn"
            >
              편집
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
