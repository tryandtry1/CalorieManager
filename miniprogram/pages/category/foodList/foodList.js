// pages/category/categoryList/categoryList.js
var id = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //食物列表数据
    //食物名称
    foodName: [],
    //食物种类名称
    foodDataPrefix: ['热量','热量','碳水化合物','蛋白质','脂肪'],
    //食物种类名称Index
    foodDataPrefixIndex: 0,
    //根据下拉列表获取的排序规则，从而获取的相应的要显示的数据
    foodData: [],
    //以上合起来的渲染出来的效果，如：热量：17kcal/100g、蛋白质：1g/100g




    //下拉列表的排序种类选项
    sortKind: [
      "默认序号排序",
      "按热量排序",
      "按碳水化合物含量排序",
      "按蛋白质含量排序",
      "按脂肪含量排序"
    ],
    //排序种类选项的Index
    sortIndex: 0,

    //排序方式，默认升序
    sortReverse: "升序",
    //改为降序时向下旋转图标
    arrowRotate: 'arrow-img'
    
    //已弃用
    //Selecct组件的数据
    // selectArray: [{
    //   "id": "10",
    //   "text": "会计类"
    // }, {
    //   "id": "21",
    //   "text": "工程类"
    // }]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //分类页传过来的食物种类id
    id = parseInt(options.id);
    console.log("收到id了！", id);
    //根据此id从食物表查询相应种类的食物
    wx.cloud.callFunction({
      name: 'query',
      data: {
        id: id
      }
    }).then(res => {
      console.log("查询成功！", res.result.data);
      //接下来是获取并设置食物名称和热量数据
      var result = res.result.data;
      var temp1 = [];
      var temp2 = [];
      for(var i = 1; i <= result.length; i++){
        temp1[i-1] = result[i-1].food_name;
        temp2[i-1] = result[i-1].heat + 'kcal'
      };
      // setTimeout(() => {
        console.log("获取的foodName的值为：",temp1);
        console.log("获取的foodData的值为：",temp2);
        this.setData({
          foodName: temp1,
          foodData: temp2,
        })
      // },1500)
    }).catch(res => {
      console.log("查询失败！", res)
    })


  },

 

  bindSortChange(e) {
    //排序下拉列表传过来的value值
    var value = e.detail.value;
    console.log("获取到的下拉列表index:", value);
    console.log("下拉列表获取的id：", id)
    this.setData({
      sortIndex: value
    });
    //根据value值获取和分类页传过来的食物种类id从食物表查询并获取排完序的记录
    wx.cloud.callFunction({
      name: 'query',
      data: {
        id: id,
        orderType: value
      }
    }).then(res => {
      console.log("下拉列表查询成功！", res.result);
      //接下来是获取并设置食物名称和排序规则对应的数据
      var result = res.result.data;
      var temp1 = [];
      var temp2 = [];
      for(var i = 1; i <= result.length; i++){
        temp1[i-1] = result[i-1].food_name;
        if(value == 2){
          temp2[i-1] = result[i-1].carbohydrate + 'g';
        }else if(value == 3){
          temp2[i-1] = result[i-1].protein + 'g';
        }else if(value == 4){
          temp2[i-1] = result[i-1].fat + 'g';
        }else {
          temp2[i-1] = result[i-1].heat + 'kcal';
        }
      };
      console.log("获取的foodName的值为：",temp1);
      console.log("获取的foodData的值为：",temp2);
      this.setData({
        foodName: temp1,
        foodData: temp2,
        //记得要修改食物种类
        foodDataPrefixIndex: value,
        //还有将排序方式默认再改为升序
        sortReverse: '升序'
      });
    }).catch(res => {
      console.log("查询失败！", res.result)
    })

  },


  //颠倒排序
  sortReverse(e) {
    var foodName = this.data.foodName;
    var foodData = this.data.foodData;
    var temp1 = null;
    var temp2 = null;
    for (var i = 1; i <= (foodData.length / 2); i++) {
      //颠倒食物名称数组
      temp1 = foodData[i - 1];
      foodData[i - 1] = foodData[foodData.length - i];
      foodData[foodData.length - i] = temp1;
      //颠倒食物数据数组
      temp2 = foodName[i - 1];
      foodName[i - 1] = foodName[foodData.length - i];
      foodName[foodData.length - i] = temp2;
    };
    console.log("foodData的值为：", foodData);
    console.log("foodName的值为：", foodName);
    //切换排序
    if (this.data.sortReverse == "升序") {
      this.setData({
        sortReverse: "降序",
        foodData: foodData,
        foodName: foodName,
        arrowRotate: 'arrow-img arrow-rotate'
      })
    }else {
      this.setData({
        sortReverse: "升序",
        foodData: foodData,
        foodName: foodName,
        arrowRotate: 'arrow-img'
      })
    };
  },


  goDetail(e){
    console.log("获取到的食物名称 ：", e.currentTarget.dataset.name);
    var name = e.currentTarget.dataset.name;
    wx.cloud.database().collection("carlorie")
    .where({
      food_name: name
    }).get().then( res => {
      // console.log("获取到要跳转的食物的名称成功！",res.data[0]);
      var foodItem = JSON.stringify(res.data[0]);
      console.log("json.stringify后的foodItem为：", foodItem)
      wx.redirectTo({
        url: '../../index/search/details/details?foodItem='+foodItem+'' 
        // success: function (res) {
        //   console.log("传参成功", res)
        // },
        // fail: function (res) {
        //   console.log("传参失败", res)
        // }
      })
    }).catch( res => {
      console.log("获取到要跳转的食物的名称失败！",res.data[0])
    });

  }

})