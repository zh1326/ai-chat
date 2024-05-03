export interface UserItem {
  userid: string
  username: string
  email: string
  phone: string
  last_login_at: number
}

export interface UserState {
  user: UserItem | null
  isLogin?: boolean
  token: string | null
  refreshToken: string | null
}
