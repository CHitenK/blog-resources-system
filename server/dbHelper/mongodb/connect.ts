
import mongoose from 'mongoose'

class DBConnecter {
  /* 数据库 */
  db = null

  /* 是否开始连接 */
  isStart = false
  /* Mongo数据库连接地址 */
  dbUrl = ''
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
    mongoose.connect(this.dbUrl)

    mongoose.connection.on('connected',() => {
      console.log('------------连接数据库成功---------' + this.dbUrl);
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
