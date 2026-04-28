import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey?.trim()) {
    return NextResponse.json(
      {
        error:
          'GEMINI_API_KEY가 설정되어 있지 않습니다. .env.local에 키를 추가해 주세요.',
      },
      { status: 500 }
    )
  }

  let body: { title?: string; content?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 })
  }

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''

  if (!content) {
    return NextResponse.json(
      { error: '메모 본문이 비어 있어 요약할 수 없습니다.' },
      { status: 400 }
    )
  }

  const prompt = `당신은 한국어 메모를 간결하게 요약하는 도우미입니다.

아래는 사용자가 작성한 메모입니다. 제목과 본문(마크다운일 수 있음)을 읽고 한국어로만 답변하세요.

제목: ${title || '(제목 없음)'}

본문:
---
${content}
---

다음 마크다운 구조를 반드시 지키세요:

## 핵심 요약
(핵심을 2~3문장으로)

## 중요 포인트
- (최대 3개)

## 후속 제안
- (필요할 때만 1~2개, 없으면 "특별히 없음" 한 줄)`

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    })

    const text = response.text?.trim()
    if (!text) {
      return NextResponse.json(
        { error: '요약 텍스트를 받지 못했습니다.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ summary: text })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : '요약 요청 처리 중 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
