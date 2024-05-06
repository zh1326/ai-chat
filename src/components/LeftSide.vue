<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  ChatLineRound,
  Edit,
  Delete,
  SwitchButton,
  Avatar,
  Lock,
  MoreFilled
} from '@element-plus/icons-vue'
import Config from '@/config'
import type { ChatItem } from '@/interface/chat'
import { useUserStore } from '@/stores/user'
import { usePasswordChangeApi } from '@/api/user'

const router = useRouter()

const userStore = useUserStore()

const props = defineProps<{
  sidebarOpened: boolean
  isMobile: boolean
  chatList?: ChatItem[]
  curSessionId?: string
  removeChat: (sessionId: string) => Promise<string>
  searchChatList: (q: string) => void
  renameChat: (sessionId: string, name: string) => Promise<string>
}>()
const emit = defineEmits<{
  handleSessionClick: [id: string]
  reset: []
}>()

const passwordChangeVisible = ref(false)
const passwordChangeForm = ref({ old: '', new: '', confirm: '' })
const editVisible = ref(false)
const editChatName = ref('')
const editChatSessionId = ref('')
const searchInput = ref('')
// const chatTitleList = ref<string[]>(props.chatList?.map?.((item) => item.name) || [])

const handleEditClick = (e: MouseEvent, id: string) => {
  e.stopPropagation()
  const target = props.chatList?.find((item) => item.session_id === id)
  if (target) {
    editChatName.value = target.name
    editChatSessionId.value = target.session_id
  }
  editVisible.value = true
}

const handleDeleteClick = (e: MouseEvent, id: string) => {
  e.stopPropagation()
  ElMessageBox.confirm('确认删除吗？', '提醒', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await props.removeChat(id)
      if (res) {
        ElMessage({
          type: 'success',
          message: '删除成功'
        })
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '删除失败'
      })
    })
}

const handleNewChat = () => {
  emit('reset')
  router.push('/chat')
}

const handleOk = async () => {
  const name = editChatName.value
  const sessionId = editChatSessionId.value
  if (name && sessionId) {
    const res = await props.renameChat(sessionId, name)
    res && (editVisible.value = false)
  }
}

const handlePasswordSubmit = async () => {
  if (!passwordChangeForm.value.old) {
    ElMessage.error('请输入原密码')
    return
  }
  if (!passwordChangeForm.value.new) {
    ElMessage.error('请输入新密码')
    return
  }
  if (passwordChangeForm.value.new !== passwordChangeForm.value.confirm) {
    ElMessage.error('两次密码不一致')
    return
  }
  const data = {
    old_password: passwordChangeForm.value.old,
    new_password: passwordChangeForm.value.new,
    confirm_password: passwordChangeForm.value.confirm
  }
  const res = await usePasswordChangeApi(data)
  if (res) {
    ElMessage.success('修改成功')
    passwordChangeVisible.value = false
  }
}

const handleLogout = () => {
  userStore
    .logoutAction()
    .then(() => {
      console.log('logout')
      router.push({ path: '/login' })
    })
    .catch((error) => {
      console.error('error', error)
    })
}

const handleSearchInput = (val: string) => {
  props.searchChatList(val)
}
</script>

<template>
  <div class="left-side-wrap">
    <div class="left-side-top">
      <h1 class="top-title">
        <img :src="Config.Logo" class="logo" />
        {{ Config.Title }}
      </h1>
      <div class="top-action full-line">
        <el-button type="primary" :icon="Search" round @click="handleNewChat"> 新对话 </el-button>
      </div>
      <div class="search">
        <el-input
          class="search-input"
          v-model="searchInput"
          placeholder="搜索历史记录"
          :prefix-icon="Search"
          @input="handleSearchInput"
        />
      </div>
    </div>
    <div class="item-list">
      <div
        v-for="item in props.chatList"
        :key="item.session_id"
        :class="`item ${props.curSessionId === item.session_id ? 'active' : ''}`"
        @click="emit('handleSessionClick', item.session_id)"
      >
        <el-icon><ChatLineRound /></el-icon>
        <div class="title">{{ item.name }}</div>
        <div class="action-wrap">
          <div class="action">
            <el-icon @click="(e: MouseEvent) => handleEditClick(e, item.session_id)">
              <Edit />
            </el-icon>
            <el-icon @click="(e: MouseEvent) => handleDeleteClick(e, item.session_id)">
              <Delete />
            </el-icon>
          </div>
        </div>
      </div>
    </div>
    <div class="user-info">
      <div class="info">
        <div class="avatar">
          <el-icon><Avatar /></el-icon>
        </div>
        <div class="username">{{ userStore?.user?.username || '游客' }}</div>
      </div>
      <div class="more">
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-icon><MoreFilled /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :icon="Lock" @click="passwordChangeVisible = true">
                修改密码
              </el-dropdown-item>
              <el-dropdown-item :icon="SwitchButton" @click="handleLogout">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>

  <el-dialog
    class="upload-dialog"
    v-model="editVisible"
    title="重命名"
    width="500"
    :append-to-body="true"
  >
    <el-input v-model="editChatName" placeholder="输入新名称" />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="handleOk">提交</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    class="upload-dialog"
    v-model="passwordChangeVisible"
    title="修改密码"
    width="500"
    :append-to-body="true"
  >
    <el-form :model="passwordChangeForm">
      <el-form-item label="旧密码" label-width="100px">
        <el-input v-model="passwordChangeForm.old" show-password autocomplete="off" />
      </el-form-item>
      <el-form-item label="新密码" label-width="100px">
        <el-input v-model="passwordChangeForm.new" show-password autocomplete="off" />
      </el-form-item>
      <el-form-item label="确认密码" label-width="100px">
        <el-input v-model="passwordChangeForm.confirm" show-password autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="passwordChangeVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePasswordSubmit">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
@import '../utils/utils.scss';

.top-title {
  width: 100%;
  display: flex;
  justify-content: left;
  align-items: center;
  font-size: 28px;
  line-height: 1;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 16px;
  .logo {
    width: 40px;
    height: 40px;
    margin-right: 8px;
  }
}
.left-side-wrap {
  width: var(--left-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  position: relative;
  .left-side-top {
    padding: 16px;
  }
  .top-action {
    margin-bottom: 16px;
    :deep(.el-button.is-round) {
      padding: 18px 15px;
    }
  }
  .search {
    border-top: 1px solid #dcdfe6;
    border-bottom: 1px solid #dcdfe6;
    :deep(.el-input__wrapper) {
      box-shadow: none;
    }
  }
  .item-list {
    display: flex;
    flex-direction: column;
    padding: 16px 16px 72px;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
    .item {
      cursor: pointer;
      padding: 0 12px;
      color: var(--color-text-menu);
      font-size: 14px;
      transition: all 0.5s ease;
      background: rgba(0, 0, 0, 0);
      height: 44px;
      min-height: 44px;
      position: relative;
      display: flex;
      align-items: center;
      border-radius: 5px;
      .action-wrap {
        display: none;
        .action {
          position: absolute;
          top: 0;
          right: 0;
          padding: 0 8px;
          /* transition: all 0.4px ease; */
          height: 44px;
          display: flex;
          align-items: center;
          :deep(.el-icon) {
            font-size: 14px;
            padding: 4px;
            border-radius: 4px;
            &:hover {
              background: var(--color-primary-hover);
            }
            &:active {
              opacity: 0.7;
            }
          }
        }
      }
      &.active {
        background: var(--color-primary-hover);
        color: var(--color-text-menu-active);
      }
      &:hover {
        background: var(--color-primary-hover);
        color: var(--color-text-menu-active);
        .action-wrap {
          display: inherit;
        }
        .title {
          width: 65%;
        }
      }
      .title {
        margin-left: 4px;
        width: 100%;
        @include textOverflow();
      }
    }
  }
  .user-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    color: #333;
    font-size: 14px;
    line-height: 1;
    box-shadow: -1px 0 2px rgba(0, 0, 0, 0.3);
    .info {
      display: flex;
      align-items: center;
      .avatar {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        border: 1px solid #333;
        border-radius: 50%;
      }
      .username {
        margin-left: 8px;
      }
    }
    .more {
      cursor: pointer;
      &:hover {
        opacity: 0.7;
      }
    }
  }
  .full-line {
    display: flex;
    flex-direction: column;
  }
}
</style>
