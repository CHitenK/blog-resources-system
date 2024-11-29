
/*
  pm2 配置文件
  sehll 命令pm2 start ./ecosystem.config.cjs
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
