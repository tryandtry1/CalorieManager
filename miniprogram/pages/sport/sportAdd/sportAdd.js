var sportId = 0;
var hour = 0;
var minute = 0;
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

    //获取到的下拉列表可选的运动项目名称
    sportItem: [],

    //运动项目列表数组的index
    sportIndex: 0,

    //日期下拉列表显示的日期
    nowDate: '',

    //很难解释得清。。。
    switchOn: false,

    //选择运动项目和运动时长后计算的卡路里
    nowCalorie: 0,

    //运动时间下拉列表的 小时 和 分钟 的数据选项
    timeRange: [
      //小时
      [
        "00", "01", "02", "03", "04", "05", "06", "07", "08", "09",
        "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
        "20", "21", "22", "23"
      ],
      //分钟
      [
        "00", "01", "02", "03", "04", "05", "06", "07", "08", "09",
        "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
        "20", "21", "22", "23", "24", "25", "26", "27", "28", "29",
        "30", "31", "32", "33", "34", "35", "36", "37", "38", "39",
        "40", "41", "42", "43", "44", "45", "46", "47", "48", "49",
        "50", "51", "52", "53", "54", "55", "56", "57", "58", "59",
      ]
    ],

    //用于表示运动时间下拉列表的index数组，第一个元素存储小时，第二个元素存储分钟
    timeIndex: [0, 0],

    //一天运动的总时间
    totalMinute: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //获取并设置今天的日期
    this.setNowDay();

    //获取sportCalorie表并设置运动下拉列表的运动名称
    this.querySportCalorie();

    //默认值
    sportId = 1;



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


  //获取sportCalorie表并设置运动下拉列表的运动名称
  querySportCalorie() {
    wx.cloud.database().collection("sportCalorie").get()
      .then(res => {
        console.log("获取运动项目表成功！", res.data);
        var temp = [];
        for (var i = 1; i <= res.data.length; i++) {
          temp[i - 1] = res.data[i - 1].sport_name;
        }
        //console.log("temp数组为：",temp)
        this.setData({
          sportItem: temp
        })
      }).catch(res => {
        console.log("获取运动项目表失败！", res)
      });
  },


  //修改运动项目下拉列表的选项
  bindSportChange(e) {
    console.log("获取到的运动项目index:", e.detail.value);
    sportId = parseInt(e.detail.value) + 1;
    this.setData({
      sportIndex: e.detail.value
    })

    //如果用户添加大于0的运动时长，当再次修改运动项目后依旧可以计算总卡路里
    if (this.data.switchOn) {
      this.calculateCalorie();
    }

  },

  //修改运动日期下拉列表的选项
  bindDateChange(e) {
    console.log("获取到的日期为:", e.detail.value);
    this.setData({
      nowDate: e.detail.value
    });

  },

  //修改运动时间下拉列表的选项
  bindTimeChange(e) {
    console.log('获取到的运动时间数组为：', e.detail.value);
    hour = e.detail.value[0];
    minute = e.detail.value[1];
    // console.log("您跑了" + hour + "小时");
    // console.log("您跑了" + minute + "分钟");
    this.setData({
      timeIndex: e.detail.value
    });

    //确保点了时间列表后时间大于0，开启按钮
    if (hour > 0 || minute > 0) {
      this.setData({
        switchOn: true
      })
    } else if (hour == 0 && minute == 0) {
      this.setData({
        switchOn: false
      })
    }

    //由于运动项目和日期的下拉列表有默认值，当用户设置了运动时间后就可以计算卡路里了
    this.calculateCalorie();
  },


  //选择好运动项目和时间就可以计算消耗的卡路里了
  calculateCalorie() {
    wx.cloud.database().collection("sportCalorie")
      .where({
        cate_id: sportId
      }).get().then(res => {
        console.log("通过id获取到的运动项目的热量是：", res.data[0].heat);
        var heat = res.data[0].heat;
        var total = (hour * 60 + minute) * heat;
        this.setData({
          nowCalorie: total
        })
      }).catch(res => {
        console.log("获取失败！")
      })
  },


  //添加按钮的函数，用于向两个数据库添分别添加每项运动的记录和累计每天运动的卡路里
  addSportRecord(e) {
    //先判断用户是否用下拉列表修改了运动时长，时间大于0才能添加
    if (hour == 0 && minute == 0) {
      wx.showToast({
        icon: 'none',
        title: '亲，您的运动时长为 0 哦'
      })
    } else if (hour > 0 || minute > 0) {
      //确保时间大于0后，还要确保当天添加的运动记录时间低于24小时
      //先获取当天运动的总时间
      this.calculateSportTimeOneDay();
      setTimeout(() => {
        var flag = this.data.totalMinute > (24 * 60);
        console.log("flag的值为：", flag);
        //如果今天累计运动时间大于24小时，提醒
        if (flag) {
          wx.showToast({
            icon: "none",
            duration: 2000,
            title: "亲，您过的一天是地球时间吗？超过24小时了哦！"
          })
        //小于24小时，可以正常添加记录
        }else {
          //插入到每日运动记录表
          wx.cloud.database().collection("sportRecord").add({
            data: {
              "cate_id": sportId,
              "sport_name": this.data.sportItem[sportId - 1],
              "sport_date": this.data.nowDate,
              "sport_time": [hour, minute],
              "heat": this.data.nowCalorie
            }
          }).then(res => {
            wx.showToast({
              icon: "success",
              title: "添加成功！"
            });
            setTimeout( res => {
              wx.reLaunch({
                url: "/pages/sport/sport?date="+this.data.nowDate
              });
            }, 1000)
          }).catch(res => {
            wx.showToast({
              icon: 'error',
              title: '添加失败！未知错误！'
            })
          })

          //接下来是写入每日运动卡路里总消耗表
          wx.cloud.database().collection("dailyTotalSportCalorie")
            .where({
              _openid:app.globalData.openid,    //有改动
              sportDate: this.data.nowDate
            }).count()
            .then(res => {
              console.log("获取dailyTotalSportCalorie数据库记录数目成功！", res.total);
              //如果今天已经有添加过运动记录，现在添加新的记录则 更新 累加运动时间
              if (res.total == 1) {
                var db = wx.cloud.database();
                const _ = db.command;
                db.collection("dailyTotalSportCalorie")
                  .where({
                    sportDate: this.data.nowDate
                  }).update({
                    data: {
                      totalCalorie: _.inc(this.data.nowCalorie)
                    }
                  }).then(res => {
                    console.log("更新成功！", res)
                  }).catch(res => {
                    console.log("更新失败！", res)
                  })
               //如果今天是第一次添加记录，则 插入 运动时间
              } else if (res.total == 0) {
                wx.cloud.database().collection("dailyTotalSportCalorie")
                  .add({
                    data: {
                      "sportDate": this.data.nowDate,
                      "totalCalorie": this.data.nowCalorie
                    }
                  }).then(res => {
                    console.log("添加成功！", res);
                  }).catch(res => {
                    console.log("添加失败！", res)
                  })
              } else {
                console.log("数据库写入失败！未知错误!")
              }
            }).catch(res => {
              console.log("获取dailyTotalSportCalorie数据库记录数目失败！")
            })
        }
      }, 1500)
    } else {
      wx.showToast({
        icon: 'error',
        title: '添加失败！未知错误！'
      })

    }





  },

  //计算一天的总运动时间
  calculateSportTimeOneDay() {
    wx.cloud.database().collection("sportRecord")
      .where({
        _openid:app.globalData.openid,
        sport_date: this.data.nowDate
      })
      .field({
        sport_time: true
      }).get().then(res => {
        console.log(res.data);
        var timeArr = res.data;
        var totalMinute = 0;
        for (var i = 1; i <= timeArr.length; i++) {
          totalMinute += parseInt(timeArr[i - 1].sport_time[0]) * 60 + parseInt(timeArr[i - 1].sport_time[1]);
        }
        console.log(totalMinute);
        this.setData({
          totalMinute: totalMinute
        })
      })
  }


})