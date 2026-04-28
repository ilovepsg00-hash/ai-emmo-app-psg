'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { dbRowToMemo, memoFormDataToInsert, memoFormDataToUpdate } from '@/lib/supabase/memoMapper'
import { Memo, MemoFormData } from '@/types/memo'

export async function getMemosAction(): Promise<Memo[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(dbRowToMemo)
}

export async function createMemoAction(formData: MemoFormData): Promise<Memo> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('memos')
    .insert(memoFormDataToInsert(formData))
    .select()
    .single()

  if (error) throw new Error(error.message)
  return dbRowToMemo(data)
}

export async function updateMemoAction(id: string, formData: MemoFormData): Promise<Memo> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('memos')
    .update(memoFormDataToUpdate(formData))
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return dbRowToMemo(data)
}

export async function deleteMemoAction(id: string): Promise<void> {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from('memos').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function clearAllMemosAction(): Promise<void> {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from('memos').delete().neq('id', '')
  if (error) throw new Error(error.message)
}

export async function seedMemosIfEmptyAction(): Promise<boolean> {
  const supabase = createSupabaseServerClient()
  const { count, error: countError } = await supabase
    .from('memos')
    .select('*', { count: 'exact', head: true })

  if (countError) throw new Error(countError.message)
  if ((count ?? 0) > 0) return false

  const seedData: MemoFormData[] = [
    {
      title: '프로젝트 회의 준비',
      content:
        '다음 주 월요일 오전 10시 프로젝트 킥오프 미팅을 위한 준비사항:\n\n- 프로젝트 범위 정의서 작성\n- 팀원별 역할 분담\n- 일정 계획 수립\n- 필요한 리소스 정리',
      category: 'work',
      tags: ['회의', '프로젝트', '준비'],
    },
    {
      title: 'React 18 새로운 기능 학습',
      content:
        'React 18에서 새로 추가된 기능들을 학습해야 함:\n\n1. Concurrent Features\n2. Automatic Batching\n3. Suspense 개선사항\n4. useId Hook\n5. useDeferredValue Hook\n\n이번 주말에 공식 문서를 읽고 간단한 예제를 만들어보자.',
      category: 'study',
      tags: ['React', '학습', '개발'],
    },
    {
      title: '새로운 앱 아이디어: 습관 트래커',
      content:
        '매일 실천하고 싶은 습관들을 관리할 수 있는 앱:\n\n핵심 기능:\n- 습관 등록 및 관리\n- 일일 체크인\n- 진행 상황 시각화\n- 목표 달성 알림\n- 통계 분석\n\n기술 스택: React Native + Supabase\n출시 목표: 3개월 후',
      category: 'idea',
      tags: ['앱개발', '습관', 'React Native'],
    },
  ]

  const { error: insertError } = await supabase
    .from('memos')
    .insert(seedData.map(memoFormDataToInsert))

  if (insertError) throw new Error(insertError.message)
  return true
}
