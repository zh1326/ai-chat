import qs from 'qs'
import type { ChatItem, NewChatRes } from '@/interface/chat'
import service from '@/utils/request'

/** 获取历史对话列表 */
export const useChatListApi = (q?: string) => {
  let query = ''
  if (q) {
    query = qs.stringify({ q })
  }
  console.log('query', query)
  return service.get<null, ChatItem[]>(`/api/chats/sessions/?${query}`)
}

export const useChatDetailApi = (sessionId: string) => {
  return service.get<null, ChatItem>(`/api/chats/sessions/${sessionId}/`)
}

export const useChatDeleteApi = (sessionId: string) => {
  return service.delete<null, string>(`/api/chats/sessions/${sessionId}/`)
}

export const useChatEditNameApi = (sessionId: string, name: string) => {
  const data = { name }
  return service.patch<{ name: string }, string>(`/api/chats/sessions/${sessionId}/`, data)
}

/** 新建会话，获取 Session */
export const useNewChatApi = (sceneId: number) => {
  return service.post<null, NewChatRes>(`/api/chats/${sceneId}/`)
}

export const useConversationsLikeApi = ({
  sessionId,
  convId,
  like
}: {
  sessionId: string
  convId: number
  like: boolean
}) => {
  const data = { like }
  return service.put<{ name: string }, string>(
    `/api/chats/sessions/${sessionId}/conversations/${convId}/`,
    data
  )
}
