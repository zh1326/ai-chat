<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import {
  DocumentCopy,
  Link,
  Document,
  Files,
  Promotion,
  Close,
  SwitchButton
} from '@element-plus/icons-vue'
import useClipboard from 'vue-clipboard3'
import VueMarkdown from 'vue-markdown-render'
import highlight from 'markdown-it-highlightjs'
import { SceneType, type SceneItem } from '@/interface/scene'
import { host } from '@/utils/request'
import {
  AnswerStatus,
  Role,
  UploadType,
  type ChatItem,
  type ChatMessageRes,
  type HandleUploadParams,
  type SubmitMessageParams,
  type UploadFileItem
} from '@/interface/chat'
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
  queryChatList: (sessionId: string, showLoading?: boolean) => Promise<void>
  ratingConversation: (convId: number, like: boolean) => void
}>()

const answerStatus = ref(AnswerStatus.DEFAULT)
const pageScrollTimer = ref<number>()
// const pageRef = ref<HTMLDivElement | null>(null)
const newContent = ref('')
const chatDetail = ref<ChatItem>()
const uploadFileListTemplate = ref<UploadFileItem[]>([])
const uploadFileListReference = ref<UploadFileItem[]>([])
const uploadFileListUrl = ref<UploadFileItem[]>([])
const fetchControllerRef = ref<AbortController>()

const { toClipboard } = useClipboard()

const scrollBottom = () => {
  const pageContent = document.querySelector<HTMLElement>('#chat-content-container')
  if (pageContent) {
    pageContent.scrollTop = pageContent.scrollHeight
  }
}

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
    const data = { type, id: val.id, name: val.name }
    uploadFileListTemplate.value = [data]
  } else if (type === UploadType.REFERENCE) {
    const data: UploadFileItem[] = val.map((item) => ({ id: item.id, name: item.name, type }))
    uploadFileListReference.value = data
  } else if (type === UploadType.URL) {
    const data: UploadFileItem[] = val.map((item) => ({ id: item.id, url: item.url, type }))
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

// 使用 TextDecoder 来逐步解码流中的文本
const decoder = new TextDecoder()

// 递归函数来读取数据
const read = (reader: ReadableStreamDefaultReader<Uint8Array>) => {
  console.log('reading')
  reader
    .read()
    .then(({ done, value }) => {
      if (done) {
        console.log('Stream complete')
        answerStatus.value = AnswerStatus.DEFAULT
        return
      }

      // 将 Uint8Array 编码为字符串
      const str = decoder.decode(value, { stream: true })
      try {
        const msgData = JSON.parse(str) as ChatMessageRes
        if (msgData) {
          const message = msgData?.delta?.message
          const conversations = chatDetail.value?.conversations
          if (conversations && conversations.length) {
            const lastData = conversations[conversations.length - 1]
            msgData.id && (lastData.id = msgData?.id)
            message && (lastData.message += message)
          }
        }
      } catch (error) {
        console.error('error: ', error)
      }

      // 递归调用读取下一部分数据
      read(reader)
    })
    .catch((error) => {
      console.error('Stream reading error:', error)
    })
}

const fetchStream = async (sessionId: string, data: SubmitMessageParams) => {
  const controller = new AbortController() // 控制器用于中断请求
  const signal = controller.signal // 中断信号

  fetchControllerRef.value = controller

  const url = `${host}/api/chats/sessions/completion/${sessionId}/`
  const options = {
    signal,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer  ${userStore.token || ''}`
    },
    body: JSON.stringify(data)
  }

  answerStatus.value = AnswerStatus.WAITING_RESPONSE
  setTimeout(() => {
    scrollBottom()
  }, 100)

  window
    .fetch(url, options)
    .then((response) => {
      if (response?.body) {
        // 获取 ReadableStream 对象
        const reader = response.body.getReader()

        const conversations = chatDetail.value?.conversations
        if (conversations) {
          conversations.push({
            id: Number(new Date()),
            message: '',
            role: Role.ASSISTANT,
            date: Number(new Date())
          })
        }

        answerStatus.value = AnswerStatus.ANSWERING

        // 开始读取流
        read(reader)

        const convLength = chatDetail.value?.conversations?.length || 0
        if (convLength <= 2 && props.curSessionId) {
          props.queryChatList(props.curSessionId, false)
        }
      }
    })
    .catch((error) => {
      console.error('Fetch error:', error)
    })
}

const stopStream = () => {
  fetchControllerRef.value?.abort()
  answerStatus.value = AnswerStatus.DEFAULT
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
      data.template_file_id = String(uploadFileListTemplate.value[0].id)
    }
    if (uploadFileListReference.value?.length) {
      data.reference_file_ids = uploadFileListReference.value.map((item) => String(item.id) || '')
    }
    if (uploadFileListUrl.value?.length) {
      data.reference_urls = uploadFileListUrl.value.map((item) => item.url || '')
    }
  }
  const sessionId = chatDetail.value?.session_id
  if (sessionId) {
    fetchStream(sessionId, data)
    resetChat()
  }
}

const resetChat = () => {
  newContent.value = ''
  uploadFileListTemplate.value = []
  uploadFileListReference.value = []
  uploadFileListUrl.value = []
}

onMounted(() => {
  queryChatDetail(props.curSessionId)
})

// 监听 curSessionId 变化
watch(
  () => props.curSessionId,
  async (newVal, oldVal) => {
    if (newVal !== oldVal) {
      resetChat()
      queryChatDetail(newVal)
    }
  }
)

watch(answerStatus, (newValue) => {
  if (newValue === AnswerStatus.ANSWERING) {
    pageScrollTimer.value = setInterval(() => {
      scrollBottom()
    }, 1000)
  } else if (newValue === AnswerStatus.DEFAULT) {
    if (pageScrollTimer.value) {
      clearInterval(pageScrollTimer.value)
    }
  }
})
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
              <div class="action" v-if="item.role !== Role.USER">
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
      <div v-if="answerStatus === AnswerStatus.ANSWERING" class="stop-fetch-wrap">
        <el-button :icon="SwitchButton" type="danger" plain round @click="stopStream">
          停止响应
        </el-button>
      </div>
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
            <el-button
              type="primary"
              :icon="Promotion"
              @click="submitNewMessage"
              :disabled="answerStatus !== AnswerStatus.DEFAULT"
              >发送</el-button
            >
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
              <div class="name">{{ item.name }}</div>
            </div>
            <div class="delete">
              <el-icon @click="() => handleDeleteUploadFile(index, item.type)"><Close /></el-icon>
            </div>
          </div>

          <div class="file-item" v-for="(item, index) in uploadFileListReference" :key="item.id">
            <div class="file">
              <el-icon><Files /></el-icon>
              <div class="name">{{ item.name }}</div>
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
