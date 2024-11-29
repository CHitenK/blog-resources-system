# 博客资源检索系统

基于[nuxt3-pc-mobile-template](https://github.com/CHitenK/nuxt3-pc-mobile-template)框架, 技术集成： Nuxt3, Vue3, Element-plus, Vant, MongoDb，cheerio爬虫工具等；

PC/移动端统一集成一套项目代码，站点访问地址(PC/移动端)：[博客资源检索系统](http://120.46.210.201:2024/index)；

站点系统汇总阮一峰老师每周更新的博客日志所提到的资源，然后支持关键字检索，方便查找学习。

*****

## 初始数据步骤

1， 配置mongodb地址，即在/server/dbHelper/mongodb/connect.ts的dbUrl， 设置你的mongodb链接地址，格式如下

  ```bash

  mongodb://<username>:<password>@<host>:<port>/<database>?<options>
  ```
   
  run dev 启动后， 控制显示'数据库连接成功'，即可

2， 爬虫获取博客列表，在/server/dbHelper/modules/blogNameHelper.ts, 去掉constructor函数下this._initBlogList前的注释，保存并执行this._initBlogList() 【只执行一次， 然后注释，防止多次写入】；

3， 步骤2完成后， 并注释/server/dbHelper/modules/blogNameHelper.ts的this._initBlogList保存代码，在/server/dbHelper/modules/blogDataHelper.ts， 去掉constructor函数下this._initData()前的注释，保存并执行this.__initData()【只执行一次， 然后注释，防止多次写入】；

4, 访问http://localhost:2024即有数据

*****
## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:2024`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

# pm2 生产部署

run build 完成， 复制.nuxt，.out， package.json， ecosystem.config.cjs 到服务器指定文件夹上，然后以下执行下面脚本


```bash
npm i -g pm2

npm i

pm2 start ./ecosystem.config.cjs
```
