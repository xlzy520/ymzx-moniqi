<script setup>
import { defineExpose, onMounted, ref, reactive, computed } from 'vue'
import {
  Button,
  Doption,
  Dropdown,
  Input,
  InputNumber,
  Message,
  Modal,
  Popconfirm,
  TabPane,
  Table,
  TableColumn,
  Tabs,
  Tag,
  Tooltip,
} from '@arco-design/web-vue'
import { IconExport, IconImport, IconQuestionCircle } from '@arco-design/web-vue/es/icon'
import {
  DefaultReplaceTexts,
  exportJson,
  getAccountList,
  parseImportCookie,
  removeUser,
  saveOrUpdateUser,
  getSpaceInfo,
  getLocalValue,
  setLocalValue,
  getSimpleCookie,
  sleep,
} from '@/utils/index'
import uniqBy from 'lodash/uniqBy'

const data = ref([])
const loading = ref(false)
const commonConfig = ref({})
const showFansList = ref(false)
const goUploadVideoWithClient = ref(false)

const pagination = ref({
  pageSize: 10,
  size: 'small',
  total: 0,
  current: 1,
  // showPageSize: true, // 打包之后有bug，无法使用选择框
})

const selectedKeys = ref([])
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
})
const activeTab = ref('all')
const ckImportStartIndex = ref(0)
const currentMid = ref('')
const currentLoginNickname = ref('')

const onTagTabClick = (key) => {
  pagination.value.current = 1
  activeTab.value = key
}

const handleCurrentNickname = async (mid) => {
  const account = data.value.find((item) => item.mid === mid)
  if (account) {
    currentLoginNickname.value = account.nickname || account.mid
  }
}

const getList = async () => {
  loading.value = true
  let userList = (await getAccountList()) || []
  data.value = userList
  pagination.value.total = userList.length
  ckImportStartIndex.value = data.value.length
}

const checkStatusStartIndexVisible = ref(false)
const checkStatusStartIndex = ref(0)
const checkStatus = async (list) => {
  if (!list) {
    list = [...data.value].slice(checkStatusStartIndex.value)
  }
  let index = 0
  for (const account of list) {
    index++
    try {
      const simpleCookie = getSimpleCookie(account)
      const spaceInfoData = await getSpaceInfo(simpleCookie)
      if (spaceInfoData.code !== 0) {
        await saveOrUpdateUser({
          mid: String(account.mid),
          status: '已掉线',
        })
      } else {
        const spaceInfo = spaceInfoData.data
        await saveOrUpdateUser({
          mid: String(account.mid),
          face: spaceInfo.face,
          nickname: spaceInfo.name,
          silence: spaceInfo.silence,
          level_exp: spaceInfo.level_exp,
          level: spaceInfo.level,
          coins: spaceInfo.coins,
          status: spaceInfo.silence === 1 ? '已封禁' : '正常',
          follower: spaceInfo.follower,
        })
      }
      Message.success(`用户【${account.mid}】数据更新成功`)
      if (index % 4 === 0) {
        getList()
      }
      await sleep(360)
    } catch (err) {
      if (err.message === '账号未登录') {
        saveOrUpdateUser({
          mid: String(account.mid),
          status: '已掉线',
        })
      }
    }
  }
  getList()
}

const setCheckStatusStartIndex = () => {
  let list = [...data.value]
  if (selectedKeys.value.length) {
    list = data.value.filter((item) => {
      return selectedKeys.value.includes(String(item.mid))
    })
    checkStatus(list)
  } else {
    checkStatusStartIndexVisible.value = true
  }
}

const videoBV = ref('')

const visible = ref(false)

const copyCookie = (record) => {
  const ck = getSimpleCookie(record)
  navigator.clipboard.writeText(ck).then(() => {
    Message.success('复制成功')
  })
}
const remove = (record) => {
  removeUser(record).then(() => {
    Message.success('删除成功')
    getList()
  })
}

const onClearAccountSelect = (key) => {
  exportUserList()
  Message.success('CK导出成功')
  const status = key === 'offline' ? '已掉线' : '已封禁'
  const aliveUserList = [...data.value].filter((v) => v.status !== status)
  setLocalValue('userList', aliveUserList).then(() => {
    getList()
    Message.success(`清空全部 【${status}】账号成功`)
  })
}

const batchDelete = () => {
  if (selectedKeys.value.length === 0) {
    Message.error('请先选择账号')
    return
  }
  const list = [...data.value]
  selectedKeys.value.forEach((mid) => {
    const index = list.findIndex((item) => String(item.mid) === mid)
    if (index > -1) {
      list.splice(index, 1)
    }
  })
  setLocalValue('userList', list).then(() => {
    getList()
    Message.success('删除成功')
  })
}

const onTagSelect = (key) => {
  const len = selectedKeys.value.length
  if (len === 0) {
    Message.error('请先选择账号')
    return
  }
  const list = [...data.value]
  selectedKeys.value.forEach((mid) => {
    const index = list.findIndex((item) => String(item.mid) === mid)
    if (index > -1) {
      if (key === 'clear') {
        if (activeTab.value === 'all') {
          list[index].like = false
          list[index].imgNote = false
          list[index].reply = false
          list[index].danmu = false
          list[index].dy = false
          list[index].tripleLike = false
          list[index].video = false
        } else {
          list[index][activeTab.value] = false
        }
      } else {
        list[index][key] = true
      }
    }
  })
  setLocalValue('userList', list).then(() => {
    getList()
    Message.success('标记成功')
  })
  selectedKeys.value = []
}

const ckImportStartIndexVisible = ref(false)

const showCkImportIndexModal = async () => {
  ckImportStartIndexVisible.value = true
}

const onFileChange = async (evt) => {
  const file = evt.target.files[0]
  const reader = new FileReader()
  reader.readAsText(file)
  reader.onload = async (readerEvt) => {
    const fileString = readerEvt.target.result
    const userList = [...data.value]
    const replaceCookieTexts = DefaultReplaceTexts
    const newUsers = await parseImportCookie(fileString, replaceCookieTexts)
    if (ckImportStartIndex.value > -1) {
      userList.splice(ckImportStartIndex.value, 0, ...newUsers)
    } else {
      userList.push(...newUsers)
    }

    setLocalValue('userList', uniqBy(userList, 'mid'))
      .then(() => {
        getList()
        Message.success('导入成功')
        const importFiles = document.querySelector('#importJson')
        importFiles.value = ''
      })
      .catch((err) => {
        const message = err.message || ''
        if (message.includes('quota')) {
          Message.error('导入失败，存储空间不足，可以考虑重装插件或者联系作者')
          return
        }
        Message.error('导入失败, 请联系作者')
      })
  }
}

const importJson = () => {
  const input = document.querySelector('#importJson')
  input.click()
}

const exportUserList = () => {
  if (selectedKeys.value.length) {
    const selectedList = [...data.value].filter((item) => selectedKeys.value.includes(String(item.mid)))
    exportJson(selectedList)
  } else {
    exportJson()
  }
}

const query = ref('')
const level = ref('')

const resetPagination = () => {
  pagination.value.current = 1
}

const filterList = computed(() => {
  let filterList = [...data.value]
  if (activeTab.value !== 'all') {
    filterList = filterList.filter((item) => {
      return item[activeTab.value]
    })
  }
  if (level.value) {
    filterList = filterList.filter((item) => {
      return item.level_exp?.current_level === level.value
    })
  }
  if (query.value) {
    filterList = filterList.filter((item) => {
      return String(item.mid).includes(query.value) || item.nickname?.includes(query.value)
    })
  }
  const current = pagination.value.current
  const start = (current - 1) * pagination.value.pageSize
  const end = current * pagination.value.pageSize
  const currentPageUserList = filterList.slice(start, end)
  pagination.value.total = filterList.length
  loading.value = false
  if (currentPageUserList.length === 0 && current > 1) {
    return filterList.slice(start - pagination.value.pageSize, end - pagination.value.pageSize)
  }
  return currentPageUserList
})

const onPageChange = (page) => {
  pagination.value.current = page
  setLocalValue('currentPage', page)
}

const onPageSizeChange = (val) => {
  if (val >= 1) {
    pagination.value.pageSize = val
  } else {
    pagination.value.pageSize = 10
  }
  onPageChange(1)
}

const rowClick = (record) => {
  currentMid.value = record.mid
}

const rowClass = (record) => {
  return record.mid === currentMid.value ? 'bg-red-row' : ''
}

const sortVisible = ref(false)
const newSortIndex = ref(0)
const oldSortIndex = ref(0)
const showSortModal = (record) => {
  const index = data.value.findIndex((item) => item.mid === record.mid)
  oldSortIndex.value = index
  sortVisible.value = true
}

const onSubmitSort = () => {
  const userList = [...data.value]
  const [removed] = userList.splice(oldSortIndex.value, 1)
  userList.splice(newSortIndex.value, 0, removed)
  setLocalValue('userList', userList).then(() => {
    getList()
    Message.success('排序成功')
  })
}

onMounted(async () => {
  commonConfig.value = await getLocalValue('commonConfig')
  // currentMid.value = await getLocalValue('currentMid')
  // showFansList.value = await getLocalValue('showFansList')
  // goUploadVideoWithClient.value = await getLocalValue('goUploadVideoWithClient')
  const currentPage = await getLocalValue('currentPage')
  if (currentPage) {
    pagination.value.current = currentPage
  }
  getList()
})

defineExpose({
  getList,
})
</script>

<template>
  <div class="w-full p-2">
    <!--    <div class="mb-1 layout-slide">-->
    <!--      <div class="">-->
    <!--        已登录账号：-->
    <!--        <Tag color="#fb7299">-->
    <!--          {{ currentLoginNickname }}-->
    <!--        </Tag>-->
    <!--      </div>-->
    <!--    </div>-->

    <div class="layout-slide mb-2 w-full">
      <div class="layout-items-center">
        <Dropdown @select="onTagSelect">
          <Button :disabled="selectedKeys.length === 0" type="primary" class="" size="mini">
            账号分类
            <Tooltip content="用于对不同的账号的用途进行分类，例如选择哪些账号标记为点赞，或者评论等">
              <IconQuestionCircle />
            </Tooltip>
          </Button>
          <template #content>
            <!--            <Doption value="reply">评论</Doption>-->
            <!--            <Doption value="like">点赞</Doption>-->
            <!--            <Doption value="imgNote">发图</Doption>-->
            <!--            <Doption value="video">发视频</Doption>-->
            <!--            <Doption value="dy">动态</Doption>-->
            <Doption value="danmu">弹幕</Doption>
            <!--            <Doption value="tripleLike">三连</Doption>-->
            <Doption value="clear">清除标记</Doption>
          </template>
        </Dropdown>

        <Tooltip content="获取并更新账号信息">
          <Button type="primary" class="ml-2" size="mini" @click="setCheckStatusStartIndex">检查</Button>
        </Tooltip>
        <!--        <Popconfirm content="批量刷视频领取硬币" position="bottom" type="warning" @ok="showVideoBVModal"> -->
        <!--          <Button -->
        <!--            type="primary" -->
        <!--            class="ml-2" -->
        <!--            size="mini" -->
        <!--          > -->
        <!--            领硬币 -->
        <!--          </Button> -->
        <!--        </Popconfirm> -->
        <Dropdown @select="onClearAccountSelect">
          <Button class="ml-2" type="primary" status="danger" size="mini">清空死号</Button>
          <template #content>
            <Doption value="offline">清空已掉线</Doption>
            <Doption value="ban">清空已封禁</Doption>
          </template>
        </Dropdown>

        <!--        <Popconfirm v-if="!selectedKeys.length" content="确认清空全部死号吗？建议先导出CK进行备份" position="bottom" type="warning" @ok="clearAllDeadUser"> -->
        <!--          <Tooltip content="一键删除【已掉线、已封禁】账号" /> -->
        <!--        </Popconfirm> -->
        <Popconfirm
          v-if="selectedKeys.length"
          content="确认删除已选账号吗？建议先导出CK进行备份"
          position="bottom"
          type="warning"
          @ok="batchDelete"
        >
          <Button class="ml-2" type="primary" status="danger" size="mini">批量删除</Button>
        </Popconfirm>
        <!--        <Button -->
        <!--          type="primary" -->
        <!--          class="ml-2" -->
        <!--          size="mini" -->
        <!--          @click="onLevelUp" -->
        <!--        > -->
        <!--          一键刷经验 -->
        <!--        </Button> -->
      </div>
      <div>
        <input id="importJson" type="file" hidden @change="onFileChange" />
        <Tooltip content="导入存入CK的文件，支持纯CK格式，或者aa----bb----ck格式">
          <Button type="outline" size="mini" @click="showCkImportIndexModal">
            <template #icon>
              <IconImport />
            </template>
            CK导入
          </Button>
        </Tooltip>
        <Tooltip content="导出CK，选择用户之后点击会导出部分账号，直接点击导出全部">
          <Button class="ml-1" size="mini" type="outline" @click="exportUserList">
            <template #icon>
              <IconExport />
            </template>
            CK导出
          </Button>
        </Tooltip>
      </div>
    </div>
    <div class="user-table">
      <div class="layout-slide mb-1">
        <div class="">
          <Tabs :active-key="activeTab" @tab-click="onTagTabClick">
            <TabPane key="all" title="全部" />
            <!--            <TabPane key="reply" title="评论" />-->
            <!--            <TabPane key="like" title="点赞" />-->
            <!--            <TabPane key="imgNote" title="发图" />-->
            <!--            <TabPane key="video" title="发视频" />-->
            <!--            <TabPane key="dy" title="动态" />-->
            <TabPane key="danmu" title="弹幕" />
            <!--            <TabPane key="tripleLike" title="三连" />-->
          </Tabs>
        </div>
        <div class="layout-items-center">
          <div class="w-[60px] layout-items-center mr-2">
            <InputNumber v-model="level" hide-button placeholder="等级" size="mini" :min="0" :max="6" @change="resetPagination" />
          </div>
          <div class="w-[160px]">
            <Input v-model="query" allow-clear class="" size="mini" placeholder="输入账号/昵称，回车搜索" @change="resetPagination" />
          </div>
        </div>
      </div>
      <Table
        v-model:selectedKeys="selectedKeys"
        :loading="loading"
        :virtual-list-props="{ height: '60vh' }"
        :scroll="{ w: '100%' }"
        row-key="mid"
        :data="filterList"
        :pagination="pagination"
        :row-selection="rowSelection"
        :row-class="rowClass"
        @page-change="onPageChange"
        @row-click="rowClick"
      >
        <template #columns>
          <TableColumn title="" data-index="index" width="30" body-cell-class="index-column">
            <template #cell="{ rowIndex }">
              {{ pagination.pageSize * (pagination.current - 1) + rowIndex + 1 }}
            </template>
          </TableColumn>
          <TableColumn title="昵称/账号" data-index="nickname" ellipsis tooltip width="120">
            <template #cell="{ record }">
              <div class="layout-items-center">
                <img v-if="record.face" :src="record.face" class="w-6 h-6 rounded-full" />
                <Tooltip :content="record.nickname || record.mid">
                  <span class="ml-2 truncate">{{ record.nickname || record.mid }}</span>
                </Tooltip>
              </div>
            </template>
          </TableColumn>
          <TableColumn title="状态" data-index="status" width="60">
            <template #cell="{ record }">
              <Tag size="small" :color="record.status === '正常' ? '#00B42A' : '#F53F3F'">
                {{ record.status || '待检查' }}
              </Tag>
            </template>
          </TableColumn>
          <TableColumn title="等级" width="60">
            <template #cell="{ record }">
              <div v-if="record.level || record.level_exp" class="whitespace-nowrap flex">
                <Tag color="arcoblue" size="small">
                  {{ record.level || record.level_exp?.current_level }}
                </Tag>
              </div>
            </template>
          </TableColumn>
          <TableColumn title="硬币" data-index="coins" width="80" />
          <TableColumn v-if="showFansList" title="粉丝" data-index="follower" width="80" />
          <!--          <TableColumn title="sessdata" data-index="sessdata" ellipsis tooltip width="100" /> -->
          <!--          <TableColumn title="accessKey" data-index="accessKey" ellipsis tooltip width="100" /> -->
          <TableColumn title="mid" data-index="mid" width="100" ellipsis tooltip align="center" />
          <!--          <TableColumn title="时间" width="110" align="center"> -->
          <!--            <template #cell="{ record }"> -->
          <!--              {{ formatDate(record.date, '{y}-{m}-{d}') }} -->
          <!--            </template> -->
          <!--          </TableColumn> -->
          <!--          <TableColumn title="备注" width="110" align="center"> -->
          <!--            <template #cell="{ record }"> -->
          <!--              <Input v-model="record.remark" @change="val => changeRemark(val, record)" /> -->
          <!--            </template> -->
          <!--          </TableColumn> -->
          <TableColumn title="操作" width="360">
            <template #cell="{ record }">
              <div class="layout-items-center">
                <Button class="ml-2" type="primary" status="success" size="mini" @click="copyCookie(record)">复制CK</Button>
                <Button class="ml-2" type="primary" status="success" size="mini" @click="showSortModal(record)">排序</Button>
                <Popconfirm content="确认删除吗？" position="lt" @ok="remove(record)">
                  <Button class="ml-2" type="primary" status="danger" size="mini">删除</Button>
                </Popconfirm>
              </div>
            </template>
          </TableColumn>
        </template>
      </Table>
      <div class="custom-pagination">
        <Tag color="#fb7299">共 {{ data.length }}条</Tag>
        <div class="ml-2 whitespace-nowrap">每页条数：</div>
        <div class="w-[120px]">
          <Input :model-value="pagination.pageSize" size="mini" placeholder="请输入每页显示多少条" @input="onPageSizeChange" />
        </div>
      </div>
    </div>

    <Modal v-model:visible="checkStatusStartIndexVisible" title="一键检查状态开始位置" @ok="checkStatus">
      <Input v-model="checkStatusStartIndex" placeholder="请输入从第几个账号开始检查" />
    </Modal>
    <Modal v-model:visible="ckImportStartIndexVisible" title="CK导入起始位置" @ok="importJson">
      <InputNumber v-model="ckImportStartIndex" :min="0" placeholder="请输入从第几个账号开始插入新导入的CK" />
    </Modal>
    <Modal v-model:visible="sortVisible" title="新的位置" @ok="onSubmitSort">
      <InputNumber v-model="newSortIndex" :min="0" placeholder="请输入新的位置，第几个账号就输入几" />
    </Modal>
  </div>
</template>

<style lang="scss">
.user-table {
  .index-column {
    .arco-table-cell {
      padding: 0;
    }
  }
}
.user-table .arco-table-pagination {
  margin-top: 5px;
}
.user-table .arco-table-container {
  min-height: 335px;
}
.user-table .arco-tabs-content {
  display: none;
}
.user-table .arco-tabs-nav-type-line .arco-tabs-tab {
  padding: 0;
  margin: 0 8px;
}
.custom-pagination {
  display: flex;
  align-items: center;
  //position: absolute;
  //bottom: 0;
}
.bg-red-row {
  .arco-table-td {
    @apply bg-red-300;
  }
}
</style>
