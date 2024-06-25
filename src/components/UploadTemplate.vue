<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios';
import type { UploadProps, UploadUserFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Document, Files, UploadFilled } from '@element-plus/icons-vue'
import { host } from '@/utils/request'
import { useUserStore } from '@/stores/user'
import { UploadType, type HandleUploadTemplateParams, type UploadFileRes, type TemplateItem } from '@/interface/chat'

const userStore = useUserStore()

defineProps<{
  msg?: string
}>()

const emit = defineEmits<{
  uploadSuccess: [data: HandleUploadTemplateParams]
}>()

const templateFileId = ref(0)
const templateFileName = ref('')
const templateType = ref('')

const visible = ref(false)

const query = ref('');
const templates = ref([]);

const fetchTemplates = (queryString: string, callback: (templates: TemplateItem[]) => void) => {
  axios.get(`${host}/api/templates/`, {
    params: { q: queryString },
    headers: {
      'Authorization': `Bearer ${userStore.token}`
    }
  }).then(response => {
    templates.value = response.data;
    callback(templates.value);
  }).catch(error => {
    console.error(error);
  });
};

const handleSelect = (item: any) => {
  const templateItem = item as TemplateItem;
  query.value = templateItem.name; // 更新输入框的值为选中模板的名称
  templateFileId.value = templateItem.tid
  templateFileName.value = templateItem.name
  templateType.value = templateItem.ttype
};

const fileList = ref<UploadUserFile[]>([])
const MAX_LIMIT = 1

const handleOk = () => {
  emit('uploadSuccess', {
    val: { tid: templateFileId.value, name: templateFileName.value, ttype: templateType.value },
    type: UploadType.TEMPLATE
  })

  templateFileId.value = 0
  templateFileName.value = ''
  templateType.value = ''
  query.value = ''
  fileList.value = []
  visible.value = false
}

const handleSuccess: UploadProps['onSuccess'] = (res: UploadFileRes) => {
  templateFileId.value = res.file_id
  templateFileName.value = res.file_name
  templateType.value = "customer"
}

const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning(`最多上传${MAX_LIMIT}个文件`)
}

const handleChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
  fileList.value = uploadFiles
}
</script>

<template>
  <el-tooltip content="添加或上传模板" placement="top">
      <el-button :icon="Document" circle @click="visible = true" />
  </el-tooltip>
  <el-dialog
    class="upload-dialog"
    v-model="visible"
    title="添加或上传模板"
    width="500"
    :append-to-body="true"
  >
    <div class="template-list">
      <div class="template-input">
        <el-autocomplete
          style="width: 100%;"
          v-model="query"
          :fetch-suggestions="fetchTemplates"
          placeholder="输入关键词搜索已有模板并选中添加"
          @select="handleSelect"
          :debounce="300"
          value-key="name"
        ></el-autocomplete>
      </div>
    </div>
    <el-divider>或上传新模板文件</el-divider>
    <el-upload
      class="upload"
      multiple
      drag
      v-model:file-list="fileList"
      :limit="MAX_LIMIT"
      accept=".docx,.pdf,.txt"
      :action="`${host}/api/files/`"
      :name="'file'"
      :data="{ purpose: 'template' }"
      :headers="{ authorization: `Bearer  ${userStore.token || ''}` }"
      :on-exceed="handleExceed"
      :on-success="handleSuccess"
      :on-change="handleChange"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">拖动一个模板文件到此处或者 <em>点击上传</em></div>
    </el-upload>
  <template #footer>
      <el-form>
        <el-form-item label="已选模板：">
          <label>{{ templateFileName }}</label>
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

  .template-list {
    .template-input {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
  }
</style>
