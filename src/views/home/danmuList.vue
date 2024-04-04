<script setup>
import { ref, onMounted, toRaw } from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  Message,
  Modal,
  Popconfirm,
  Radio,
  RadioGroup,
  Table,
  TableColumn,
  Tag,
  Textarea,
  InputNumber,
} from '@arco-design/web-vue'
import uuid4 from 'uuidjs'

import { uniqBy } from 'lodash'
import { getLocalValue, setLocalValue } from '@/utils'

const loading = ref(false)

const data = ref([])
const accountList = ref([])
const modalVisible = ref(false)
const form = ref({})
const accessKey = ref('')
const mode = ref('queue')
const danmuInterval = ref(3)

const getList = () => {
  getLocalValue('danmuList').then((res) => {
    data.value = res || []
    form.value = {
      fontSize: 25,
      color: '#ffffff',
      progress: 0,
      mode: '1',
    }
  })
}

const getMode = async () => {
  mode.value = (await getLocalValue('danmuSendMode')) || 'queue'
  danmuInterval.value = (await getLocalValue('danmuInterval')) || 3
}

const changeDanmuSendMode = (value) => {
  setLocalValue('danmuSendMode', value)
}

const changeDanmuInterval = (value) => {
  setLocalValue('danmuInterval', value)
}

const save = async () => {
  await setLocalValue('danmuList', toRaw(data.value))
  await getList()
  Message.success('保存成功')
}

const isImportDammu = ref(false)

const handleOk = () => {
  if (form.value.id) {
    const index = data.value.findIndex((item) => item.id === form.value.id)
    data.value[index] = form.value
  } else if (isImportDammu.value) {
    const list = form.value.content
      .split('\n')
      .map((item) => {
        return {
          id: uuid4.generate(),
          ...form.value,
          content: item,
        }
      })
      .filter((item) => item.content)
    const newList = [...data.value, ...list]
    data.value = uniqBy(newList, 'content')
  } else {
    form.value.id = uuid4.generate()
    data.value.push(form.value)
  }
  save()
  modalVisible.value = false
  isImportDammu.value = false
}

const showAddModal = () => {
  modalVisible.value = true
  isImportDammu.value = false
}
const showImportModal = () => {
  modalVisible.value = true
  isImportDammu.value = true
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

onMounted(() => {
  getList()
  getMode()
})

const danmuModeMap = {
  1: '滚动',
  4: '底部',
  5: '顶部',
  6: '逆向滚动',
}
</script>

<template>
  <div class="w-full p-2">
    <div class="danmu-table">
      <div class="mb-2 layout-items-center">
        <div class="layout-items-center">
          <Tag color="#fb7299">共 {{ data.length }}条</Tag>
        </div>
        <Button type="primary" status="success" size="mini" class="ml-4" @click="showAddModal">新增</Button>
        <Button type="primary" status="success" size="mini" class="ml-4" @click="showImportModal">批量导入</Button>
        <Tag color="red" class="ml-4">批量发送按钮在视频详情页的弹幕发送按钮旁边</Tag>
      </div>
      <div class="mb-2 layout-items-center">
        <div class="mr-2">弹幕发送方式：</div>
        <RadioGroup v-model="mode" @change="changeDanmuSendMode">
          <!--          <Radio value="fixed">固定话术(取输入框)</Radio>-->
          <Radio value="queue">顺序话术，顺序发</Radio>
          <Radio value="random">随机话术，随机发</Radio>
        </RadioGroup>
      </div>
      <div class="mb-2 layout-items-center">
        <div class="mr-2 whitespace-nowrap">弹幕发送间隔时间(秒)：</div>

        <InputNumber v-model="danmuInterval" @change="changeDanmuInterval" :precision="2" />
      </div>
      <Table :sticky-header="100" :scroll="{ y: '365px' }" row-key="id" :data="data" :pagination="false">
        <template #columns>
          <TableColumn title="内容" data-index="content" :width="300" ellipsis tooltip />
          <TableColumn title="颜色" data-index="color" :width="100">
            <template #cell="{ record }">
              <div :style="{ background: record.color, width: '20px', height: '20px' }" />
            </template>
          </TableColumn>

          <TableColumn title="字号" data-index="fontSize" :width="80" />
          <TableColumn title="位置" data-index="mode" :width="80">
            <template #cell="{ record }">
              {{ danmuModeMap[record.mode] }}
            </template>
          </TableColumn>

          <TableColumn title="发送时间(秒)" data-index="progress" :width="100" />
          <!--          <TableColumn title="mid" data-index="mid" width="100" align="center" /> -->
          <TableColumn title="操作" width="200">
            <template #cell="{ record }">
              <div class="layout-items-center">
                <!--                <Button class="ml-2" type="primary" size="mini" @click="onSend(record)"> -->
                <!--                  发送 -->
                <!--                </Button> -->
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
      <template #title>弹幕模板</template>
      <Form :model="form" auto-label-width>
        <FormItem field="content" label="弹幕内容">
          <Textarea v-if="isImportDammu" v-model="form.content" placeholder="请粘贴话术，每个话术换行读取" />
          <Input v-else v-model="form.content" />
        </FormItem>
        <FormItem field="color" label="弹幕颜色">
          <Input v-model="form.color" type="color" />
        </FormItem>
        <FormItem field="fontSize" label="弹幕字号">
          <Input v-model="form.fontSize" />
        </FormItem>
        <FormItem field="mode" label="弹幕位置">
          <RadioGroup v-model="form.mode">
            <Radio value="1">滚动</Radio>
            <Radio value="4">底部</Radio>
            <Radio value="5">顶部</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem field="progress" label="发送时间（秒）">
          <Input v-model="form.progress" />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<style lang="css">
.danmu-table {
  //height: 500px;
  //margin-bottom: 20px;
}
</style>
