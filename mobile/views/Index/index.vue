<template>
  <div class="mobile-home-warp">
    <van-notice-bar color="#fb6d19" background="#ecf9ff"  wrapable :scrollable="false">
      <div class="tips-warp" v-html="tipsHtml"></div>
    </van-notice-bar>
    <van-sticky>
     <div class="serach-warp layout-h-center">
        <van-search
          v-model="keyword"
          :clearable="true"
          background="#bfebd1"
          class="layout-fill"
         @keyup.enter="queryBlogList(null)"
          placeholder="请输入搜索关键词"
          />
          <div class="seach-btn layout-h-center" @click="queryBlogList(null)">检 索</div>
          <div class="seach-btn seach-btn-gao  layout-h-center" @click="openLay()">高级</div>
     </div>
    </van-sticky>
    <div id="blog-warp">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="已经到底了~~"
        loading-text="努力加载中..."
        class="list-bx"
        @load="handleLoadMore"
      >

      <div
          class="total-warp gutter-v-small"
          @click="previewImage()"
          >检索结果：<span class="color-lev1">共{{ total }}条</span></div
        >
        <div class="list-item-blog gutter-v" v-for="(item, index) in blogList" :key="index">
          <div v-html="handleSpecialHtml(item.htmlContent)"></div>
            <p class="content-last">
              ---- 数据来源：<span>{{ item.date }} --- </span
              ><a :href="item.href" target="_blank">{{ item.name }}</a
              ><span>[{{ item.moduleName }}]</span> --- (作者： {{ item.author }})
            </p>
            <div class="num-bx layout-h layout-center">第 {{ index + 1 }} 条</div>
        </div>
      </van-list>
    </div>
    <!-- 回到顶部 -->
    <van-back-top :bottom="20" />
  </div>
  <AdvancedSearch v-model:show="show" v-if="show" @close="close()" @commit="commit" />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import dayjs from "dayjs";
import { showImagePreview } from 'vant'

import AdvancedSearch from './components/AdvancedSearch/index.vue'

import usePrompt from '~/hooks/usePrompt'
import { getList } from "~/api/index";
import { handleSpecialHtml } from '~/utils/index'

const tipsHtml = usePrompt()

const pageSize = 20;
let pageNo = 1;
let searchParmas = {}

const keyword = ref('')
const month = ref([]);
const sort = ref(-1);
const date = ref("");

const blogList = ref([]);
const loading = ref(false);
const show = ref(false);
const finished = ref(false);
const canLoadMore = ref(true);
const total = ref(0);

/* 处理搜索 */
const queryBlogList = async (opt = {}) => {

  try {
    if (opt) {
      searchParmas = opt
    } else {
      const startTime =  month.value && month.value[0] ? dayjs(month.value[0]).startOf("month").valueOf() : null;
      const endTime = month.value && month.value[1] ? dayjs(month.value[1]).endOf("month").valueOf() : null;
      searchParmas = {
        keyword: keyword.value,
        sort: sort.value,
        date: date.value,
        startTime: startTime ? dayjs(startTime).format("YYYY.MM.DD") : '',
        endTime: endTime ? dayjs(endTime).format("YYYY.MM.DD") : ''
      };
    }
    pageNo = 1;
    blogList.value = [];
    const res = await getList({
      ...searchParmas,
      pageSize,
      pageNo,
    });
    blogList.value = res.data.data ?? [];
    total.value = res.data.total ?? 0;
    finished.value = total.value === blogList.value.length;
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
  canLoadMore.value = true;
};

/* 加载更多 */
const handleLoadMore = async () => {
  if (canLoadMore.value && total.value > blogList.value.length) {
    canLoadMore.value = false;
    try {
      pageNo += 1;
      const res = await getList({
        ...searchParmas,
        pageSize,
        pageNo,
      });

      blogList.value.push(...res.data.data);
      total.value = res.data.total;
      finished.value = total.value === blogList.value.length
    } catch (error) {}
    loading.value = false;
    canLoadMore.value = true;
  }
};

const openLay = () => {
  show.value = true
}

const close = () => show.value = false

const commit = (opt) => {s
  queryBlogList(opt)
  keyword.value = opt.keyword
  close()
}

onMounted(() => {
  /* 预览功能 */
  const dom = document.getElementById("blog-warp");
  dom.onclick = (e) => {
    if (e.target?.tagName == "IMG") {
      if (e.target?.src) {
        showImagePreview([e.target?.src]);
      }
    }
  };
});

queryBlogList()
</script>


<style lang="scss" scoped>
.tips-warp {
  font-size: 23px;
}

.list-bx {
  padding:30px;
}
.serach-warp {
  background: #bfebd1;
  padding-right: 20px;
}
.seach-btn {
  font-size: 26px;
  padding: 0 25px;
  height: 66px;
  margin-left: -20px;
  background-color: #4aceba;
  color: #fff;
}
.seach-btn-gao {
  margin-left: 10px;
  background: #cacaca;
  padding: 0 20px;
  font-size: 22px;
  color: #efefef;
}
.total-warp {
  font-size: 22px;
  color: #999;
}
</style>

<style lang="scss" >
.mobile-home-warp {
  .list-item-blog {
    min-height: 80px;
    border: solid 1px #fdb323;
    border-radius: 6px;
    padding: 15px;
    position: relative;
    background-color: #fafbff;
    .title {
      margin: 10px 0 20px  0;
    }
  .num-bx {
    min-width: 60px;
    height: 36px;
    position: absolute;
    top: 0px;
    right: 0px;
    /* border-radius: 20px; */
    background-color: #fdb323;
    border-radius: 0 6px 0 6px;
    color: #fff;
    padding: 0 5px;
    font-size: 22px;
  }
  p {
    line-height: 36px;
    font-size: 28px;
    img {
      width: 360px;
      margin: 10px 0;
    }
  }
  a {
    color: #1d66fb;
  }
  .mark-text {
    background-color: #fdb323;
    text-decoration: underline;
  }
  .title a .mark-text {
    // background-color: #fff;
    text-decoration: none;
    color: #1d66fb;
  }
  .content-last {
    margin-top: 10px;
    color: #666;
    font-size: 20px;
  }
}
.image__preview {
  width: 100%;
  height: 0px;
  overflow: hidden;
}
}
</style>
