

import { load } from 'cheerio'
import axios from 'axios'
import schedule from 'node-schedule'
import { v4 as uuidv4 } from "uuid"

import DBHelper from './../mongodb/connect'
import blogNameHelper from './blogNameHelper'



class BlogDataSchema {
  BLOG_DATA = null;
  _timer = null;
  _job = null;
  _timeTimes = 0;

  constructor() {
    this._init();
    setTimeout(() => {
      this._initTask()
    }, 3000)

    // this._initData()
  }

  _init() {
    /* 轮询，保证数据库连接完成 */
    this._timer = setInterval(() => {
      /*  数据库已经连接 */
      if (DBHelper?.db) {
        if (!this.BLOG_DATA) {
          this.BLOG_DATA = this._getBLOG_DATACollection();
        }
        this._timeTimes = 11;
      }
      /* 10秒内数据库没有连接成功， 清除定时器 */
      if (this._timeTimes > 10) {
        clearInterval(this._timer);
        this._timer = null;
      }

      this._timeTimes++;
    }, 1000);
  }
  /* 初始 Schema */
  _getBLOG_DATACollection() {
    let DB = DBHelper?.db;
    const Schema = DB.Schema;

    const BLOG_DATA_Schema = new Schema({
      id: { type: String },
      /* 创建时间 */
      creatTime: { type: Number },
      /* 资源名称 */
      name: { type: String },
      /* 路径 */
      href: { type: String },
      /* 日期 */
      date: { type: String },
      /* 作者 */
      author: { type: String },
      /* 模块名称 */
      moduleName: { type: String },
      /* 标题 */
      title: { type: String },
      /* 中文内容 */
      content: { type: String },
      /* 中文内容（html） */
      htmlContent: { type: String },
    });

    const BlogData_Schema = DB.model("pro_blogData", BLOG_DATA_Schema);
    return BlogData_Schema;
  }

  /* 一次性插入多个数据 */
  _insetDataMore(date, arr) {
    blogNameHelper
      .findBlogByParam({ date })
      .exec()
      .then(async (docs) => {
        /* 从未写入则写入 */
        if (docs && docs.length) {
          const row = docs[0];
          if (!row.isDone) {
            await this?.BLOG_DATA.insertMany(arr);
            console.log(`--------------成功写入${date}, ${arr.length}个------------`);
            blogNameHelper.updateRowByDate(date, { isDone: true });
          }
        }
      })
      .catch((err) => {
        // 处理错误
        console.log("插入数据错误:", err);
      });
  }

  /* 处理html， 获取描述文案(去掉html) */
  _handleContent(html = "", title = "", jq) {
    const content = `<div>${html}</div>`;
    let targetText = jq(content).text();
    /* 去掉换行符 */
    targetText = targetText.replace(/(\r?\n|\r)/g, "");
    /* 去掉空字符 */
    targetText = targetText.replace(/\s+/gi, "");
    const titleText = title.replace(/\s+/gi, "");
    return `${titleText},${targetText}`;
  }

  _handleBlogDataByHtml(opt = {}) {
    return new Promise(async (resolve, reject) => {
      const res = await axios.get(opt.href)
      if (res.status === 200) {
        const $ = load(res.data);
        const aDoms = $("#main-content").find("a");
        aDoms.each((i, item) => {
          $(item).attr("target", "_blank");
        });

        let htmlStr = $("#main-content").html() ?? '';
        /* 分模块截取 */
        htmlStr = htmlStr.replace(/<h2>/gi, `AAAA<h2>`);
        const htmlArr = htmlStr.split("AAAA");
        /* 含有类似1、xxxxx 才会留下 */
        const regex = /<p>(\d+)、<a/gi;
        const targetHtmlArr = htmlArr.filter((item) => regex.test(item));
        /* 拆解 */
        const targeArr = targetHtmlArr.map((item) => {
          const prefix = "BBBB";
          const titem = item.replace(regex, (match, p1) => {
            return `${prefix}<p class="title"><a`;
          });
          return titem;
        });
        const modus = [];
        targeArr.forEach((item) => {
          if (item) {
            const tArr = item.split("BBBB");
            let moduleName = "";

            tArr.forEach((gtem, index) => {
              if (index === 0) {
                moduleName = $(gtem).text();
              } else {
                const content = `${gtem}`;
                const p = $(`<div>${content}</div>`).find(".title");
                const title = $(p).text();
                modus.push({
                  ...opt,
                  id: uuidv4(),
                  creatTime: Date.now(),
                  moduleName: moduleName.replace(/(\r?\n|\r)/g, ""),
                  title,
                  content: this._handleContent(content, title, $),
                  htmlContent: content.replace(/(\r?\n|\r)/g, ""),
                });
              }
            });
          }
        });
        this._insetDataMore(opt.date, modus);
        resolve(true);
      } else {
        resolve(true)
      }
    })
  }

  /* 处理出最新没有获取博客数据 */
  async _getLastBlogData() {
    /* 更新最新列表数据 */
    await blogNameHelper.upDateLatestData()
    const list = await blogNameHelper
      .findBlogByParam({ isDone: false })
      .sort({ date: -1 });
    for (let i = 0; i < list.length; i++) {
      const row = list[i];
      await this._handleBlogDataByHtml({
        name: row.name,
        href: row.href,
        date: row.date,
        author: row.author
      });
    }
  }

  /* 初始数据 */
  async _initData() {
    /* 延时5秒执行， 保证数据库完成连接后执行 */
    setTimeout(() => {
      const list = await blogNameHelper.findBlogByParam({ isDone: false }).sort({ date: -1 });
      for (let i = 0; i < list.length; i++) {
        const row = list[i];
        // blogNameHelper.updateRowByDate(date， { isDone: false });
        await this._handleBlogDataByHtml({
          name: row.name,
          href: row.href,
          date: row.date,
          author: row.author,
        });
      }
    }, 5000)
  }

  /* 定时任务 */
  _initTask() {
    if (this._job) this._job?.cancel()
    /* 每周六凌晨1点执行任务 */
    this._job = schedule.scheduleJob('0 1 * * 6', () => {
      this._getLastBlogData()
    });
  }

  /* html 标记关键字高亮 */
  handleHighlight (html = "", keyword = "") {
    if (keyword) {
      const $ = load(`<div class="blog">${html}</div>`);
      let regex = new RegExp(keyword, 'gi')
      /* 所有的子元素的属性包含关键字 替换成YYYggYY */
      const childrens = $(".blog").find('*');
      $(childrens).each((c, child) => {
        const map = child.attribs ?? {}
        for(let key in map){
          $(child).attr(key, map[key]?.replace(regex, `YYY__YY`))
        }
        /* 处理空字符 */
        const pChild = $(child).children()
        if (pChild.length < 1) {
          const text = $(child).text()
          $(child).text(text?.replace(/\s+/g, ''))
        }
      });
      let targetHtml = $(".blog").html()
      /* 增加高亮标签 */
      targetHtml = targetHtml?.replace(regex,  `<mark class="mark-text">${keyword}</mark>`)
      /* 还原子元素属性值 */
      targetHtml = targetHtml?.replace(/YYY__YY/gi, keyword)
      return targetHtml
    }
  }

  /* 博客数据关键字搜索 Api*/
  handleSearchData(params = {}) {
    return new Promise(async (resolve, rejt) => {
      /* 一次最多能请求30条数据 */
      const size = params.pageSize > 30 ? 30 : params.pageSize || 30;
      let page = params.pageNo || 1;
      let opt = { $and: [] };
      const keyword = params.keyword;
      const sort = params.sort ?? -1;
      const date = params.date;
      const startTime = params.startTime;
      const endTime = params.endTime;

      if (date) {
        opt.$and.push({ date })
      } else {
        if (startTime && endTime) {
          opt.$and.push({ date: { $gte: startTime, $lte: endTime }  })
        }
      }
      if (keyword) {
        opt.$and.push({
          content: { $regex: keyword, $options: "i" },
        });
      }

      try {
        const count = await this?.BLOG_DATA?.countDocuments(opt);
        if (count < size) {
          page = 1;
        }
        const skipNum = (page - 1) * size;
        const list = await this?.BLOG_DATA.find(opt)
          .sort({ date: +sort })
          .skip(skipNum)
          .limit(size);
        resolve({
         data: list,
          total: count,
          pageNo: page,
          pageSize: size,
        });
      } catch (error) {
        console.log("--------------------关键字搜索, Error-----");
        console.log(error);
        rejt({
          data: [],
          total: 0,
        });
      }
    });
  }
}

const helper = new BlogDataSchema();

export default helper
