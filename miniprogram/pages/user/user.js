//index.js
const app = getApp()
const db = wx.cloud.database()
const usersCollection = db.collection('users')
const consumeCollection = db.collection('dailyTotalSportCalorie')
const intakeCollection = db.collection('intake')
var util = require('../../utils/util.js')
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: app.globalData.userInfo,
    hasUserInfo: app.globalData.hasUserInfo,
    canIUseGetUserProfile: false,
    canIUseOpenData: false,
    usersList: [], //users数据
    openid: null,
    hasData: false,
    sportDay: 0,
    //intakeList:[],
    //consumeList:[],
    intake_total: 0,
    consume_total: 0,
    intake_consume: '',
  },
  onLoad: function () {
    console.log("users.js.onLoad开始")
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    // this.initInfo()
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      })
    }

  },
  async getUserProfile() {
    console.log("user.js.getUserProfile")
    wx.getUserProfile({
      desc: '展示用户信息',
      success: (res) => {
        console.log('getUserProfile', res.userInfo)
        this.setData({
          avatarUrl: res.userInfo.avatarUrl,
          userInfo: res.userInfo,
          hasUserInfo: true,
        })
        app.globalData.userInfo = res.userInfo
        app.globalData.hasUserInfo = true
        wx.setStorage({
          data: res.userInfo,
          key: 'userInfo',
          success: res => {
            console.log('异步存储成功')
          }
        })
      }
    })
    //用户同意获取信息后就存储用户的openid
    await this.setOpenid()
    await this.setSportDay()
    await this.setCalorie()
  },
  async initInfo() {
    console.log('users.js.initInfo')
    let info = wx.getStorageSync('userInfo')
    if (info) {
      console.log('同步获取到了userInfo', info)
      this.setData({
        userInfo: info,
        hasUserInfo: true //开启用户登录的开关
      })
      app.globalData.userInfo = info
      app.globalData.hasUserInfo = true

      await console.log('initInfo找到hasUserInfo', this.data.hasUserInfo)
      let that = this
       await new Promise(function (resolve, reject) {
        wx.cloud.callFunction({
          name: 'login',
          data: {},
          success: res => {
            resolve(res.result.openid)
            console.log('initInfo-openid', res.result.openid)
            app.globalData.openid = res.result.openid
            that.setData({
              openid: res.result.openid //设置openid
            })
          }
        })
      })
    }

  },
  async setOpenid() {
    console.log('users.js.setOpenid开始')
    let that = this
    // 调用云函数
    await new Promise(function (resolve, reject) {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log('云函数获取penid: ', res.result.openid)
          app.globalData.openid = res.result.openid
          console.log('global',app.globalData.openid)
          resolve(res.result.openid) 
          that.setData({
            openid: res.result.openid
          })
        }
      })
    })
    //存储openid
    await wx.setStorageSync('openid', this.data.openid)
    /* usersCollection.get().then(res=>{
       console.log('setOpen后再次读取数据库数据',res.data)
       this.setData({
         userInfo:res.data
       }) 
     })*/
    var usersList = this.data.usersList
    var userInfo = this.data.userInfo
    console.log('setOpenid中获取用户信息') 
    console.log(usersList)
     if (usersList.length!=0) {
      for (var j in usersList) {
        //用户未曾登陆过
        if (usersList[j]._openid != this.data.openid) {
          usersCollection.add({
            data: {
              hasBodyData: false
            } 
          })
        }
      }
    } else { //用户表为空
      usersCollection.add({
        data: {
          hasBodyData: false
        }
      })
    }
  },
  navigateToBodyData() {
    console.log('user.js.navigateToBodyData')
    if (this.data.hasUserInfo) { //用户已登录
      var users = this.data.usersList
      if (users.length == 0) {
        console.log('用户已登录但数据库中users为空')
        wx.navigateTo({
          url: './bodyData/bodyData',
        })
      }
      console.log('users', users)
      console.log('openid', this.data.openid)
      for (var j in users) {
        if (users[j]._openid == this.data.openid) {
          var id = users[j]._id
          console.log('用户已登录跳转到身体数据页面')
          wx.navigateTo({
            url: './bodyData/bodyData?id=' + id
          })
        }
      }
    } else {
      console.log('用户还未登录就跳转到身体数据页面')
      wx.navigateTo({
        url: './bodyData/bodyData',
      })
    }
  },
  navigateToCalorieData() {
    wx.navigateTo({
      url: './calorieData/calorieData?openid=' + this.data.openid,
    })
    console.log('携带openid跳转', this.data.openid)
  },
  async initData() {
    let that = this
    await new Promise(function (resolve, reject) {
      usersCollection.get().then(res => {
        resolve(res.data)
      })
    }).then(res => {
      console.log('promise', res)
      that.setData({
        usersList: res
      })
      console.log("成功读取用户数据", that.data.usersList)
    })
    await this.initInfo()
    await this.setSportDay()
    await this.setCalorie()
  },
  setSportDay() {
    console.log('sportday开始')
    let that = this
    return new Promise(function (resolve, reject) {
      consumeCollection.where({
        _openid: that.data.openid
      }).count().then(res => {
        resolve(res.total)
        console.log('sportDay', res.total)
        that.setData({
          sportDay: res.total,
        })
      })
    })
  },
  async setCalorie() {
    console.log('setCalorie开始')
    var today = util.formatTime(new Date());
    console.log('today', today)
    let that = this
    await new Promise(function (resolve, reject) {
      intakeCollection.where({
        intake_date: today,
        _openid: that.data.openid
      }).get().then(res => {
        resolve(res.data)
        var intakeList = res.data
        console.log('var_intakelist', intakeList)
        if (intakeList.length != 0) {
          that.setData({
            intake_total: (parseFloat(intakeList[0].intake_total).toFixed(2))
          })
        } else {
          that.setData({
            intake_total: 0.00
          })
        }
        console.log('this.data.intake_total', that.data.intake_total)
      })
    })
    await new Promise(function (resolve, reject) {
      consumeCollection.where({
        sportDate: today,
        _openid: that.data.openid
      }).get().then(res => {
        resolve(res.data)
        var consumeList = res.data
        console.log('var_consumelist', consumeList)
        if (consumeList.length != 0) {
          that.setData({
            consume_total: (parseFloat(consumeList[0].totalCalorie).toFixed(2))
          })
        } else {
          that.setData({
            consume_total: 0.00
          })
        }
        console.log('this.data.consume_total', that.data.consume_total)
      })
    })
    await this.setData({
      intake_consume: (this.data.intake_total - this.data.consume_total).toFixed(2),
    })
    await console.log('this.data.intake_consume', this.data.intake_consume)
  },
  /*isLogin(){
    console.log("isLogin开始")
    usersCollection.get().then(res=>{
        let usersList = res.data
        console.log("islogin找用户信息")
        console.log(res.data)
        if(usersList.length>0){
          for(var j in usersList){
            if(usersList[j].openid == app.globalData.openid){
              //用户已登录
              wx.getStorage({
                key: 'userInfo',  
                success:res=>{
                  console.log('isLogin判断是否登录'+res)
                  this.setData({
                    userInfo:res.userInfo,
                    hasUserInfo:true
                  }) 
                },
                fail:console.error
              })
            }else{
              wx.getStorage({
                key: 'userInfo',
                success:res=>{
                  console.log('get异步数据')
                  console.log(res)
                  this.setData({
                    userInfo:res.userInfo,
                    hasUserInfo:true
                  })
                }
              })
            }
          }
        }
    })
  },*/
  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
      })
    }
  },
  /*onGetSetting(){
    console.log("onGetSetting")
    wx.getSetting({
      success:res=>{ 
        if(res.authSetting['scope.userInfo']){
          wx.getStorage({
            key: 'userInfo',
            success:res=>{
              console.log(res.data)
              this.setData({  
                userInfo:res.data,
                hasUserInfo:true
              }) 
            },
            fail:console.error
          })
        }
      },
      fail:console.error
    })
  },*/
  onShow: function () {
    console.log('onshow开始')
    this.initData()


  },
})