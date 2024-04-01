<script setup>
import { ref, onMounted, toRaw } from 'vue'
import {
  Button,
  Checkbox,
  Form,
  FormItem,
  Message,
  Modal,
  Popconfirm,
  Radio,
  RadioGroup,
  Table,
  TableColumn,
  Tag,
  Textarea,
} from '@arco-design/web-vue'
import uuid4 from 'uuidjs'
import { getLocalValue, setLocalValue } from '@/utils'
import { uniqBy } from 'lodash'

const data = ref([])
const modalVisible = ref(false)
const mode = ref('fixed')
const form = ref({})
const withAt = ref(false)
const commonConfig = ref({})

const getList = async () => {
  data.value = (await getLocalValue('replyList')) || []
}
const getMode = async () => {
  mode.value = (await getLocalValue('replyMode')) || 'random'
}

const changeReplyMode = (value) => {
  setLocalValue('replyMode', value)
}

const save = async () => {
  await setLocalValue('replyList', toRaw(data.value))
  form.value = {}
  getList()
  Message.success('保存成功')
}

const handleOk = () => {
  if (form.value.id) {
    const index = data.value.findIndex((item) => item.id === form.value.id)
    data.value[index] = form.value
  } else {
    form.value.id = uuid4.generate()
    data.value.push(form.value)
  }
  save()
}

const importText = ref('')
const importModalVisible = ref(false)

const handleImportOk = () => {
  const { value } = importText
  if (!value) {
    Message.error('请输入内容')
    return
  }
  const list = value.split('\n').map((item) => {
    return {
      id: uuid4.generate(),
      content: item,
    }
  })
  const newList = [...data.value, ...list]
  data.value = uniqBy(newList, 'content')
  save()
  importModalVisible.value = false
}

const showAddModal = () => {
  modalVisible.value = true
}
const showImportModal = () => {
  importModalVisible.value = true
}

const onEdit = (record) => {
  modalVisible.value = true
  form.value = { ...record }
}

const remove = (record) => {
  const index = data.value.findIndex((item) => item.id === record.id)
  data.value.splice(index, 1)
  save()
}

const changeWithAt = (value) => {
  setLocalValue('withAt', value)
}

onMounted(async () => {
  getList()
  getMode()
  withAt.value = (await getLocalValue('withAt')) || false
  commonConfig.value = await getLocalValue('commonConfig')
})
</script>

<template>
  <div class="w-full px-2">
    <div class="reply-table">
      <div class="mb-2 layout-items-center">
        <div class="layout-items-center">
          <Tag color="#fb7299">共 {{ data.length }}条</Tag>
        </div>
        <Button type="primary" status="success" size="mini" class="ml-4" @click="showAddModal">新增评论话术</Button>
        <Button type="primary" status="success" size="mini" class="ml-4" @click="showImportModal">导入评论话术</Button>
      </div>
      <div class="mb-2 layout-items-center">
        <div class="mr-2">评论发送方式：</div>
        <RadioGroup v-model="mode" @change="changeReplyMode">
          <Radio value="fixed">固定话术(取输入框)</Radio>
          <Radio value="queue">顺序话术，顺序发</Radio>
          <Radio value="random">随机话术，随机发</Radio>
        </RadioGroup>
      </div>
      <Table :sticky-header="100" :scroll="{ y: '365px' }" row-key="id" :data="data" :pagination="false">
        <template #columns>
          <TableColumn title="内容" data-index="content" />
          <TableColumn title="操作" :width="200">
            <template #cell="{ record }">
              <div class="layout-items-center">
                <Button class="ml-2" type="primary" status="success" size="mini" @click="onEdit(record)">编辑</Button>
                <Popconfirm content="确认删除吗？" position="lt" @ok="remove(record)">
                  <Button class="ml-2" type="primary" status="danger" size="mini">删除</Button>
                </Popconfirm>
              </div>
            </template>
          </TableColumn>
        </template>
      </Table>
    </div>
    <Modal v-model:visible="modalVisible" @ok="handleOk">
      <template #title>评论话术</template>
      <Form :model="form" auto-label-width>
        <FormItem field="content" label="内容">
          <Textarea v-model="form.content" placeholder="评论内容" />
        </FormItem>
      </Form>
    </Modal>
    <Modal v-model:visible="importModalVisible" @ok="handleImportOk">
      <template #title>评论话术</template>
      <Form :model="form" auto-label-width>
        <FormItem field="content" label="内容">
          <Textarea v-model="importText" placeholder="请粘贴话术，每个话术换行读取" />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<style lang="sass"></style>
