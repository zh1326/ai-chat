<script setup lang="ts">
import { Expand, Fold } from '@element-plus/icons-vue'
import { useGlobalStore } from '@/stores/global'
import type { ChatItem } from '@/interface/chat'
import { SceneType } from '@/interface/scene'

const props = defineProps<{
  curSession?: ChatItem
  curSessionId?: string
}>()

console.log('props.curSessionId', props.curSessionId)
console.log('props.curSession', props.curSession)

const globalStore = useGlobalStore()

const handleToggle = (e: MouseEvent) => {
  e.stopPropagation()
  globalStore.toggle(!globalStore.sidebarOpened)
}

const TitleType = {
  [SceneType.CONSULTATION]: '咨询类',
  [SceneType.GENERATION]: '生成类'
}
</script>

<template>
  <div class="header-wrap">
    <el-button :icon="globalStore.sidebarOpened ? Fold : Expand" @click="handleToggle" />
    <div class="title">
      <h1>
        {{
          props.curSessionId && props.curSession
            ? `${props.curSession.name} - ${TitleType[props.curSession.scene_type]}`
            : '新对话'
        }}
      </h1>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '../utils/utils.scss';

.header-wrap {
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
  .title {
    flex: 1;
    display: flex;
    justify-content: center;
    padding-right: 44px;
    h1 {
      max-width: 50%;
      font-size: 16px;
      font-weight: bold;
      margin-left: 8px;
      text-align: center;
      margin: 0;
      @include textOverflow();
    }
  }
}
</style>
