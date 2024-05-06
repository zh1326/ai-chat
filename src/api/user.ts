import type { UserItem } from '@/interface/user'
import service from '@/utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResp {
  token: string
}

export interface PasswordChangeParams {
  old_password: string
  new_password: string
  confirm_password: string
}

export const useLoginApi = (data: LoginParams) => {
  return service.post<LoginParams, LoginResp>('/api/user/login/', data)
}

export const useLogoutApi = () => {
  return service.post<null, string>('/api/user/logout/')
}

export const useUserInfoApi = () => {
  return service.get<null, UserItem>('/api/user/info/')
}

export const usePasswordChangeApi = (data: PasswordChangeParams) => {
  return service.put<PasswordChangeParams, string>('/api/user/change_password/', data)
}
