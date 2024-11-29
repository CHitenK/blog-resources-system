import blogDataHelper from './../../dbHelper/modules/blogDataHelper'

/* 获取博客所有数据 */
export default defineEventHandler(async (event, data) => {
  const query = getQuery(event);
  const options = await blogDataHelper.handleSearchData(query);
  /* 匹配关键字高亮 */
  options?.data?.forEach(utem => {
    utem.htmlContent = query.keyword ? blogDataHelper.handleHighlight(utem.htmlContent, query.keyword) : utem.htmlContent
  })

  return {
    code: 200,
    msg: '执行成功',
    data:options
  }
})
