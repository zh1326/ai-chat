<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source'
import dayjs from 'dayjs'
import qs from 'qs'
import { ElMessage } from 'element-plus'
import { DocumentCopy, Link, Document, Files, Promotion, Close } from '@element-plus/icons-vue'
import useClipboard from 'vue-clipboard3'
import VueMarkdown from 'vue-markdown-render'
import highlight from 'markdown-it-highlightjs'
import { SceneType, type SceneItem } from '@/interface/scene'
import {
  Role,
  UploadType,
  type ChatItem,
  type ChatMessageRes,
  type HandleUploadParams,
  type SubmitMessageParams,
  type UploadFileItem
} from '@/interface/chat'
import { FatalError, RetriableError } from '@/utils/error'
import { useUserStore } from '@/stores/user'
import ScenesChoice from './ScenesChoice.vue'
import UploadTemplate from './UploadTemplate.vue'
import UploadReference from './UploadReference.vue'
// import 'highlight.js/styles/github.css'
import 'highlight.js/styles/monokai.css'

const plugins = [highlight]

const userStore = useUserStore()

const props = defineProps<{
  curSessionId?: string
  sceneList?: SceneItem[]
  getNewChat: (sceneId: number) => void
  queryChatDetail: (id: string) => Promise<ChatItem>
  ratingConversation: (convId: number, like: boolean) => void
}>()

const newContent = ref('')
const chatDetail = ref<ChatItem>()
const uploadFileListTemplate = ref<UploadFileItem[]>([])
const uploadFileListReference = ref<UploadFileItem[]>([])
const uploadFileListUrl = ref<UploadFileItem[]>([])

const { toClipboard } = useClipboard()

const handleCopy = async (msg: string) => {
  try {
    // 复制
    await toClipboard(msg)
    ElMessage({
      message: '内容已复制到剪切板',
      type: 'success'
    })
  } catch (e) {
    console.error('copy err: ', e)
  }
}

const queryChatDetail = async (id?: string) => {
  if (id) {
    const res = await props.queryChatDetail(id)
    chatDetail.value = res
  } else {
    chatDetail.value = undefined
  }
}

const handleUploadSuccess = ({ type, val }: HandleUploadParams) => {
  if (type === UploadType.TEMPLATE) {
    const data = { type, id: val }
    uploadFileListTemplate.value = [data]
  } else if (type === UploadType.REFERENCE) {
    const data: UploadFileItem[] = val.map((item) => ({ id: item, type }))
    uploadFileListReference.value = data
  } else if (type === UploadType.URL) {
    const data: UploadFileItem[] = val.map((item) => ({ url: item, type }))
    uploadFileListUrl.value = data
  }
}

const handleDeleteUploadFile = (index: number, type: UploadType) => {
  if (type === UploadType.TEMPLATE) {
    uploadFileListTemplate.value.splice(index, 1)
  } else if (type === UploadType.REFERENCE) {
    uploadFileListReference.value.splice(index, 1)
  } else if (type === UploadType.URL) {
    uploadFileListUrl.value.splice(index, 1)
  }
}

const listenerNewMessage = async (sessionId: string, data: SubmitMessageParams) => {
  console.log('listenerNewMessage data', data)

  const url = `/api/chats/sessions/completion/${sessionId}/`
  // config.headers.authorization = 'Bearer  ' + userStore.token

  let eventSource = fetchEventSource(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer  ${userStore.token}`
    },
    body: JSON.stringify(data),
    async onopen(response) {
      if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
        console.log('连接建立')
        chatDetail.value?.conversations?.push({
          id: Number(new Date()),
          message: newContent.value,
          role: Role.USER,
          date: Number(new Date())
        })
        return
      } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new FatalError('链接错误')
      } else {
        throw new RetriableError('error')
      }
    },
    onmessage(msg) {
      if (msg.event === 'FatalError') {
        throw new Error(msg.data)
      }
      console.info('msg.data', msg.data)
      const msgData = JSON.parse(msg.data) as ChatMessageRes
      console.log('收到消息: msgData', msgData)
      const message = msgData?.delta?.message
      if (chatDetail.value?.conversations?.length) {
        const lastData = chatDetail.value.conversations[chatDetail.value.conversations.length - 1]
        msgData.id && (lastData.id = msgData?.id)
        message && (lastData.message += message)
      }
    },
    onclose() {
      // if the server closes the connection unexpectedly, retry:
      throw new RetriableError()
    },
    onerror(err) {
      if (err instanceof FatalError) {
        throw err // rethrow to stop the operation
      } else {
        // do nothing to automatically retry. You can also
        // return a specific retry interval here.
      }
      console.log('err')
    }
  })

  eventSource

  // if (window.EventSource) {
  //   const eventSource = new EventSource(`/api/chats/sessions/completion/${sessionId}/`)

  //   eventSource.onopen = () => {
  //     console.log('连接建立')
  //     chatDetail.value?.conversations?.push({
  //       id: Number(new Date()),
  //       message: newContent.value,
  //       role: Role.USER,
  //       date: Number(new Date())
  //     })
  //   }

  //   eventSource.onmessage = (event: MessageEvent<string>) => {
  //     try {
  //       console.log('收到消息: ', event.data)
  //       const msgData = JSON.parse(event.data) as ChatMessageRes
  //       const msg = msgData.delta.message
  //       if (chatDetail.value?.conversations?.length) {
  //         const lastData = chatDetail.value.conversations[chatDetail.value.conversations.length - 1]
  //         msgData.id && (lastData.id = msgData.id)
  //         msg && (lastData.message += msg)
  //       }
  //     } catch (error) {
  //       console.log(' parse error:', error)
  //     }
  //   }

  //   eventSource.onerror = (e) => {
  //     console.log('连接发生错误', e)
  //     ElMessage({
  //       message: '连接发生错误',
  //       type: 'error'
  //     })
  //     eventSource.close()
  //   }
  //   onBeforeUnmount(() => {
  //     eventSource.close()
  //   })
  // } else {
  //   console.error('浏览器不支持')
  // }
}

const submitNewMessage = async () => {
  chatDetail.value?.conversations?.push({
    id: Number(new Date()),
    message: newContent.value,
    role: Role.USER,
    date: Number(new Date())
  })

  const data: SubmitMessageParams = {
    message: newContent.value
  }
  if (chatDetail.value?.scene_type === SceneType.GENERATION) {
    if (uploadFileListTemplate.value?.[0]) {
      data.template_file_id = uploadFileListTemplate.value[0].id
    }
    if (uploadFileListReference.value?.length) {
      data.reference_file_ids = uploadFileListReference.value.map((item) => item.id || '')
    }
    if (uploadFileListUrl.value?.length) {
      data.reference_urls = uploadFileListUrl.value.map((item) => item.url || '')
    }
  }
  const sessionId = chatDetail.value?.session_id
  if (sessionId) {
    listenerNewMessage(sessionId, data)
    newContent.value = ''
  }
}

onMounted(() => {
  queryChatDetail(props.curSessionId)
})

// 监听 curSessionId 变化
watch(
  () => props.curSessionId,
  async (newVal, oldVal) => {
    if (newVal !== oldVal) {
      newContent.value = ''
      uploadFileListTemplate.value = []
      uploadFileListReference.value = []
      uploadFileListUrl.value = []
      queryChatDetail(newVal)
    }
  }
)
</script>

<template>
  <div v-if="props.curSessionId && chatDetail?.session_id">
    <div class="chat-content-wrap">
      <div class="chat-content-list">
        <div
          v-for="item in chatDetail?.conversations"
          :key="item.id"
          class="chat-item"
          :class="item.role === Role.USER ? 'right' : 'left'"
        >
          <div class="chat-avatar">
            <img
              class="img"
              :src="item.role === Role.USER ? '/static/user.png' : '/static/chat.png'"
            />
          </div>
          <div class="conversation">
            <p class="time">{{ dayjs(item.date).format('YYYY-MM-DD HH:mm:ss') }}</p>
            <div class="card">
              <div class="content-wrap markdown-body" style="font-size: 16px">
                <vue-markdown :source="item.message" :plugins="plugins" />
              </div>
              <div
                class="action"
                v-if="chatDetail.scene_type === SceneType.GENERATION && item.role !== Role.USER"
              >
                <div class="left-action">
                  <div class="icon like" @click="props.ratingConversation(item.id, true)">喜欢</div>
                  <div class="icon dislike" @click="props.ratingConversation(item.id, false)">
                    不喜欢
                  </div>
                </div>
                <div class="right-action">
                  <div class="icon copy" @click="() => handleCopy(item.message)">
                    <el-icon><DocumentCopy /></el-icon>
                    复制
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部输入框 -->
    <div class="chat-input-container">
      <div class="chat-input">
        <div class="textarea-wrap">
          <textarea v-model="newContent" class="textarea" placeholder="问我任何问题"></textarea>
        </div>
        <div class="action">
          <div class="advanced" v-if="chatDetail.scene_type === SceneType.GENERATION">
            <upload-template @upload-success="handleUploadSuccess" />
            <upload-reference @upload-success="handleUploadSuccess" />
          </div>
          <div class="send">
            <el-button type="primary" :icon="Promotion" @click="submitNewMessage">发送</el-button>
          </div>
        </div>
        <div
          class="file-list"
          v-if="
            chatDetail.scene_type === SceneType.GENERATION &&
            (uploadFileListTemplate.length ||
              uploadFileListReference.length ||
              uploadFileListUrl.length)
          "
        >
          <div class="file-item" v-for="(item, index) in uploadFileListTemplate" :key="item.id">
            <div class="file">
              <el-icon><Document /></el-icon>
              <div class="name">{{ item.id }}</div>
            </div>
            <div class="delete">
              <el-icon @click="() => handleDeleteUploadFile(index, item.type)"><Close /></el-icon>
            </div>
          </div>

          <div class="file-item" v-for="(item, index) in uploadFileListReference" :key="item.id">
            <div class="file">
              <el-icon><Files /></el-icon>
              <div class="name">{{ item.id }}</div>
            </div>
            <div class="delete">
              <el-icon @click="() => handleDeleteUploadFile(index, item.type)"><Close /></el-icon>
            </div>
          </div>

          <div class="file-item" v-for="(item, index) in uploadFileListUrl" :key="item.url">
            <div class="file">
              <el-icon><Link /></el-icon>
              <div class="name">{{ item.url }}</div>
            </div>
            <div class="delete">
              <el-icon @click="() => handleDeleteUploadFile(index, item.type)"><Close /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="full-content">
    <scenes-choice :scene-list="props.sceneList" :getNewChat="props.getNewChat"></scenes-choice>
  </div>
</template>

<style lang="scss" scoped>
@import './MainChat.scss';
</style>
