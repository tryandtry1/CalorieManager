// pages/category/category.js
//say hi to github
Page({

  /**
   * 页面的初始数据
   */
  data: {
    category_type:
    [
      {
        id:1,
        "image-url": "",
        "title": "主食" 
      },
      {
        id:2,
        "image-url": "",
        "title": "肉类" 
      },
      {
        id:3,
        "image-url": "",
        "title": "蔬菜" 
      },
      {
        id:4,
        "image-url": "",
        "title": "水果" 
      }
    ],

    imgUrl: ["stapleFood.svg","meat.svg","vegetables.svg","fruit.svg"],

  },

//输入框聚焦时触发，跳转至搜索页面
onSearch: function () {
  wx.navigateTo({
    url: '../index/search/search'
  })
},

  goList(e){
    console.log("跳转到列表页啦！",e.currentTarget.dataset.id)
    wx.navigateTo({
      url: "/pages/category/foodList/foodList?id=" + e.currentTarget.dataset.id
    })
  }

})