
import mongoose from 'mongoose'

import { dbUrl } from '~/db.config'

class DBConnecter {
  /* 数据库 */
  db = null
  /*  是否开始连接   */
  isStart = false

  /*  Mongo数据库连接地址   */
  dbUrl = dbUrl
  constructor() {
    this.startConnect()
  }

  startConnect() {
    if (!this.dbUrl) return false
    /* 防止多次连接 */
    if (!this.db && !this.isStart) {
      console.log('-------------------------------开始连接数据库-------------------------')
      this.isStart = true
      this.connectDB()
    }
  }

  connectDB() {
    mongoose.connect(this.dbUrl, {
      maxPoolSize: 10,           // 连接池最大连接数
      minPoolSize: 2,           // 连接池最小保持的连接数
      connectTimeoutMS: 10000,   // 连接超时时间(毫秒)
      socketTimeoutMS: 45000,    // 套接字超时时间(毫秒)
      serverSelectionTimeoutMS: 5000, // 服务器选择超时
      waitQueueTimeoutMS: 10000  // 等待连接超时
  })

    mongoose.connection.on('connected', () => {
      console.log('------------连接数据库成功---------');
      this.db = mongoose
    });
    /**
    * 连接异常 error 数据库连接错误
    */
    mongoose.connection.on('error',(err) => {
      console.log('连接数据库出错: '+ err);
      this.db = null
    });
    /**
    * 连接断开 disconnected 连接异常断开
    */
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose connection disconnected');
      this.db = null
    });

  }
}

const mongooseEr = new DBConnecter()

export default mongooseEr
