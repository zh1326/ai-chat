import service from '@/utils/request'
import type { SceneItem } from '@/interface/scene'

/** 获取场景列表 */
export const useSceneListApi = () => {
  return service.get<null, SceneItem[]>('/api/scenes/')
}
