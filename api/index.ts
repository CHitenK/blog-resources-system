import service from "~/utils/request";

/* 获取数据 */
export const getList = (params = {}) => {
  return service({
    url: '/api/blog/resource',
    method: "get",
    params
  })
}

/* 获取数据 */
export const getBlockNameList = (params = {}) => {
  return service({
    url: '/api/blog/list',
    method: "get",
    params
  })
}
