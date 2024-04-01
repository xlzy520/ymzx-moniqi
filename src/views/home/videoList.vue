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
} from '@arco-design/web-vue'
import uuid4 from 'uuidjs'

import { uniqBy } from 'lodash'
import { getLocalValue, setLocalValue, getBVIDFromURL, getVideoInfo, addVideo, deleteVideo, getVideoList } from '@/utils'

const loading = ref(false)

const data = ref([])
const accountList = ref([])
const modalVisible = ref(false)
const form = ref({
  content: 'BV1TH4y1p7mk',
})
const accessKey = ref('')
const mode = ref('queue')
const danmuInterval = ref(3)

const getList = () => {
  getVideoList().then((res) => {
    console.log(res, '===========打印的 ------ getVideoList')
    data.value = res
  })
}

const getMode = async () => {
  mode.value = (await getLocalValue('danmuSendMode')) || 'queue'
  danmuInterval.value = (await getLocalValue('danmuInterval')) || 3
}

const changeDanmuSendMode = (value) => {
  setLocalValue('danmuSendMode', value)
}

const save = async () => {
  await setLocalValue('danmuList', toRaw(data.value))
  await getList()
  Message.success('保存成功')
}

const isImportDammu = ref(false)

const handleOk = async () => {
  const content = form.value.content
  const bvid = getBVIDFromURL(content)
  const videoInfo = await getVideoInfo(bvid)
  if (!videoInfo) {
    Message.error('视频不存在')
    return
  }
  const item = {
    ...videoInfo,
    originJSON: JSON.stringify(videoInfo),
  }
  addVideo(item).then((res) => {
    getList()
    Message.success('保存成功')
  })
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
  deleteVideo(record.id).then(() => {
    getList()
    Message.success('删除成功')
  })
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
const danmuSendModeMap = {
  fixed: '固定',
  queue: '顺序',
  random: '随机',
}
</script>

<template>
  <div class="w-full p-2">
    <div class="danmu-table">
      <div class="mb-2 layout-items-center">
        <div class="layout-items-center">
          <Tag color="#fb7299">共 {{ data.length }}条视频</Tag>
        </div>
        <Button type="primary" status="success" size="mini" class="ml-4" @click="showAddModal">新增</Button>
      </div>
      <div class="mb-2 layout-items-center">
        <div class="mr-2">当前弹幕发送方式：</div>
        <Tag>{{ danmuSendModeMap[mode] }}</Tag>
        <div class="mr-2 ml-4">当前弹幕发送间隔：</div>
        <Tag>{{ danmuInterval }}</Tag>
      </div>
      <Table :sticky-header="100" :scroll="{ y: '365px' }" row-key="id" :data="data" :pagination="false">
        <template #columns>
          <TableColumn title="标题" data-index="title" :width="300" ellipsis tooltip />
          <TableColumn title="状态" data-index="color" :width="100">
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
                <!--                <Button class="ml-2" type="primary" status="success" size="mini" @click="onEdit(record)">编辑</Button>-->
                <Popconfirm content="确认删除吗？" position="lt" @ok="remove(record)">
                  <Button class="" type="primary" status="danger" size="mini">删除</Button>
                </Popconfirm>
              </div>
            </template>
          </TableColumn>
        </template>
      </Table>
    </div>
    <Modal v-model:visible="modalVisible" @ok="handleOk">
      <template #title>添加视频</template>
      <Form :model="form" auto-label-width>
        <FormItem field="content" label="视频BV号">
          <Textarea v-model="form.content" :auto-size="{ minRows: 4 }" placeholder="请粘贴视频BV号" />
        </FormItem>
        <!--        <FormItem field="color" label="弹幕颜色">-->
        <!--          <Input v-model="form.color" type="color" />-->
        <!--        </FormItem>-->
        <!--        <FormItem field="fontSize" label="弹幕字号">-->
        <!--          <Input v-model="form.fontSize" />-->
        <!--        </FormItem>-->
        <!--        <FormItem field="mode" label="弹幕位置">-->
        <!--          <RadioGroup v-model="form.mode">-->
        <!--            <Radio value="1">滚动</Radio>-->
        <!--            <Radio value="4">底部</Radio>-->
        <!--            <Radio value="5">顶部</Radio>-->
        <!--          </RadioGroup>-->
        <!--        </FormItem>-->
        <!--        <FormItem field="progress" label="发送时间（秒）">-->
        <!--          <Input v-model="form.progress" />-->
        <!--        </FormItem>-->
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
