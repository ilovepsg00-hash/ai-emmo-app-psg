# 마크다운 뷰어 및 편집 기능 추가 계획

프로젝트 루트 기준 경로로 정리한 계획·결과 문서입니다. (구현 완료)

## 구현 범위

- 의존성: [`package.json`](../../package.json)에 `@uiw/react-md-editor` 추가
- 스타일: [`src/app/layout.tsx`](../../src/app/layout.tsx)에서 `@uiw/react-md-editor/markdown-editor.css`, `@uiw/react-markdown-preview/markdown.css` 전역 로드
- 편집기: [`src/components/MemoForm.tsx`](../../src/components/MemoForm.tsx) 본문을 `MDEditor`로 교체
- 뷰어: [`src/components/MemoDetailModal.tsx`](../../src/components/MemoDetailModal.tsx) 본문을 `MDEditor.Markdown` 렌더링으로 교체

## Context7 확인 내용

- 라이브러리 ID: `/uiwjs/react-md-editor`
- Next.js에서는 `dynamic(() => import('@uiw/react-md-editor'), { ssr: false })` 패턴 사용
- 편집기는 `value` / `onChange` 제어, `preview="live"`로 편집 영역과 프리뷰 동시 표시
- 읽기 전용 표시는 `MDEditor.Markdown`의 `source` prop 사용

## 세부 계획

- `MemoForm`에서 `next/dynamic`으로 `MDEditor` 클라이언트 전용 로드
- `Memo.content: string` 저장 구조 유지 (마크다운 문자열 그대로 LocalStorage 저장, 마이그레이션 불필요)
- `MDEditor` `onChange`는 `value ?? ''`로 정규화
- 작성/편집 기본 모드 `preview="live"`로 실시간 프리뷰
- `textareaProps`에 placeholder 및 접근성 라벨 연결
- 상세 모달에서 `MDEditor.Markdown`으로 마크다운 문법 렌더링

## 검증 계획

- `npm install @uiw/react-md-editor` 후 lockfile 확인
- `npm run lint`
- `npm run build`
- 수동 확인: 새 메모 live preview, 기존 메모 편집, 상세 모달 렌더링, 저장/수정/삭제 유지
