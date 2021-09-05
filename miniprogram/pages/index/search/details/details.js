// pages/index/search/details/details.js
Page({

  data: {
    foodItem: "",
    meals: [
      {id: 0,name: "早餐"},
      {id: 1,name: "午餐"},
      {id: 2,name: "晚餐"},
      {id: 3,name: "加餐"}
    ],
    currentID: -1,
    number: 0,
    eatDate: "",
    state: "none"
  },

  //接收传过来的数据，并赋值给foodItem
  onLoad: function (options) {
    this.setData({
      foodItem: JSON.parse(options.foodItem)
    })
    console.log("传过来的数据为：", this.data.foodItem)
  },

  //点击添加按钮弹出隐藏的内容
  addToEat: function () {
    this.setData({
      state: "block"
    })
  },

  //点击取消按钮
  onExit: function () {
    this.setData({
      state: "none"
    })
  },

  //点击确定按钮
  onSure: function () {
    let that = this
    var n = that.data.number
    var e = that.data.eatDate
    var m = that.data.currentID
    if(n!=0 && e!="" && m!=-1){
      //添加到云数据库eat集合
      const db = wx.cloud.database()
      db.collection('eat').add({
        data: {
          food_id: that.data.foodItem._id,
          number:that.data.number,
          eatDate:that.data.eatDate,
          meals_id:that.data.currentID
        },
        success: res => {
          // 在返回结果中会包含新创建的记录的 _id
          console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
          wx.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 2000,
            success: function () {
              setTimeout(function () {
                that.setData({
                  state: "none"
                })
              },2000)
            }
          })
        },
        fail: err => {
          console.error('[数据库] [新增记录] 失败：', err)
        }
      })
    }
    else{
      wx.showToast({
        title: '请填写数据',
        icon: 'error',
        duration: 2000,
      })
    }
  },


  /**隐藏的内容 */
  //改变被点击的背景颜色以及获取食用餐的类型的id
  changeBackgroundcolor: function (e) {
    var id = e.currentTarget.dataset.index
    this.setData({
      currentID: id
    })
  },

  //获取食用的克数
  getNumber: function (event) {
    var num = event.detail.value;
    this.setData({
      number: num
    })
    console.log("食用克数为:", this.data.number)
  },

  //获取时间
  getDate: function (e) {
    var eatDate = e.detail.value;
    this.setData({
      eatDate: eatDate
    })
  },


})