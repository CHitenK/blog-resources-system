<template>
  <van-action-sheet v-model:show="show" safe-area-inset-bottom ref="sheetEl">
    <div class="content">
      <div class="title layout-h layout-center">高级检索</div>
      <div class="content-warp">
        <van-search
          v-model="state.keyword"
          :clearable="true"
          background="#bfebd1"
          class="layout-fill"
          placeholder="请输入搜索关键词"
          />
          <div class="seach-item-warp layout-h">
            <div class="seach-item-warp-lf">
              <van-sidebar v-model="active">
                <van-sidebar-item title="月份" />
                <van-sidebar-item title="时间排序" />
                <van-sidebar-item title="所属资源" />
              </van-sidebar>
            </div>
            <div class="seach-item-warp-rg layout-fill">
              <!-- 月份 -->
              <div class="month-warp" v-if="active === 0">
                <van-date-picker
                  v-model="state.startDate"
                  title="开始月份"
                  option-height="1rem"
                  :min-date="new Date(2019, 0, 1)"
                  :max-date="new Date()"
                  visible-option-num="3"
                  :columns-type="['year', 'month']"
                />
                <van-divider />
                <van-date-picker
                  v-model="state.endDate"
                  title="结束月份"
                  option-height="1rem"
                  :max-date="new Date()"
                  visible-option-num="3"
                  :columns-type="['year', 'month']"
                />

              </div>
              <!-- 排序 -->
               <div class="paixu" v-if="active === 1">
                <van-radio-group v-model="state.sort">
                  <van-radio :name="-1" class="gutter-v-large">
                    <span>时间降序</span>
                  </van-radio>
                  <van-radio :name="1"><span>时间升序</span></van-radio>
                </van-radio-group>
               </div>
               <!-- 所属资源 -->
                <div class="resource-warp" v-if="active === 2">
                  <van-search
                    v-model="keyword"
                    :clearable="true"
                    class="layout-fill"
                    placeholder="筛选词"
                    />
                    <van-checkbox-group v-model="state.dateArr" :max="1">
                      <van-cell-group inset>
                        <van-cell
                          v-for="(item, index) in blogNameList"
                          clickable
                          :key="item"
                          @click="toggle(index)"
                        >
                        <template #title>
                          <span class="blog-name">{{ item.name }}</span>
                        </template>
                          <template #right-icon>
                            <van-checkbox
                              :name="item.date"
                              @click.stop
                            />
                          </template>
                        </van-cell>
                      </van-cell-group>
                    </van-checkbox-group>
                </div>
            </div>
          </div>
      </div>
      <div class="btn-warp layout-h">
        <div class="layout-h layout-center btn-warp-lf" @click="handleClose">
          返 回
        </div>
        <div class="layout-h layout-center btn-warp-rg" @click="commit()">
          检 索
        </div>
      </div>
    </div>
  </van-action-sheet>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import dayjs from 'dayjs'

import { getBlockNameList } from "~/api/index";

const currentYaer = dayjs().format('YYYY')
const currentMonth = dayjs().format('MM')
const props = defineProps({
  keyword: {
    type: String,
    default: ''
  }
})

const { keyword = '' } = props

const state = reactive({
  keyword,
  startDate: ['2019', 1],
  endDate: [currentYaer, currentMonth],
  sort: -1,
  dateArr: []
})

const blogNameList = ref([])
const sheetEl = ref(null)

const show = ref(true)
const active = ref(0)

const checkboxRefs = ref([]);

const emit = defineEmits(['update:modelValue', 'commit', 'close'])
const handleClose = () => {
  emit('close', false)
}

const queryBlogNameList = async () => {
  const res = await getBlockNameList();
  blogNameList.value = res.data ?? [];
};

const toggle = (index) => {
  checkboxRefs.value[index]?.toggle();
};

const commit = () => {
  const opt = {
    keyword: state.keyword,
    sort: state.sort,
    startTime: `${state.startDate[0]}.${state.startDate[1]}.01`,
    endTime: `${state.endDate[0]}.${state.endDate[1]}.01`,
    date: state.dateArr[0] ?? ''
  }
  emit('commit', opt)
}

queryBlogNameList();

</script>


<style lang="scss" scoped>
.content {
  height: 80vh;
}
.title {
  height: 90px;
  font-size: 30px;
}
.content-warp {
  border-top: solid 1px #eaeaea;
  height: calc(100% - 200px);
  padding: 10px 20px;
}
.seach-item-warp {
   height: calc(100% - 90px);
   padding: 20px 0;
}
.seach-item-warp-lf {
  height: 100%;
  width: 160px;
  background-color: #f7f8fa;
}
.seach-item-warp-rg  {
  background-color: #fff;
  height: 100%;
  overflow-y: scroll;
  padding: 15px;
  .month-warp {
    height: 100%;
  }
  .paixu {
    font-size: 30px;
  }
}
.btn-warp{
  height: 110px;
  border-top: solid 1px #efefef;
  font-size: 34px;

}
.btn-warp-lf {
  background-color: #efefef;
  height: 100%;
  flex: 1;
  color: #999;
}
.btn-warp-rg {
  height: 100%;
  flex: 1;
  background-color: #4aceba;
  color: #fff
}
.resource-warp {
  :deep(.van-search) {
    padding: 0;
  }
  :deep(.van-cell-group--inset) {
    margin: 0;
  }
}
.blog-name {
  font-size: 24px;
  padding-right: 10px;
}

</style>
