<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TopHeader from '@/components/TopHeader.vue'
import LeftSide from '@/components/LeftSide.vue'
import MainChat from '@/components/MainChat.vue'
import { useGlobalStore } from '@/stores/global'
import {
  useChatDeleteApi,
  useChatDetailApi,
  useChatEditNameApi,
  useChatListApi,
  useConversationsLikeApi,
  useNewChatApi
} from '@/api/chat'
import { useSceneListApi } from '@/api/scene'
import type { ChatItem, ChatRouteQuery } from '@/interface/chat'
import type { SceneItem } from '@/interface/scene'
import { ElMessage } from 'element-plus'

const globalStore = useGlobalStore()
const { query } = useRoute()
const router = useRouter()

const curSessionId = ref((query as ChatRouteQuery).id || '')
const curSession = ref<ChatItem>()
const chatList = ref<ChatItem[]>([])
const sceneList = ref<SceneItem[]>([])
const loading = ref(false)

console.log('curSessionId', curSessionId.value)

const reset = () => {
  curSessionId.value = ''
  curSession.value = undefined
}

const handleSessionClick = (id: string) => {
  curSessionId.value = id
  const selected = chatList.value.find((item) => item.session_id === id)

  curSession.value = selected
  router.push({ path: '/chat', query: { id } })
}

const queryChatList = async (sessionId: string) => {
  loading.value = true
  const res = await useChatListApi()
  if (res) {
    chatList.value = res
    const cur = chatList.value.find((item) => item.session_id === sessionId)
    curSession.value = cur
  }
  loading.value = false
}

const searchChatList = async (q: string) => {
  const res = await useChatListApi(q)
  if (res) {
    chatList.value = res
  }
}

const queryChatDetail = async (sessionId: string) => {
  loading.value = true
  const res = await useChatDetailApi(sessionId)
  loading.value = false
  return res
}

const removeChat = async (sessionId: string) => {
  const res = await useChatDeleteApi(sessionId)
  if (res) {
    queryChatList(curSessionId.value)
    if (sessionId === curSessionId.value) {
      router.push({ path: '/chat' })
      reset()
    }
  }
  return res
}

const renameChat = async (sessionId: string, name: string) => {
  const res = await useChatEditNameApi(sessionId, name)
  if (res) {
    queryChatList(curSessionId.value)
  }
  return res
}

const querySceneList = async () => {
  const res = await useSceneListApi()
  res && (sceneList.value = res)
}

const getNewChat = async (sceneId: number) => {
  loading.value = true
  const res = await useNewChatApi(sceneId)
  loading.value = false
  if (res && res.session_id) {
    curSessionId.value = res.session_id
    await queryChatList(res.session_id)
    router.push({ path: '/chat', query: { id: res.session_id } })
  }
}

const ratingConversation = async (convId: number, like: boolean) => {
  if (curSession.value?.session_id) {
    const data = {
      sessionId: curSession.value?.session_id,
      convId: convId,
      like: like
    }
    const res = await useConversationsLikeApi(data)
    if (res) {
      ElMessage.success('评价成功')
    }
  }
}

const initWindow = () => {
  if (window.innerWidth <= 768) {
    globalStore.setIsMobile(true)
    globalStore.toggle(false)
  } else {
    globalStore.setIsMobile(false)
    globalStore.toggle(true)
  }
}

const handleResize = () => {
  if (window.innerWidth <= 768) {
    globalStore.setIsMobile(true)
  } else {
    globalStore.setIsMobile(false)
  }
}

const handleBodyClick = () => {
  if (globalStore.isMobile) {
    globalStore.toggle(false)
  }
}

onMounted(() => {
  handleResize()
  initWindow()
  queryChatList(curSessionId.value)
  querySceneList()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <main class="common-layout">
    <el-container class="body-content" :class="globalStore.sidebarOpened ? 'sidebar-open' : ''">
      <el-aside>
        <left-side
          :sidebarOpened="globalStore.sidebarOpened"
          :isMobile="globalStore.isMobile"
          :chatList="chatList"
          :curSessionId="curSessionId"
          :searchChatList="searchChatList"
          :removeChat="removeChat"
          :renameChat="renameChat"
          @handleSessionClick="handleSessionClick"
          @reset="reset"
        />
      </el-aside>

      <el-container class="main-content" @click="handleBodyClick" v-loading="loading">
        <el-header>
          <top-header :curSessionId="curSessionId" :curSession="curSession" />
        </el-header>
        <el-main>
          <main-chat
            :curSessionId="curSessionId"
            :queryChatDetail="queryChatDetail"
            :getNewChat="getNewChat"
            :ratingConversation="ratingConversation"
            :sceneList="sceneList"
          />
        </el-main>
      </el-container>
    </el-container>
  </main>
</template>

<style scoped>
.body-content {
  position: relative;
  .el-aside {
    width: 0px;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-right: 1px solid rgba(5, 5, 5, 0.06);
    height: 100vh;
  }
  .main-content {
    max-height: 100vh;
    overflow: hidden;
    position: relative;
  }
  .el-header {
    --el-header-height: auto;
    --el-header-padding: 16px 20px;
    backdrop-filter: blur(8px);
    border-block-end: 1px solid rgba(5, 5, 5, 0.06);
    /* box-shadow: 1px 1px 3px rgba(5, 5, 5, 0.06); */
    background-color: rgba(255, 255, 255, 0.6);
  }
  .el-main {
    overflow-y: auto;
    background: #f4f4f4;
  }
  &.sidebar-open {
    .el-aside {
      width: var(--left-width);
    }
  }
}

.mobile-bg {
  display: none;
}

@media (max-width: 768px) {
  .body-content {
    .el-aside {
      position: absolute;
      left: -260px;
      /* left: calc(0 - var(--left-width)); */
      z-index: 1;
      background: #fff;
    }
    .main-content {
      min-height: 100vh;
      &::before {
        width: 100vw;
        height: 100vh;
        position: absolute;
        content: '';
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0);
        transition: background 0.3s ease;
        display: none;
      }
    }
    &.sidebar-open {
      .el-aside {
        left: 0;
      }
      .main-content {
        &::before {
          background: rgba(0, 0, 0, 0.3);
          display: block;
        }
      }
    }
  }
}
</style>
