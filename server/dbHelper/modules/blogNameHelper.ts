

import dayjs from 'dayjs'
import { load } from 'cheerio'
import axios from 'axios'

import DBHelper from './../mongodb/connect'


class BlogNameSchema {
  BLOG_NAME = null;
  _timer = null;
  _timeTimes = 0;

  constructor() {
    this._init();

    // this._initBlogList()
  }

  _init() {
    /* 轮询，保证数据库连接完成 */
    this._timer = setInterval(() => {
      /*  数据库已经连接 */
      if (DBHelper?.db) {
        if (!this.BLOG_NAME) {
          this.BLOG_NAME = this._getBLOG_NAMECollection();
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
  _getBLOG_NAMECollection() {
    let DB = DBHelper?.db;
    const Schema = DB.Schema;

    const BLOG_NAME_Schema = new Schema({
      id: { type: String },
      /* 创建时间 */
      creatTime: { type: Number },
      /* 资源名称 */
      name: { type: String },
      /* 资源路径 */
      href: { type: String },
      /* 日期 */
      date: { type: String },
      /* 作者 */
      author: { type: String },
      /* 资源是否被爬虫分解 */
      isDone: { type: Boolean },
    });

    const schema = DB.model("pro_blogName", BLOG_NAME_Schema);

    return schema;
  }

  /* 插入数据 */
  insetData(opt = {}) {
    this?.BLOG_NAME.find({ date: opt.date })
      .exec()
      .then((docs) => {
        /* 从未写入则写入 */
        if (docs && docs.length < 1) {
          const blogName = new this?.BLOG_NAME({
            ...opt,
            id: opt.date,
            creatTime: Date.now(),
          });
          blogName.save();
          console.log(
            `--------------成功写入${opt.date}--${opt.name}------------`
          );
        }
      })
      .catch((err) => {
        // 处理错误
        console.log("插入数据错误:", err);
      });
  }

  /* 查询列表数据的最新数据的日期 */
  getLastDateByRow() {
    return new Promise(async (resolve, reject) => {
      const res = await this.BLOG_NAME?.find().sort({ date: -1 });
      const date = res[0]?.date;
      resolve(date);
    });
  }

  /* 爬虫 处理html */
  _handleHttpGetHtml(url = 'https://www.ruanyifeng.com/blog/2024/11/') {
    if (!url) return Promise.resolve()
    return new Promise(async(resolve, reject) => {
      const res = await axios.get(url)
      if (res.status === 200) {
        const $ = load(res.data);
        /* 获取博客名称数据列表 */
        $(".module-list-item").each((i, item) => {
          const html = $(item).html();
          /* 文字中不包含上月，下月的博客名称列表 */
          if (!html?.includes("上月：") && !html?.includes("下月：")) {
            const aEl = $(item).find("a");
            const href = $(aEl).attr("href");
            const name = $(aEl).text();
            /* 截取日期 */
            const arr = html?.split("：<a");
            const date = arr[0];
            const insetOpt = {
              href,
              name,
              date,
              author: "阮一峰",
              isDone: false,
            }
            this.insetData(insetOpt)
            resolve(true)
          }
        });

      } else {
        resolve(true)
      }
    })
  }

  /* 初始全部博客数据 谨慎执行, 可以当数据集合blognames被删除时执行 */
  async _initBlogList(startYear = 2020, lastYaer = 2024) {
    /* 延时5秒执行， 保证数据库完成连接后执行 */
    setTimeout(() => {
      const currYaer = +dayjs().format("YYYY")
        const yaer = lastYaer ?? currYaer;
        for (let y = startYear; y <= yaer; y++) {
          const month = y === yaer && y === currYaer  ? dayjs().format("MM") : 12
          for (let i = 1; i <= parseInt(month); i++) {
            const str = i >= 10 ? `${y}/${i}` : `${y}/0${i}`;
            const url = `https://www.ruanyifeng.com/blog/${str}/`;
            await this._handleHttpGetHtml(url);
          }
        }
    }, 5000)
  }

  /* 获取所有已经分解数据的博客列表 Api */
  getAllBlogNameList() {
    return new Promise(async (resolve, rejt) => {
      try {
        const res = await this?.BLOG_NAME.find({ isDone: true }).sort({
          date: -1,
        });
        resolve(res);
      } catch (error) {
        console.log(error);
        rejt([]);
      }
    });
  }

  /* 根据日期 数据更新 */
  async updateRowByDate(date = "", updateData = { isDone: true }) {
    await this?.BLOG_NAME.updateOne({ date }, updateData);
    console.log(`-------------- ${date} isDone 更新成功------------`);
  }

  /* 查找符合条件的数据，返回数据 */
  findBlogByParam(params = {}) {
    return this?.BLOG_NAME.find(params);
  }



  /* 利用爬虫去更新最新的数据 */
  async upDateLatestData() {
    return new Promise(async (resolve, rejt) => {
      const date = await this.getLastDateByRow();
      const arr = date?.split(".");
      const dataYaer = arr[0];
      const dataMonth = arr[1];
      const yaer = dayjs().format("YYYY");
      const month = dayjs().format("MM");
      /* 同一年份 */
      if (dataYaer === yaer) {
        const start = parseInt(dataMonth);
        const end = parseInt(month);
        for (let i = start; i <= end; i++) {
          const str = i >= 10 ? `${yaer}/${i}` : `${yaer}/0${i}`;
          const url = `https://www.ruanyifeng.com/blog/${str}/`;
          await this._handleHttpGetHtml(url);
        }
      } else {
        /* 跨年份 */
        const start = parseInt(dataMonth);
        for (let i = start; i <= 12; i++) {
          const str = i >= 10 ? `${dataYaer}/${i}` : `${dataYaer}/0${i}`;
          const url = `https://www.ruanyifeng.com/blog/${str}/`;
          await this._handleHttpGetHtml(url);
        }
        const end = parseInt(month);
        for (let i = 1; i <= end; i++) {
          const str = i >= 10 ? `${yaer}/${i}` : `${yaer}/0${i}`;
          const url = `https://www.ruanyifeng.com/blog/${str}/`;
          await this._handleHttpGetHtml(url);
        }
      }
      resolve(true)
    })
  }
}

const blogNameHelper = new BlogNameSchema();

export default blogNameHelper
