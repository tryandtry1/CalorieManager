// pages/index/index.js
const db = wx.cloud.database()
const app = getApp()
const carlorieCollection = db.collection('carlorie')
const intakeCollection = db.collection('intake')
Page({
  data: {
    inputState: false,
    breakfastRecord: [],
    lunchRecord: [],
    dinnerRecord: [],
    addRecord: [],
    breakfastHeat: 0,
    breakfastTotal: 0,
    lunchTotal: 0,
    dinnerTotal: 0,
    addTotal: 0,
    total: 0,
    intake_total: 0,
    id: "",
    res_data: []
  },

  //输入框聚焦时触发，跳转至搜索页面
  onSearch: function () {
    wx.navigateTo({
      url: '../index/search/search'
    })
  },

  /*
  得把获取当天各餐的记录放在这里执行，如果放在 getBreakfast函数以及其他函数的话，总是会先执行跳转页面操作，那么data里面数据就还没有更新，传过去的话也还是data里面原来的值
  */
  onShow: function () {
    console.log('onshow开始')
    this.infoData()
  },
  async infoData() {
     console.log('infoData开始')
    await this.getIntakeData()
    await this.setIntakeData()
  },
  async getIntakeData() {
    //从intake数据库中查询当天的总摄入量
    var date = new Date()
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    if (month < 10) {
      month = "0" + month
    }
    var currentDate = year + "-" + month + "-" + day
    let that = this
    await new Promise(function (resolve, reject) {
      intakeCollection.where({
        _openid: app.globalData.openid,
        intake_date: currentDate
      }).get({
        success: res => {
          resolve(res.data)
          console.log("成功获取该类目下的商品信息", res.data)
          that.setData({
            intake_total: res.data[0].intake_total,
            id: res.data[0]._id,
            res_data: res.data
          })
        }
      })
    })

    await console.log('that.data.res_data', this.data.res_data)
    //早餐
    await new Promise(function (resolve, reject) {
      wx.cloud.callFunction({
        name: "eat_carlorie0",
        data: {
          match: {
            eatDate: currentDate,
            meals_id: 0,
            _openid: app.globalData.openid
          }
        }
      }).then((res) => {
        resolve(res.result.list)
        console.log("早餐=======>", res.result.list)
        that.setData({
          breakfastRecord: res.result.list,
        })
      })
    })
    //午餐
    await new Promise(function (resolve, reject) {
      
      wx.cloud.callFunction({
        name: "eat_carlorie1",
        data: {
          match: {
            eatDate: currentDate,
            meals_id: 1,
            _openid: app.globalData.openid
          }
        }
      }).then((res) => {
        resolve(res.result.list)
        console.log("午餐=======>", res.result.list)
        that.setData({
          lunchRecord: res.result.list,
        })
        console.log("午餐===fff====>", that.data.lunchRecord)
      })

    })

    //晚餐
    await new Promise(function(resolve,reject){
      wx.cloud.callFunction({
        name: "eat_carlorie2",
        data: {
          match: {
            eatDate: currentDate,
            meals_id: 2,
            _openid: app.globalData.openid
          }
        }
      }).then((res) => {
        resolve(res.result.list)
        console.log("晚餐=======>", res.result.list)
        that.setData({
          dinnerRecord: res.result.list,
        })
      })
    })


    //加餐
    wx.cloud.callFunction({
      name: "eat_carlorie3",
      data: {
        match: {
          eatDate: currentDate,
          meals_id: 3,
          _openid: app.globalData.openid
        }
      }
    }).then((res) => {
      console.log("加餐=======>", res.result.list)
      this.setData({
        addRecord: res.result.list,
      })
    })
    
  },


  setIntakeData: function () {
    var date = new Date()
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    if (month < 10) {
      month = "0" + month
    }
    var currentDate = year + "-" + month + "-" + day
    /*计算早餐热量，不延迟的话，总会先执行，导致数据为0，必须let that = this，不然存在指向问题*/
    let that = this
    //各餐的摄入量
    var breakfastTotal = 0
    var lunchTotal = 0
    var dinnerTotal = 0
    var addTotal = 0
    var items1 = that.data.breakfastRecord
    var items2 = that.data.lunchRecord
    var items3 = that.data.dinnerRecord
    var items4 = that.data.addRecord
    for (var i in items1) {
      breakfastTotal = items1[i].number * items1[i].breakfastRecord[0].heat / 100 + breakfastTotal
    }
    for (var i in items2) {
      lunchTotal = items2[i].number * items2[i].lunchRecord[0].heat / 100 + lunchTotal
    }
    for (var i in items3) {
      dinnerTotal = items3[i].number * items3[i].dinnerRecord[0].heat / 100 + dinnerTotal
    }
    for (var i in items4) {
      addTotal = items4[i].number * items4[i].addRecord[0].heat / 100 + addTotal
    }
    that.setData({
      breakfastTotal: breakfastTotal.toFixed(2),
      lunchTotal: lunchTotal.toFixed(2),
      dinnerTotal: dinnerTotal.toFixed(2),
      addTotal: addTotal.toFixed(2),
      total: (breakfastTotal + lunchTotal + dinnerTotal + addTotal).toFixed(2)
    })
    console.log('openid',app.globalData.openid)
    if (that.data.res_data.length == 0 && app.globalData.openid !=null)     
     //代表用户既未登录又未存摄入量进数据库
     {
      intakeCollection.add({
        data: {
          intake_total: 0.00,
          intake_date: currentDate
        }
      }).then({
        success: res => {
          console.log('执行intake的add方法', res)
        },
        fail: error => console.error
      })
    }

    //更新数据库intake
    if(that.data.intake_total!=that.data.total) {
      db.collection('intake').doc(that.data.id).update({
        data: {
          intake_total: that.data.total
        },
        success: console.log,
        fail: console.error
      })
    }
  },
  //跳转到早餐记录页面并传递数据
  getBreakfast: function (e) {
    if (this.data.breakfastRecord == "") {
      console.log("还没记录")
      wx.showToast({
        title: '无记录',
        icon:'none'
      })
    } else {
      var breakfastRecord = JSON.stringify(this.data.breakfastRecord)
      wx.navigateTo({
        url: '../index/breakfast/breakfast?breakfastRecord=' + breakfastRecord + '',
      })
    }
  },

  //跳转到午餐记录页面并传递数据
  getLunch: function (e) {
    if (this.data.lunchRecord == "") {
      console.log("还没记录")
      wx.showToast({
        title: '无记录',
        icon:'none'
      })
    } else {
      var lunchRecord = JSON.stringify(this.data.lunchRecord)
      wx.navigateTo({
        url: '../index/lunch/lunch?lunchRecord=' + lunchRecord + '',
      })
    }
  },

  //跳转到晚餐记录页面并传递数据
  getDinner: function (e) {
    if (this.data.dinnerRecord == "") {
      console.log("还没记录")
      wx.showToast({
        title: '无记录',
        icon:'none'
      })
    } else {
      var dinnerRecord = JSON.stringify(this.data.dinnerRecord)
      wx.navigateTo({
        url: '../index/dinner/dinner?dinnerRecord=' + dinnerRecord + '',
      })
    }
  },

  //跳转到加餐记录页面并传递数据
  getAdd: function (e) {
    if (this.data.addRecord == "") {
      console.log("还没记录")
      wx.showToast({
        title: '无记录',
        icon:'none'
      })
    } else {
      var addRecord = JSON.stringify(this.data.addRecord)
      wx.navigateTo({
        url: '../index/add/add?addRecord=' + addRecord + '',
      })
    }
  },







})