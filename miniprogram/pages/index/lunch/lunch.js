// pages/index/lunch/lunch.js
Page({

  data: {
    lunchRecord:[],
  },

  //页面加载获取午餐数据
  onLoad: function (options) {
    var lunchRecord = JSON.parse(options.lunchRecord)
    this.setData({
      lunchRecord:lunchRecord,
    })
    console.log("午餐数据：",this.data.lunchRecord)
  },

  
})