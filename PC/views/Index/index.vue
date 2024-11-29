<template>
  <div class="pc-home-warp">
    <p class="tips-bx gutter-v" v-html="tipsHtml"></p>

    <el-affix :offset="0">
      <div class="search-bx layout-v gutter-v-small">
        <div class="layout-h-center layout-full" v-if="searchType === 'normal'">
          <el-input
            v-model.trim="keyword"
            style="max-width: 580px"
            placeholder="输入关键字搜索,不含空格"
            size="large"
            class="gutter-h"
            @keyup.enter="queryBlogList"
            clearable
          >
            <template #append>
              <div @click="queryBlogList()" class="layout-full">立即检索</div>
            </template>
          </el-input>
          <div class="color-lev2 cursor layout-h layout-center">
            <span @click="changeSearchType('detail')">高级检索</span>
            <el-icon style="vertical-align: middle" size="14" color="#666">
              <ArrowRight />
            </el-icon>
          </div>
        </div>
        <div class="search-opt layout-h-center" v-else>
          <el-input
            v-model.trim="keyword"
            style="max-width: 240px"
            placeholder="输入关键字搜索,不含空格"
            size="large"
            class="gutter-h-small"
            clearable
          >
          </el-input>
          <div style="width: 300px" class="gutter-h-small">
            <el-date-picker
              v-model="month"
              type="monthrange"
              range-separator="-"
              start-placeholder="开始月份"
              end-placeholder="结束月份"
              clearable
              :disabled-date="disabledDate"
              size="large"
            />
          </div>
          <el-select
            v-model="sort"
            placeholder="排序"
            style="width: 120px"
            size="large"
            class="gutter-h-small"
          >
            <el-option
              v-for="item in sortList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </el-select>
          <el-select
            v-model="date"
            placeholder="所属资源"
            style="width: 240px"
            size="large"
            class="gutter-h-small"
            clearable
            filterable
          >
            <el-option
              v-for="item in blogNameList"
              :key="item.id"
              :label="`${item.author}--${item.date}--${item.name}`"
              :value="item.date"
            />
          </el-select>
          <div
            class="serach-btn layout-h layout-center gutter-h-small"
            @click="queryBlogList()"
          >
            立即检索
          </div>
          <div class="color-lev2 cursor layout-h layout-center">
            <el-icon style="vertical-align: middle" size="14" color="#666">
              <ArrowLeft /> </el-icon
            ><span @click="changeSearchType('normal')"> 普通检索</span>
          </div>
        </div>
      </div>
    </el-affix>

    <div class="gutter-v color-lev3 layout-h layout-space-between">
      <span
        >检索结果：<span class="color-lev1">共{{ total }}条</span></span
      >
      <div style="padding-top: 2px">
        <el-checkbox
          v-model="showHightLight"
          label="关键字高亮?"
          size="small"
          :disabled="!keyword"
        />
      </div>
    </div>

    <div v-loading="loading">
      <ul
        class="list-bx"
        :class="showHightLight ? '' : 'no-light'"
        v-infinite-scroll="handleLoadMore"
        id="blog-warp"
      >
        <div
          class="list-item-blog gutter-v"
          v-for="(item, index) in blogList"
          :key="index"
        >
          <div v-html="handleSpecialHtml(item.htmlContent)"></div>
          <p class="content-last">
            ---- 数据来源：<span>{{ item.date }} --- </span
            ><a :href="item.href" target="_blank">{{ item.name }}</a
            ><span>[{{ item.moduleName }}]</span> --- (作者： {{ item.author }})
          </p>
          <div class="num-bx layout-h layout-center">第 {{ index + 1 }} 条</div>
        </div>
        <div class="nodata-warp layout-h layout-center" v-if="total === 0">
          <!-- ~~暂 无 数 据~~ -->
          <el-empty description="~~暂 无 数 据~~" />
        </div>
        <!-- 努力加载中 -->
        <div
          class="load-more-tips color-lev3 layout-h layout-center"
          v-if="total && (!canLoadMore || total === blogList.length)"
        >
          {{ total > blogList.length ? "努力加载中..." : "--- 已经到底了---" }}
        </div>
      </ul>
    </div>

    <el-backtop :right="30" :bottom="30" class="k-backtop"> </el-backtop>
  </div>

  <!-- 图片预览 -->
  <div class="image__preview">
    <el-image
      style="width: 20px; height: 20px"
      :src="imgUrlList[0]"
      :zoom-rate="1.2"
      :max-scale="7"
      :min-scale="0.2"
      :url-list="imgUrlList"
      :preview-src-list="imgUrlList"
      hide-on-click-modal
      fit="contain"
      id="image__preview"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, onMounted } from "vue";
import { ArrowRight, ArrowLeft } from "@element-plus/icons-vue";
import dayjs from "dayjs";

import { getList, getBlockNameList } from "~/api/index";
import usePrompt from '~/hooks/usePrompt'
import { handleSpecialHtml } from '~/utils/index'

const tipsHtml = usePrompt()
const pageSize = 20;
let pageNo = 1;
/* 查询条件 */
let searchParmas = {};

const sortList = [
  {
    name: "时间降序",
    value: -1,
  },
  {
    name: "时间升序",
    value: 1,
  },
];

const searchType = ref("normal"); // normal detail
const keyword = ref("");
const month = ref([]);
const sort = ref(-1);
const date = ref("");

const blogList = ref([]);
const loading = ref(false);
const showHightLight = ref(true);
const total = ref(0);
const imgUrlList = ref([""]);
const blogNameList = ref([]);

/* 加载更的锁 */
const canLoadMore = ref(true);

const changeSearchType = (type = "") => {
  searchType.value = type;
  date.value = "";
  month.value = [];
};

const disabledDate = (v) => {
  return Date.now() < v || v < dayjs("2018/12/30").endOf("month").valueOf();
};


/* 处理搜索 */
const queryBlogList = async () => {
  loading.value = true;
  try {
    const startTime =  month.value && month.value[0] ? dayjs(month.value[0]).startOf("month").valueOf() : null;
    const endTime =  month.value && month.value[1] ? dayjs(month.value[1]).endOf("month").valueOf() : null;
    searchParmas = {
      keyword: keyword.value,
      sort: sort.value,
      date: date.value,
      startTime: startTime ? dayjs(startTime).format("YYYY.MM.DD") : '',
      endTime: endTime ? dayjs(endTime).format("YYYY.MM.DD") : ''
    };
    pageNo = 1;
    blogList.value = [];
    const res = await getList({
      ...searchParmas,
      pageSize,
      pageNo,
    });
    blogList.value = res.data.data ?? [];
    total.value = res.data.total ?? 0;
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
    } catch (error) {}
    canLoadMore.value = true;
  }
};

const queryBlogNameList = async () => {
  const res = await getBlockNameList();
  blogNameList.value = res.data ?? [];
};

onMounted(() => {
  /* 预览功能 */
  const dom = document.getElementById("blog-warp");
  dom.onclick = (e) => {
    if (e.target?.tagName == "IMG") {
      if (e.target?.src) {
        imgUrlList.value = [e.target?.src];
        nextTick(() => {
          const imgDom = document.getElementById("image__preview");
          let children = imgDom.children;
          for (let i = 0; i < children.length; i++) {
            if (children[i].tagName === "IMG") {
              children[i].click();
            }
          }
        });
      }
    }
  };
});

queryBlogNameList();
queryBlogList();
</script>
<style scss scoped>
.pc-home-warp {
  width: 96%;
  border: solid 1px #eaeaea;
  border-top: 0;
  border-bottom: 0;
  max-width: 1260px;
  min-height: 100vh;
  /* max-height: 110vh; */
  margin: auto;
  background: #fafbff;
  padding: 10px 20px;
  .k-backtop {
    background-color: #1d66fb;
    color: #fff;
  }
}
.tips-bx {
  min-height: 50px;
  padding: 10px;
  border: solid 1px #fb6d19;
  border-radius: 4px;
  color: #fb6d19;
}
.search-bx {
  /* // min-height: 80px; */
  padding: 25px 20px;
  border-radius: 6px;
  background-color: #bfebd1;
  :deep(.el-input-group__append) {
    background-color: #4aceba;
    cursor: pointer;
    color: #fff;
  }
}
.serach-btn {
  padding: 0 20px;
  background-color: #4aceba;
  cursor: pointer;
  color: #fff;
  height: 36px;
}
.list-bx {
  min-height: calc(100vh - 120px);
  border: solid 1px #4aceba;
  border-radius: 6px;
  padding: 10px 20px;
}

.nodata-warp {
  height: 320px;
  color: #666;
  font-size: 18px;
}
.color-lev3 {
  color: #999;
}
.color-lev2 {
  color: #666;
}
.color-lev1 {
  color: #333;
}
</style>
<style lang="scss">
.pc-home-warp {


  .list-item-blog {
    min-height: 80px;
    border: solid 1px #fdb323;
    border-radius: 6px;
    padding: 15px;
    position: relative;
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
    }
    p {
      line-height: 22px;
      font-size: 16px;
      img {
        height: 180px;
        margin: 10px 0;
        max-width: 100%;
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
      font-size: 12px;
    }
  }

  .no-light {
    .list-item-blog {
      .mark-text {
        background-color: inherit;
        text-decoration: inherit;
      }
      .title a .mark-text {
        // background-color: #fff;
        text-decoration: inherit;
        color: blue;
      }
    }
  }
  .image__preview {
    width: 100%;
    height: 0px;
    overflow: hidden;
  }
}
</style>
