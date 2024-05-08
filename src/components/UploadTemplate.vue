<script setup lang="ts">
import { ref } from 'vue'
import type { UploadProps, UploadUserFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import { host } from '@/utils/request'
import { useUserStore } from '@/stores/user'
import { UploadType, type HandleUploadTemplateParams } from '@/interface/chat'

const userStore = useUserStore()

defineProps<{
  msg?: string
}>()

const emit = defineEmits<{
  uploadSuccess: [data: HandleUploadTemplateParams]
}>()

const fileList = ref<UploadUserFile[]>([])
const MAX_LIMIT = 1

const handleSuccess: UploadProps['onSuccess'] = (res) => {
  emit('uploadSuccess', { val: res.file_id, type: UploadType.TEMPLATE })
  fileList.value = []
}

const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning(`最多上传${MAX_LIMIT}个文件`)
}
</script>

<template>
  <el-upload
    v-model:file-list="fileList"
    :show-file-list="false"
    class="upload-btn"
    accept=".doc,.docx,.pdf,.txt"
    :action="`${host}/api/chats/files/`"
    :name="'file'"
    :data="{ purpose: 'template' }"
    :headers="{ authorization: `Bearer  ${userStore.token || ''}` }"
    multiple
    :limit="MAX_LIMIT"
    :on-exceed="handleExceed"
    :on-success="handleSuccess"
  >
    <el-tooltip content="上传模板文件，最多一个" placement="top">
      <el-button :icon="Document" circle />
    </el-tooltip>
  </el-upload>
</template>

<style lang="scss" scoped></style>
