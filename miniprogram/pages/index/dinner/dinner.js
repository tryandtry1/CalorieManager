// pages/index/dinner/dinner.js
Page({

  data: {
    dinnerRecord:[],
  },

  //页面加载获取晚餐数据
  onLoad: function (options) {
    var dinnerRecord = JSON.parse(options.dinnerRecord)
    this.setData({
      dinnerRecord:dinnerRecord,
    })
    console.log("晚餐数据：",this.data.dinnerRecord)

  },

  
})