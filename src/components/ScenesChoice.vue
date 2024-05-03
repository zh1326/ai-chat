<script setup lang="ts">
import { ChatDotSquare } from '@element-plus/icons-vue'
import type { SceneItem } from '@/interface/scene'

const props = defineProps<{
  sceneList?: SceneItem[]
  getNewChat: (sceneId: number) => void
}>()

// const emit = defineEmits<{
//   getNewChat: [sceneId: number]
// }>()

const handleClick = (sceneId: number) => {
  // emit('getNewChat', sceneId)
  props.getNewChat(sceneId)
}
</script>

<template>
  <div class="scenes-choice-wrap" v-if="props.sceneList?.map">
    <div class="scene-list">
      <div
        v-for="item in props.sceneList"
        :key="item.id"
        class="scene-item"
        @click="handleClick(item.id)"
      >
        <div class="icon">
          <el-icon><ChatDotSquare /></el-icon>
        </div>
        <div class="body">
          <div class="title">{{ item.name }}</div>
          <div class="desc">{{ item.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scenes-choice-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .scene-list {
    .scene-item {
      max-width: 300px;
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 12px 32px;
      margin-bottom: 15%;
      /* border: 1px solid var(--color-primary); */
      border-radius: 100px;
      background: var(--color-primary-hover);
      &:last-child {
        margin-bottom: 5%;
      }
      &::after {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        content: '';
        border-radius: 100px;
        border: 1px solid var(--color-primary);
        transition: all 0.3s ease;
      }
      &:hover {
        /* background: var(--color-primary-hover); */
        &::after {
          border: 2px solid var(--color-primary);
        }
      }
      &:active {
        opacity: 0.7;
        top: 1px;
      }
      .icon {
        font-size: 32px;
        color: var(--color-primary);
        display: flex;
        align-items: center;
        margin-right: 12px;
      }
      .body {
        .title {
          font-size: 18px;
          line-height: 1;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .desc {
          font-size: 14px;
          color: var(--color-second);
        }
      }
    }
  }
}
</style>
