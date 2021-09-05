// pages/index/breakfast/breakfast.js

Page({
  data: {
    breakfastRecord:[],
    total:0
  },

  //页面加载获取早餐数据
  onLoad: function (options) {
    var breakfastRecord = JSON.parse(options.breakfastRecord)
    this.setData({
      breakfastRecord:breakfastRecord,
    })
    console.log("早餐数据：",this.data.breakfastRecord)
  },





  
})