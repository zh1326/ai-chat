<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { UploadProps, UploadUserFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { UploadFilled, Files, Plus, Minus } from '@element-plus/icons-vue'
import { host } from '@/utils/request'
import { useUserStore } from '@/stores/user'
import { UploadType, type HandleUploadReferenceParams, type UploadFileItem } from '@/interface/chat'

const userStore = useUserStore()

defineProps<{
  msg?: string
}>()

const emit = defineEmits<{
  uploadSuccess: [data: HandleUploadReferenceParams]
}>()

const visible = ref(false)
const fileList = ref<UploadUserFile[]>([]) // upload 组件自身维护的已上传文件列表
const uploadList = ref<UploadFileItem[]>([]) // 回传给父组件的数据
const urlListData = reactive({ list: [''] }) // 填写的 URL 列表
const MAX_LIMIT = 2

const handleOk = () => {
  const idList = uploadList.value.map((item) => item.id || '')
  emit('uploadSuccess', { val: idList, type: UploadType.REFERENCE })

  emit('uploadSuccess', { val: urlListData.list, type: UploadType.URL })

  fileList.value = []
  uploadList.value = []
  urlListData.list = ['']
  visible.value = false
}

const handleIncreaseDecrease = (index: number) => {
  if (index === 0) {
    urlListData.list.push('')
  } else {
    urlListData.list.splice(index, 1)
  }
}

const handleSuccess: UploadProps['onSuccess'] = (res) => {
  uploadList.value.push({ id: res.file_id, type: UploadType.REFERENCE })
}

const handleChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
  fileList.value = uploadFiles
}

const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning(`最多上传${MAX_LIMIT}个文件`)
}
</script>

<template>
  <el-tooltip content="上传参考，最多两个" placement="top">
    <el-button :icon="Files" circle @click="visible = true" />
  </el-tooltip>
  <el-dialog
    class="upload-dialog"
    v-model="visible"
    title="上传参考"
    width="500"
    :append-to-body="true"
  >
    <el-upload
      class="upload"
      multiple
      drag
      v-model:file-list="fileList"
      :limit="MAX_LIMIT"
      accept=".doc,.docx,.pdf,.txt"
      :action="`${host}/api/chats/files/`"
      :name="'file'"
      :data="{ purpose: 'reference' }"
      :headers="{ authorization: `Bearer  ${userStore.token || ''}` }"
      :on-exceed="handleExceed"
      :on-success="handleSuccess"
      :on-change="handleChange"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">拖动文件到此处或者 <em>点击上传</em></div>
    </el-upload>
    <el-divider>或</el-divider>
    <div class="url-input-list">
      <div class="url-input" v-for="(item, index) in urlListData.list" :key="index">
        <el-input v-model="urlListData.list[index]" placeholder="输入参考 URL" />
        <el-button
          plain
          :type="index === 0 ? 'primary' : 'danger'"
          :icon="index === 0 ? Plus : Minus"
          circle
          @click="handleIncreaseDecrease(index)"
        />
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleOk">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.upload-dialog {
  .upload {
    :deep(.el-upload-dragger) {
      padding: 10px;
    }
    .el-icon--upload {
      font-size: 50px;
      margin-bottom: 8px;
    }
  }
}
.url-input-list {
  .url-input {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
}
</style>
