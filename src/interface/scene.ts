export enum SceneType {
  /** 咨询类 */
  CONSULTATION = 'consultation',
  /** 生成类 */
  GENERATION = 'generation'
}

export interface SceneItem {
  /** 场景ID */
  id: number
  /** 场景名称 */
  name: string
  /** 场景类型 */
  stype: SceneType
  /** 场景描述 */
  description: string
  /** 场景引导问题 */
  guidelines: string[]
}
