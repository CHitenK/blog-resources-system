import { defineNuxtPlugin } from '#app'
import { getDeviceType } from '~/utils/index'

export default defineNuxtPlugin(() => {
  /* 根据终端给body标签设置class */
  if (process.client) {
    const deviceType = getDeviceType()
    const bodyDom = document.body
    const oldClassName = bodyDom.getAttribute('class') ?? ''
    bodyDom.setAttribute('class', `${deviceType.value}-device-warp ${oldClassName}`)
  }
})
