// pages/user/bodyData/bodyData.js
const app = getApp()
const db = wx.cloud.database()
const usersCollection = db.collection('users')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    users:null,    //users数据
    name:'',
    sex:'',
    height:'',
    weight:'',
    t_weight:'',
    hasBodyData:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('data.js.onLoad')
    //在全局变量中查找用户信息
    var id = options.id     //通过个人中心页传过来的id值查询数据库是否有身材数据的记录
    if(id){
    usersCollection.doc(id).get().then(res=>{
      if(res.data.hasBodyData){     //如果数据库中显示用户已添加身体数据，则将数据库中的数据保存到data中
      this.setData({
        name:res.data.name, 
        sex:res.data.sex, 
        height:res.data.height, 
        weight:res.data.weight,  
        t_weight:res.data.t_weight,
        hasBodyData:res.data.hasBodyData
      })
    }
    })
    this.setData({
      openid:app.globalData.openid
    })
  }
    this.setData({
      userInfo:app.globalData.userInfo,
      openid:app.globalData.openid
    })
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
    console.log('data.js.onshow')
    //保存users数据
    usersCollection.get().then(res=>{
      console.log('onshow',res.data)
      this.setData({
        hasBodyData:res.data.hasBodyData,
        users:res.data
      }) 
    })
  },
  submit:function(e){
    console.log('data.js.submit')
    if(app.globalData.userInfo==null){
      this.getUserProfile()
    }
    var sex = e.detail.value.gender
    var height = e.detail.value.height 
    var weight = e.detail.value.weight
    var t_weight = e.detail.value.target_weight
    console.log(sex+','+height+','+weight+','+t_weight)
    var users = this.data.users 
    if(sex==""||height==""||weight==""||t_weight==""){
      wx.showToast({
        title: '请将信息填写完整',
        icon:'none'
      })
    }else{
    if (users.length > 0) {
      for (var j in users) {
        //用户未曾登陆过
        if (users[j]._openid != this.data.openid) {
          usersCollection.add({
            data: {
              sex:sex, 
              height:height,
              weight:weight,
              t_weight:t_weight,
              hasBodyData:true
            },
            success:(res)=>{
              wx.showToast({
                title: '添加成功',
              })
            }
          })
        }else{
          //用户已经登录过
          var id = users[j]._id
          usersCollection.doc(id).update({
            data:{
              sex:sex, 
              height:height,
              weight:weight,
              t_weight:t_weight,
              hasBodyData:true
            },
            success:(res)=>{
              wx.showToast({
                title: '添加成功',
              })
            }
          })
          
        }
      }
    } else { //用户表为空
      usersCollection.add({
        data: {
          sex:sex, 
          height:height,
          weight:weight,
          t_weight:t_weight,
          hasBodyData:true
        },
        success:(res)=>{
          wx.showToast({ 
            title: '添加成功',
          })
        }
      }) 
    }
    this.setData({
      sex:sex, 
      height:height,
      weight:weight,
      t_weight:t_weight,
      hasBodyData:true
    })
  }
  },
  getUserProfile() {
    console.log("data.js.getUserProfile")
    wx.getUserProfile({
      desc: '展示用户信息',
      success: (res) => {
        console.log('getUserProfile',res.userInfo)
        this.setData({ 
          userInfo: res.userInfo
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
  },
  /*setUsersData() { 
    console.log('data.js.setUsersData开始') 
        if (usersList.length > 0) {
          for (var j in usersList) {
            //用户未曾登陆过
            if (usersList[j].openid != this.data.openid) {
              usersCollection.add({
                data: {
                  openid: this.data.openid,
                  hasBodyData:false
                }
              })
            }
          }
        } else { //用户表为空
          usersCollection.add({
            data: {
              openid: res.data.openid,
              hasBodyData:false
            }
          }) 
        }
  },*/
  submit_change:function(e){
    var sex = e.detail.value.gender
    var height = e.detail.value.height
    var weight = e.detail.value.weight
    var t_weight = e.detail.value.target_weight
    console.log(sex+','+height+','+weight+','+t_weight)
    var users = this.data.users
    for(var j in users){
      if(users[j]._openid==this.data.openid){
        var id = users[j]._id
        console.log('_id',id)
        usersCollection.doc(id).update({
          data:{
            sex:sex,
            height:height,
            weight:weight,
            t_weight:t_weight,
            hasBodyData:true
          },
          success:(res)=>{
            wx.showToast({
              title: '修改成功',
            })
          }
        })
        this.setData({
          sex:sex,
          height:height,
          weight:weight,
          t_weight:t_weight,
          hasBodyData:true
        })
      }
    }
  },

  /*findUserBodyData:function(){
    console.log('finduserbodydata')
    usersCollection.get().then(res=>{
      console.log(res.data)
      this.setData({
        users:res.data
      })
    })
    console.log(this.data.users)
    var users = this.data.users
    var openid = this.data.openid
    console.log(users)
    console.log(openid)
    for(var j in users){
      if(users[j].openid ==openid){
        this.setData({
          name:users[j].name,
          sex:users[j].sex,
          height:users[j].height,
          weight:users[j].weight,
          t_weight:users[j].t_weight
        })
      }else{
        console.log('no')
      }
    }
  },*/

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