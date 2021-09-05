// pages/user/calorieData/calorieData.js
const wxCharts = require('../../../utils/wxcharts.js')
var weeklineChart = null
var app = getApp()
const db = wx.cloud.database()
const intakeCollection = db.collection('intake')
const consumeCollection = db.collection('dailyTotalSportCalorie')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    intakeList:[],
    consumeList: [],
    intake_consumeList:[],
    openid:'',
    hasOpenid:false,
    dayList:[],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad开始')
    var openid = options.openid
    console.log('传过来的openid', openid)
    if(openid!='null'){
    this.setData({
      openid: openid,
      hasOpenid:true 
    })
  }
    this.init()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  async init(){
    await console.log('this.data.openid',this.data.openid)
    for(var i=0;i<7;i++){
      await this.setIntake(i)
      await this.setConsume(i)
    }
    await console.log('this.data.intakeList',this.data.intakeList)
    await console.log('this.data.consumeList',this.data.consumeList)
    var i_c =[]
    for(var i=0;i<7;i++){
      i_c[i]= this.data.intakeList[i]-this.data.consumeList[i]
      await this.setData({
        intake_consumeList:i_c
      })
    }
    await console.log('i_c',this.data.intake_consumeList)
    await this.getChart()
  },
   setIntake:function (i) {
    //console.log('setIntake开始')
    //console.log('setIntake:i', i)
    //获取一周内的日期
    var arr = this.getTime()
    let that =this
    //获取本用户的摄入信息     
     return new Promise((resolve,reject)=>{
      intakeCollection.where({
        _openid: that.data.openid,
        intake_date: arr[i]
      }).get({
        success: (res) => {
          if (res.data.length != 0) {
            that.data.intakeList.push((parseInt(res.data[0].intake_total)).toFixed(2))
            that.setData({
              intakeList:that.data.intakeList
            })
           resolve(that.data.intakeList)
          } else {
            that.data.intakeList.push(0.00)
            that.setData({
              intakeList:that.data.intakeList
            })
              resolve(that.data.intakeList)
          }
        },
        fail: error => {
          console.error
        }
      })
     })
  },
  setConsume:function (i) {
   // console.log('setConsume开始')
  //console.log('setConsume:i', i)
    //获取一周内的日期
    var arr = this.getTime()
    let that = this
    //获取本用户的摄入信息     
    if(i<7){
     return new Promise((resolve,reject)=>{
      consumeCollection.where({
        _openid: that.data.openid,
        sportDate: arr[i]
      }).get({
        success: (res) => {
          if (res.data.length != 0) {
            that.data.consumeList.push(res.data[0].totalCalorie.toFixed(2))
            that.setData({
              consumeList:that.data.consumeList
            })
           resolve(that.data.consumeList)
          } else {
            that.data.consumeList.push(0.00)
            that.setData({
              consumeList:that.data.consumeList
            })
              resolve(that.data.consumeList)
          }
        },
        fail: error => {
          console.error
        }
      })
     })
    }
  },
  getTime: function () {
   /* var arr = []; // 周一开始
    var newdate = new Date();
    var now = newdate.getTime();
    var day = newdate.getDay(); // 星期几
    var year = newdate.getFullYear()
    var month = newdate.getMonth() + 1
    if (month < 10) {
      month = '0' + month
    } 
    var oneDayTime = 60 * 60 * 24 * 1000;
    for (var j = 1; j < 8; j++) {
      if (day >= j) {
        var dd = new Date(now - (day - j) * oneDayTime).getDate();
        arr.push(dd < 10 ? '-0' + dd : dd + '');
      } else {        var aa = new Date(now + (j - day) * oneDayTime).getDate();
        arr.push(aa < 10 ? '0' + aa : aa + '');
      }
    }
    for (var j = 0; j < 7; j++) {
      arr[j] = year + '-' + month + '-' + arr[j]
    }
    return arr;*/
    var arr = [];
    var newdate = new Date()
    var now = newdate.getTime();
    var year = newdate.getFullYear()
    var month = newdate.getMonth() + 1
    var oneDayTime = 60*60*24*1000;    // 一天的秒数
    for(var i=6; i>=0; i--){
      var dd = new Date(now - i*oneDayTime).getDate();
      arr.push(dd < 10 ? '0'+dd : dd+'');
    }
    if (month < 10) {
      month = '0' + month
    } 
    var day = []
    for(var j =0;j<7;j++){
      day[j]=month+'-'+arr[j]
    }
    for (var j = 0; j < 7; j++) {
      arr[j] = year + '-' + month + '-' + arr[j]
    }
    this.setData({
      dayList:day
    })
    return arr
  },
  getChart: function (e) {
    console.log('getChart开始')
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    weeklineChart = new wxCharts({
      canvasId: 'mychart',
      type: 'line',
      categories: this.data.dayList, //categories X轴
      animation: true,
      series: [{
        name:'一周卡路里',
        //data: yuesimulationData.data,
        data: this.data.intake_consumeList,
        color:"#34CE57",
        format: function (val,name) {
          return val.toFixed(2);
        }
      }],
      xAxis: {
        fontColor:'#000000',
        gridColor:"#000000",
        disableGrid: false
      },
      yAxis: {
        fontColor:'#000000',
        gridColor:"#000000",
        format: function (val) {
          return val.toFixed(2);
        },
      },
      width: windowWidth,
      height: 200,
      dataLabel: true,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve',
      }
    });
  },
  weekTouchHandler:function(){
    weeklineChart.showToolTip({
      background:'#7cb5ec',
      format:function(item,category){
        return category+'日'+item.data
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})