const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

    //页面左上角日期显示的日期
    nowDate: '',

    isShow: false,
    tip: true,

    //查询的sportRecord表的记录
    sportRecord: [],

    //显示的今天一共运动的卡路里数
    totalCalorie: 0

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if ((typeof options.date) === 'undefined') {
      //获取并设置今天的日期
      this.setNowDay();
      console.log("没有获取到别的日期")
    } else {
      console.log("从添加页获取到的日期为：", options.date)
      this.setData({
        nowDate: options.date
      })
    }



    //查询sportRecord表
    this.querySportRecord();

    //查询dailyTotalSportCalorie表
    this.queryDailyTotalSportCalorie();

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

  },










  //获取并设置今天的日期
  setNowDay() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month <= 9) {
      month = "0" + month;
    };
    if (day <= 9) {
      day = "0" + day;
    }
    this.setData({
      nowDate: year + "-" + month + "-" + day
    });
  },


  //查询sportRecord表
  querySportRecord() {
    //查找用户openid，后来添加上去的
    wx.cloud.database().collection("sportRecord")
      .where({
        _openid:app.globalData.openid,         //已被改动
        sport_date: this.data.nowDate
      }).get()
      .then(res => {
        // console.log("运动成功！", res.data);
        if (res.data.length > 0) {
          this.setData({
            sportRecord: res.data,
            isShow: true,
            tip: false
          })
        } else {
          this.setData({
            sportRecord: res.data,
            isShow: false,
            tip: true
          })
        }
      }).catch(res => {
        console.log("获取失败！", res)
      })
  },

  //查询dailyTotalSportCalorie表
  queryDailyTotalSportCalorie() {
    console.log('app.openid',app.globalData.openid)
    wx.cloud.database().collection("dailyTotalSportCalorie")
      .where({
        _openid:app.globalData.openid,
        sportDate: this.data.nowDate
      }).get().then(res => {
        // console.log("获取每日运动消耗的总卡路里成功！", res.data[0].totalCalorie)
        this.setData({
          totalCalorie: res.data[0].totalCalorie
        })
      }).catch(res => {
        console.log("获取不到每日运动消耗的总卡路里！当天可能还没有添加运记录！", res)
      })
      console.log('totalCalorie',this.data.totalCalorie)
  },


  //修改日历下拉列表的时间，并重新获取数据库表
  bindCalendarChange(e) {
    console.log("获取到日历的日期：", e.detail.value);
    this.setData({
      nowDate: e.detail.value
    });

    this.querySportRecord();
    this.queryDailyTotalSportCalorie();

  },


  //删除记录
  deleteRecord(e) {
    console.log("获取到要删除的记录id为：", e.currentTarget.dataset.id);
    console.log("获取到要删除的记录热量为：", e.currentTarget.dataset.heat);
    var id = e.currentTarget.dataset.id;
    var heat = e.currentTarget.dataset.heat;
    wx.showModal({
      title: "是否确认删除",
      // content: "请再仔细考虑一下",
      success: res => {
        // console.log("res.cancel",res.cancel);
        // console.log("res.confirm",res.confirm);
        if (res.confirm == true) {
          //首先是删除sportRecord的记录
          wx.cloud.database().collection("sportRecord")
            .doc(id).remove()
            .then(res => {
              console.log("删除成功！", res);
              wx.reLaunch({
                url: "/pages/sport/sport?date=" + this.data.nowDate
              })
            }).catch(res => {
              console.log("删除失败！", res)
            })

          //接下来是修改dailyTotalSportCalorie表当天的总卡路里数
          var db = wx.cloud.database();
          const _ = db.command;
          db.collection("dailyTotalSportCalorie")
            .where({
              _openid:app.globalData.openid,
              sportDate: this.data.nowDate
            }).update({
              data: {
                totalCalorie: _.inc(-heat)
              }
            }).then(res => {
              console.log("当天总卡路里减少成功！", res);
              // if(this.data.totalCalorie <= 0){
              //   db.collection("dailyTotalSportCalorie")
              //   .where({
              //     sportDate: this.data.nowDate
              //   }).remove().then( res => {
              //     console.log("当天总卡路里为0！已删除成功！")
              //   }).catch( res => {;
              //     console.log("当天总卡路里为0！删除失败！")
              //   })
              // }
            }).catch(res => {
              console.log("当天总卡路里减少失败！", res)
            })
        } else if (res.cancel == true) {
          console.log("用户点击了取消", id)
        }
      }
    })

  },

  //点击 "+" 按钮跳转到sportAdd页面
  goAdd() {
    wx.navigateTo({
      url: "/pages/sport/sportAdd/sportAdd"
    });
  }



})