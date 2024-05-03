import type { SceneType } from './scene'

export enum Role {
  /** 用户 */
  USER = 'user',
  /** 机器人 */
  ASSISTANT = 'assistant',
  /** 系统 */
  SYSTEM = 'system'
}

/** 对话对象 */
export interface Conversations {
  /** 聊天 ID */
  id: number
  /** 角色 */
  role: Role
  /** 内容 */
  message: string
  /** 对话时间，时间戳 */
  date: number
  /** ? */
  template_id?: string
}

/** 历史会话对象 */
export interface ChatItem {
  /** 会话ID */
  session_id: string
  /** 会话名称 */
  name: string
  /** 场景ID */
  scene_id: string
  /** 场景名称 */
  scene_name: string
  /** 场景类型 */
  scene_type: SceneType
  /** 对话内容列表, 会话列表接口此项为空 */
  conversations?: Conversations[]
  /** 创建时间戳 */
  created_at: number
  /** 更新时间戳 */
  updated_at: number
}

export interface ChatRouteQuery {
  id?: string
}

export enum UploadType {
  /** 模板文件 */
  TEMPLATE = 1,
  /** 参考文件 */
  REFERENCE = 2,
  /** 参考 URL */
  URL = 3
}

export interface UploadFileItem {
  id?: string
  url?: string
  type: UploadType
}

export interface HandleUploadTemplateParams {
  type: UploadType.TEMPLATE
  val: string
}

export interface HandleUploadReferenceParams {
  type: UploadType.REFERENCE | UploadType.URL
  val: string[]
}

export type HandleUploadParams = HandleUploadTemplateParams | HandleUploadReferenceParams

export interface SubmitNewChatParams {
  /** 内容，用于自动创建 session 会话名称 */
  message: string
}

export interface NewChatRes {
  /** 会话ID */
  session_id: string
  /** 会话名称 */
  name: string
  /** 场景ID */
  scene_id: string
  /** 场景名称 */
  scene_name: string
  /** 场景类型 */
  scene_type: SceneType
  /** 创建时间戳 */
  created_at: number
  /** 更新时间戳 */
  updated_at: number
}

export interface SubmitMessageParams {
  /** 内容 */
  message: string
  /** 模板文件id */
  template_file_id?: string
  /** 参考文件id列表，最多两个 */
  reference_file_ids?: string[]
  /** 参考资料url列表，最多两个 */
  reference_urls?: string[]
}

export interface StreamContent {
  /** 角色，user/assistant/system */
  role: Role
  message: string
}

export interface ChatMessageRes {
  id: number
  delta: StreamContent
}
