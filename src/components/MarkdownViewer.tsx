'use client'

import MarkdownPreview from '@uiw/react-markdown-preview'

interface MarkdownViewerProps {
  source: string
}

export default function MarkdownViewer({ source }: MarkdownViewerProps) {
  return (
    <div data-color-mode="light">
      <MarkdownPreview
        source={source}
        disableCopy
        disallowedElements={['style', 'script']}
        wrapperElement={{ 'data-color-mode': 'light' }}
      />
    </div>
  )
}
