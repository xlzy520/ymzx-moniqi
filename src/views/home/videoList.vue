<script setup>
import { ref, onMounted, toRaw } from 'vue'
import {
  Button,
  Form,
  FormItem,
  Input,
  InputNumber,
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
import {
  getLocalValue,
  setLocalValue,
  getBVIDFromURL,
  getVideoInfo,
  addVideo,
  deleteVideo,
  getVideoList,
  startDanmu,
  stopDanmu,
  getDanmuStatus,
  sleep,
  deleteVideoList,
} from '@/utils'
import dayjs from 'dayjs'

const loading = ref(false)

const data = ref([])
const accountList = ref([])
const modalVisible = ref(false)
const form = ref({
  content: '',
})
const accessKey = ref('')
const mode = ref('queue')
const danmuInterval = ref(3)
const videoInterval = ref(20)
const currentRunStatus = ref('stop')

const getList = () => {
  getVideoList().then((res) => {
    console.log(res, '===========打印的 ------ getVideoList')
    data.value = res.sort((a, b) => a.status - b.status)
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
  }
  addVideo(item).then((res) => {
    getList()
    Message.success('保存成功')
    form.value.content = ''
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

const changeVideoInterval = () => {
  setLocalValue('videoInterval', videoInterval.value)
}

const currentVideo = ref({})

const asyncRunStatus = () => {
  getDanmuStatus().then((res) => {
    currentRunStatus.value = res.data.status
    currentVideo.value = res.data.currentVideo || { title: '无' }
  })
}

const openBilibili = (bvid) => {
  const isMobile = navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)
  if (isMobile) {
    window.open(`bilibili://video/${bvid}`)
    return
  }
  window.open(`https://www.bilibili.com/video/${bvid}`)
}

let runInterval = null

const startRun = () => {
  startDanmu().then((res) => {
    Message.success(res.message)
    asyncRunStatus()
  })
}

const stopRun = () => {
  stopDanmu().then((res) => {
    Message.success(res.message)
    asyncRunStatus()
  })
}

const deleteCompleteVideo = async () => {
  const videoList = data.value.filter((item) => item.status === '1')
  deleteVideoList(videoList.map((item) => item.id)).then(() => {
    getList()
    Message.success('删除成功')
  })
}

onMounted(() => {
  getList()
  getMode()
  asyncRunStatus()
  getLocalValue('videoInterval').then((res) => {
    videoInterval.value = res || 20
  })
  runInterval = setInterval(() => {
    asyncRunStatus()
    getList()
  }, 1000 * 10)
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
        <Button type="primary" status="success" class="mr-4" @click="showAddModal">新增视频</Button>
        <div class="layout-items-center">
          <div class="mr-2 whitespace-nowrap">视频间隔时间(秒)：</div>
          <InputNumber v-model="videoInterval" @change="changeVideoInterval" :precision="2" />
        </div>
      </div>
      <div class="mb-2 layout-items-center">
        <div class="mr-4">
          <a-button v-if="currentRunStatus === 'stop'" type="primary" @click="startRun">开启自动弹幕</a-button>
          <a-button v-else type="primary" status="danger" @click="stopRun">关闭自动弹幕</a-button>
        </div>
        <div class="layout-items-center mr-4">
          <Tag color="#fb7299">共 {{ data.length }}条视频</Tag>
        </div>
        <div class="mr-2 whitespace-nowrap flex items-center" @click="openBilibili(currentVideo.bvid)">
          <div class="mr-2">当前视频：</div>
          <Tag color="blue">{{ currentVideo.title }}</Tag>
        </div>
        <div class="mr-2">当前弹幕发送方式：</div>
        <Tag>{{ danmuSendModeMap[mode] }}</Tag>
        <div class="mr-2 ml-4">当前弹幕发送间隔：</div>
        <Tag class="mr-2">{{ danmuInterval }}</Tag>
        <a-button type="primary" status="danger" @click="deleteCompleteVideo">清空已完成的视频</a-button>
      </div>
      <Table :sticky-header="100" :scroll="{ y: '500px' }" row-key="id" :data="data" :pagination="false">
        <template #columns>
          <TableColumn title="标题" data-index="title" :width="300" ellipsis tooltip>
            <template #cell="{ record }">
              <span class="text-blue-500 underline cursor-pointer" @click="openBilibili(record.bvid)">{{ record.title }}</span>
            </template>
          </TableColumn>
          <TableColumn title="状态" data-index="color" :width="100">
            <template #cell="{ record }">
              <a-tag v-if="!record.status" color="gray">未开始</a-tag>
              <a-tag v-else-if="record.status === '1'" color="green">已发送</a-tag>
              <a-tag v-else color="red">发送失败</a-tag>
            </template>
          </TableColumn>

          <TableColumn title="提示" data-index="reason" :width="100" />
          <TableColumn title="发送数量" data-index="danmuCount" :width="100" />
          <!--          <TableColumn title="位置" data-index="mode" :width="80">-->
          <!--            <template #cell="{ record }">-->
          <!--              {{ danmuModeMap[record.mode] }}-->
          <!--            </template>-->
          <!--          </TableColumn>-->

          <TableColumn title="发送时间" data-index="postAt" :width="120">
            <template #cell="{ record }">
              {{ record.postAt ? dayjs(record.postAt).format('YYYY-MM-DD HH:mm:ss') : '' }}
            </template>
          </TableColumn>
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
      <div class="mt-4">
        <Button type="primary" status="success" class="mr-4" @click="showAddModal">新增视频</Button>
      </div>
    </div>
    <Modal v-model:visible="modalVisible" @ok="handleOk">
      <template #title>添加视频</template>
      <Form :model="form" auto-label-width layout="vertical">
        <FormItem field="content" label="视频BV号或者网页端视频链接">
          <Textarea v-model="form.content" :auto-size="{ minRows: 4 }" placeholder="视频BV号或者网页端视频链接" />
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

<style lang="css"></style>
