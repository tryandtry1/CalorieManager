// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'zsm-2gju7eev53738d21'
})
//初始化数据库
const db = cloud.database()
const _ = db.command
const $ = _.aggregate
var date = new Date()
var year = date.getFullYear()
var month = date.getMonth() + 1
var day = date.getDate()
if (month < 10) {
  month = "0" + month
}
var currentDate = year + "-" + month + "-" + day
// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection('eat').aggregate()
    .lookup({
      from: 'carlorie',
      localField: 'food_id',
      foreignField: '_id',
      as: 'dinnerRecord'
    })
    .match(
      event.match
    )
    .end()
}