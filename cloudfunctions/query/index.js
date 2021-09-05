// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'zsm-2gju7eev53738d21'
})

// 云函数入口函数
exports.main = async (event, context) => {
  // return {
  //   event,
  //   context
  // }
  let db = cloud.database().collection("carlorie");
  if(event.orderType == 1){
    db = db.orderBy("heat","asc");
  }else if(event.orderType == 2){
    db = db.orderBy("carbohydrate","asc");
  }else if(event.orderType == 3){
    db = db.orderBy("protein","asc");
  }else if(event.orderType == 4){
    db = db.orderBy("fat","asc");
  }
  return db.where({
    cate_id: event.id
  }).get()
}