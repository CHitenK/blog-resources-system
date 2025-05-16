
/*
  pm2 配置文件
  删除pm2进程 shell 命令 pm2 delete blog-resource-sys
  启动pm2 进程 shell 命令 pm2 start ./ecosystem.config.cjs
*/
module.exports = {
  apps: [
    {
      name: 'blog-resource-sys',
      port: '2024',
      exec_mode: 'cluster',
      instances: 1,
      script: './.output/server/index.mjs'
    }
  ]
}
 