import { Memo, MemoFormData } from '@/types/memo'
import { Tables, TablesInsert, TablesUpdate } from '@/types/database'

type MemoRow = Tables<'memos'>

export function dbRowToMemo(row: MemoRow): Memo {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function memoFormDataToInsert(data: MemoFormData): TablesInsert<'memos'> {
  return {
    title: data.title,
    content: data.content,
    category: data.category,
    tags: data.tags,
  }
}

export function memoFormDataToUpdate(data: MemoFormData): TablesUpdate<'memos'> {
  return {
    title: data.title,
    content: data.content,
    category: data.category,
    tags: data.tags,
  }
}
