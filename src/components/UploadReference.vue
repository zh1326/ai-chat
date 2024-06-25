<script setup lang="ts">
import { reactive, ref } from 'vue'
import axios from 'axios';
import type { UploadProps, UploadUserFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { UploadFilled, Files, Plus, Minus } from '@element-plus/icons-vue'
import { host } from '@/utils/request'
import { useUserStore } from '@/stores/user'
import {
  UploadType,
  type FileItem,
  type HandleUploadReferenceParams,
  type UploadFileItem
} from '@/interface/chat'

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
const urlListData = reactive<{ list: FileItem[] }>({ list: [{ url: '' }] }) // 填写的 URL 列表
const MAX_LIMIT = 1

const query = ref('');
const references = ref([]);
const referenceFileName = ref('');

const fetchReferences = (queryString: string, callback: (references: FileItem[]) => void) => {
  axios.get(`${host}/api/references/`, {
    params: { q: queryString },
    headers: {
      'Authorization': `Bearer ${userStore.token}`
    }
  }).then(response => {
    references.value = response.data;
    callback(references.value);
  }).catch(error => {
    console.error(error);
  });
};

const handleSelect = (item: any) => {
  const fileItem = item as FileItem
  query.value = fileItem.name || '' // 更新输入框的值为选中模板的名称
  referenceFileName.value = fileItem.name || ''
  uploadList.value = []
  uploadList.value.push({ id: fileItem.id, name: fileItem.name, type: UploadType.REFERENCE })
};

const handleOk = () => {
  const idList = uploadList.value.map((item) => ({ id: item.id, name: item.name }))
  emit('uploadSuccess', { val: idList, type: UploadType.REFERENCE })

  // emit('uploadSuccess', { val: urlListData.list, type: UploadType.URL })

  fileList.value = []
  uploadList.value = []
  urlListData.list = [{ url: '' }]
  visible.value = false
  referenceFileName.value = ''
}

const handleIncreaseDecrease = (index: number) => {
  if (index === 0) {
    urlListData.list.push({ url: '' })
  } else {
    urlListData.list.splice(index, 1)
  }
}

const handleSuccess: UploadProps['onSuccess'] = (res) => {
  uploadList.value = []
  referenceFileName.value = res.file_name
  uploadList.value.push({ id: res.file_id, name: res.file_name, type: UploadType.REFERENCE })
}

const handleChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
  fileList.value = uploadFiles
}

const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning(`最多上传${MAX_LIMIT}个文件`)
}
</script>

<template>
  <el-tooltip content="添加或上传参考文件" placement="top">
    <el-button :icon="Files" circle @click="visible = true" />
  </el-tooltip>
  <el-dialog
    class="upload-dialog"
    v-model="visible"
    title="添加或上传参考文件"
    width="500"
    :append-to-body="true"
  >
    <div class="reference-list">
      <div class="reference-input">
        <el-autocomplete
          style="width: 100%;"
          v-model="query"
          :fetch-suggestions="fetchReferences"
          placeholder="输入关键词搜索已有参考文件并选中添加"
          @select="handleSelect"
          :debounce="300"
          value-key="name"
        ></el-autocomplete>
      </div>
    </div>
    <el-divider>或上传新参考文件</el-divider>
    <el-upload
      class="upload"
      multiple
      drag
      v-model:file-list="fileList"
      :limit="MAX_LIMIT"
      accept=".docx,.pdf,.txt"
      :action="`${host}/api/files/`"
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
    <!--
    <el-divider>或</el-divider>
    <div class="url-input-list">
      <div class="url-input" v-for="(item, index) in urlListData.list" :key="index">
        <el-input v-model="urlListData.list[index].url" placeholder="输入参考 URL" />
        <el-button
          plain
          :type="index === 0 ? 'primary' : 'danger'"
          :icon="index === 0 ? Plus : Minus"
          circle
          @click="handleIncreaseDecrease(index)"
        />
      </div>
    </div>
    -->
    <template #footer>
      <el-form>
        <el-form-item label="已选参考文件：">
          <label>{{ referenceFileName }}</label>
        </el-form-item>
      </el-form>
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

  .reference-list {
    .template-input {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
  }
</style>
