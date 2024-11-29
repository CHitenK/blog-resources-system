

import axios from 'axios'

import blogNameHelper from './../../dbHelper/modules/blogNameHelper'

/* 获取博客所有数据 */
export default defineEventHandler(async () => {
  const options = await blogNameHelper.getAllBlogNameList();
  return {
    code: 200,
    msg: '执行成功',
    data: options
  }
})
