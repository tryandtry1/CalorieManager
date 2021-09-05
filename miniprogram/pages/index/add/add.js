// pages/index/add/add.js
Page({

  data: {
    addRecord:[],
  },

  //页面加载获取早餐数据
  onLoad: function (options) {
    var addRecord = JSON.parse(options.addRecord)
    this.setData({
      addRecord:addRecord,
    })
    console.log("加餐数据：",this.data.addRecord)
  },

  
})