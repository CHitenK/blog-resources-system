// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      title: '博客资源检索系统',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'keywords', content: '阮一峰, 阮一峰老师的网络日志, 科技爱好者周刊, 博客汇总， 搜索' },
        { name: 'description', content: '这是一个汇总阮一峰老师的网络日志，科技爱好者周刊提到的资源的搜索系统 ' }
      ]
    }
  },
  ssr: false,
  /* 是否自动引入 */
  imports: {
    autoImport: true
  },
  /*  引入 element-plus 参考 https://nuxt.com/modules/element-plus */
  modules: [
    '@element-plus/nuxt',
    '@vant/nuxt'
  ],
  plugins: [
    '~/plugins/flexible',
    '~/plugins/setbodyclass'
  ],
  postcss: {
    plugins: {
      'postcss-pxtorem': {
        rootValue({ file = '' }) {
          return file.indexOf('vant') !== -1 ? 37.5 : 75;
        },
        propList: ['*'],
        mediaQuery: false,
        exclude: (file = '') => {
          // 只对 移动端的 /mobile/、vantUi 文件夹中的文件进行 px 转 rem，其他文件不转换
          const needRemArr = ['/mobile/', 'vant']
          const bl = needRemArr.find(item => file?.includes(item))
          if (bl) return false
          return true;
        }
      },
    }
  },
  devServer: {
    port: 2024,
    host: '0.0.0.0'
  },
  compatibilityDate: '2024-11-26'
})
