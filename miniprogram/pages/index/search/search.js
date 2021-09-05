// pages/index/search/search.js
const db = wx.cloud.database()
const carlorieCollection = db.collection('carlorie')

Page({

  data: {
    inputState: true,
    searchResult:[]
  },

  //输入时触发的搜索事件
  onSearch: function (event) {
    var inputWord = event.detail.value
    /*
    得加上这一句或者在app.js文件里加上env:"环境id"，不然会报
    "errMsg: Environment cannot access from wx-miniapp"这个错误
    */
    const db = wx.cloud.database({env: 'zsm-2gju7eev53738d21'})
    db.collection('carlorie').where({
			food_name: new db.RegExp({
        regexp: inputWord,
        options: 'i'
      })
		}).get({
      success: res => {
        this.setData({
          searchResult: res.data
        })
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  //点击跳转至食物详情页
  navigateToFood:function(e){
    var foodItem = JSON.stringify(e.currentTarget.dataset.item)
    wx.redirectTo({
			url: './details/details?foodItem='+foodItem+'' ,
			success: function (res) {
				console.log("传参成功", res)
			},
			fail: function (res) {
				console.log("传参失败", res)
			}
		})
  }
  
})