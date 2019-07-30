// pages/weather/weather-detail.js
// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: 'GWCBZ-KBQRQ-I4F5U-G7EDN-SU55O-WFFVL' //申请的开发者秘钥key
});
var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
    region: [],
    userInfo: {},
    cityList: [],
    startX: 0, //开始移动时距离左
    endX: 0, //结束移动时距离左
    nowPage: 0, //当前是第几个个页面
    cardList: [{
      viewBg: '',
      aqiGrade: '',
      tips: '',
      id: 0,
      from: '',
      to: '',
      city: '',
      aqi: '',
      pm25: '',
      display: 1,
      scale: '',
      slateX: '',
      zIndex: 0,
      style: ''
    },
    ],

  },

  onLoad: function (event) {
    this.CardCount = 0;
    var that = this;
    wx.getLocation({
      success: function (res) {
        // 调用sdk接口
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude,
          },
          success: function (res) {
            //获取当前地址成功
            var city = res.result.address_component.city;           
            that.getWeather(city);
            that.getStorageCity();
            
          },
          fail: function (res) {
            wx.showModal({
              title: '请同意开启定位权限',
              content: '确认',
              showCancel:false,
            })
          }
        });
      },
    })
  },

  getStorageCity:function(){
    var citylist=wx.getStorageSync('cityList');
    for (var i=0; i < citylist.length; i++)
    {
      this.addNewCity();
      var city = citylist[i].name;
      this.storageCityWeather(city,i);
      this.data.cityList[i].name=city;
      this.setData({
        cityList:this.data.cityList,
      })
      this.CardCount=i+1;
    }  
  },

  storageCityWeather:function(city,i){
    var url = app.globalData.weatherBase + city.substring(0, city.length - 1);
    var that = this;
    wx.request({
      url: url,
      method: 'GET',
      header: {
        "content-type": "json"
      },
      success: function (res) {
        that.storageCityData(res.data,i);
      },
      fail: function (error) {
        // fail
        wx.showToast({
          title: '请确认网络连接',
        });
      },
    })
  },

  storageCityData: function (AqiMessage,i) {
    wx.showToast({
      title: '正在加载',
      icon: 'loading',
      duration: 1000,
    });
    var that = this;
    let tips = new Array()
    tips = that.getTips(AqiMessage.aqi)
    that.data.cardList[i + 1].viewBg = tips[0];
    that.data.cardList[i + 1].aqiGrade = tips[1];
    that.data.cardList[i + 1].tips = tips[2];
    that.data.cardList[i+1].city =  AqiMessage.city;
    that.data.cardList[i+1].aqi =  AqiMessage.aqi;
    that.data.cardList[i+1].pm25 = AqiMessage.data[0].pm25;
    that.setData({
      cardList: that.data.cardList,
    });    
  },

  addNewCity: function () {
    let newArray = {
      viewBg: '',
      aqiGrade:'',
      tips:'',
      id: 0,
      from: '',
      to: '',
      city: '',
      aqi: '',
      pm25: '',
      display: 0,
      scale: '',
      slateX: '',
      zIndex: 0,
      style: ''
    }
    let newCityArray = {
    }
    this.setData({
      cardList: this.data.cardList.concat(newArray),
      cityList: this.data.cityList.concat(newCityArray),
    });
  },

  getWeather: function (city) {
    var url = app.globalData.weatherBase + city.substring(0, city.length - 1);
    var that = this;
    wx.request({
      url: url,
      method: 'GET',
      header: {
        "content-type": "json"
      },
      success: function (res) {
        that.locationCitydata(res.data);
      },
      fail: function (error) {
        // fail
        console.log(error)
      },
    })
  },

  locationCitydata: function (AqiMessage) {
    var that = this;
    let tips = new Array()
    tips = that.getTips(AqiMessage.aqi)
    that.data.cardList[0].viewBg = tips[0];
    that.data.cardList[0].aqiGrade = tips[1];
    that.data.cardList[0].tips = tips[2];
    that.data.cardList[0].city =  AqiMessage.city;
    that.data.cardList[0].aqi =  AqiMessage.aqi;
    that.data.cardList[0].pm25 = AqiMessage.data[0].pm25;
    that.setData({
      cardList: that.data.cardList
    });
    this.checkPage(0);
  },

  bindCityChange: function (event) {  //TODO:Add
    this.CardCount++;
    this.addNewCity();
    this.setData({
      region: event.detail.value  //TODO:
    });
    var city = event.detail.value[1];
    this.searchCityWeather(city);
    this.data.cityList[this.CardCount-1].name = city;
    this.setData({
      cityList: this.data.cityList,
    });
    wx.setStorageSync('cityList', this.data.cityList);
  },

  searchCityWeather: function (city) {
    var url = app.globalData.weatherBase + city.substring(0, city.length - 1);
    var that = this;
    wx.request({
      url: url,
      method: 'GET',
      header: {
        "content-type": "json"
      },
      success: function (res) {
        that.bindCityData(res.data);
      },
      fail: function (error) {
        // fail
        wx.showToast({
          title: '请确认网络连接',
        });
      },
    })
  },

  bindCityData: function (AqiMessage) {
    wx.showToast({
      title: '正在加载',
      icon: 'loading',
      duration:1000,
    });
    var that = this;
    let tips = new Array()
    tips = that.getTips(AqiMessage.aqi)
    that.data.cardList[that.CardCount].viewBg = tips[0];
    that.data.cardList[that.CardCount].aqiGrade = tips[1];
    that.data.cardList[that.CardCount].tips = tips[2];

    that.data.cardList[that.CardCount].city =  AqiMessage.city;
    that.data.cardList[that.CardCount].aqi =  AqiMessage.aqi;
    that.data.cardList[that.CardCount].pm25 =  AqiMessage.data[0].pm25;
    that.setData({
      cardList: that.data.cardList,
    });  
  },

  deleteCityBtn: function (e) {
    var that=this;
    wx.showModal({
      title: '删除',
      content: '确认要删除当前城市信息吗',
      success:function(res){
        if(res.confirm){
          that.deleteCity();
        }else{
          
        }
      }
    });
  },

  getTips: function (aqi) {
    let tips = new Array()
    if (aqi >= 0 && aqi <= 50) {
      tips[0] = "rgba(2,229,0,0.85)"
      tips[1] = "优"
      tips[2] = "参加户外活动呼吸清新空气，非常适宜户外活动和锻炼。"
    }else if (aqi >= 51 && aqi <= 100) {
      tips[0] = "rgba(245,225,0,0.85)"
      tips[1] = "良"
      tips[2] = "可以正常进行户外活动，适宜户外锻炼。"

    } else if (aqi >= 101 && aqi <= 150) {
      tips[0] = "rgba(255,124,0,0.85)"
      tips[1] = "轻度污染"
      tips[2] = "适当减少户外锻炼，敏感人群减少户外活动。"

    } else if (aqi >= 151 && aqi <= 200) {
      tips[0] = "rgba(255,0,0,0.85)"
      tips[1] = "中度污染"
      tips[2] = "停止户外锻炼，减少户外活动。"
    }
    else if (aqi >= 201 && aqi <= 300) {
      tips[0] = "rgba(155,2,76,0.85)"
      tips[1] = "重度污染"
      tips[2] = "所有人应适当减少户外活动，户外活动时应佩戴口罩。"
    } else if (aqi > 300){
      tips[0] = "rgba(124,0,36,0.85)"
      tips[1] = "严重污染"
      tips[2] = "尽量不要留在室外，取消不必要的户外活动。"
    }else{
      wx.showToast({
        title: '未知错误',
        icon: 'loading',
        duration: 1000,
      });
    }
    return tips;
  },

  deleteCity:function(){
    var that = this;
    let cardlist = that.data.cardList;
    let citylist = that.data.cityList;
    var index = that.data.nowPage;
    cardlist.splice(index, 1);
    citylist.splice(index-1,1)
    that.setData({
      cardList: cardlist,
      cityList:citylist
    });
    wx.setStorageSync('cityList', this.data.cityList);
    that.CardCount--;
    this.checkPage(0);
  },

  //手指触发开始移动
  moveStart: function (e) {
    var startX = e.changedTouches[0].pageX;
    this.setData({
      startX: startX
    });
  },

  //手指触摸后移动完成触发事件
  moveItem: function (e) {
    var that = this;
    var endX = e.changedTouches[0].pageX;
    this.setData({
      endX: endX
    });

    //计算手指触摸偏移剧距离
    var moveX = this.data.startX - this.data.endX;

    //向左移动
    if (moveX > 20) {

      if (that.data.nowPage >= (that.data.cardList.length - 1)) {
        wx.showToast({
          title: '请先添加城市',
          icon: 'none'
        })
        return false;
      }
      that.setData({
        nowPage: that.data.nowPage + 1
      });
      this.checkPage(this.data.nowPage);
    }
    if (moveX < -20) {
      if (that.data.nowPage <= 0) {
        wx.showToast({
          title: '已经没有其他城市了',
          icon: 'none'
        })
        return false;
      }
      that.setData({
        nowPage: that.data.nowPage - 1
      });
      this.checkPage(this.data.nowPage);

      wx.showToast({
       title: '不可以回退',
       icon:'none'
      })
    }
  },

  // 页面判断逻辑,传入参数为当前是第几页 
  checkPage: function (index) {
    //信列表数据
    var data = this.data.cardList;
    var that = this;
    var m = 1;
    for (var i = 0; i < data.length; i++) {
      //先将所有的页面隐藏
      var disp = 'cardList[' + i + '].display';
      var sca = 'cardList[' + i + '].scale';
      var slateX = 'cardList[' + i + '].slateX';
      var zIndex = 'cardList[' + i + '].zIndex';
      var style = 'cardList[' + i + '].style';
      that.setData({
        [disp]: 0,
        [style]: "display:block",
      });
      //向左移动上一个页面
      if (i == (index - 1)) {
        that.setData({
          [slateX]: '-120%',
          [disp]: 1,
          [zIndex]: 2,

        });
      }
      //向右移动的最右边要display:none的页面
      if (i == (index + 3)) {
        that.setData({
          [style]: 'display:none',
          [slateX]: '0',
          [zIndex]: -10,
        });
      }
      if (i == index || (i > index && (i < index + 3))) {
        //显示最近的三封
        that.setData({
          [disp]: 1
        });
        //第一封信
        if (m == 1) {
          this.setData({
            [sca]: 1,
            [slateX]: 0,
            [zIndex]: 1,
          });
        }
        //第一封信
        else if  (m == 2) {
          this.setData({
            [sca]: 0.8,
            [slateX]: '20px',
            [zIndex]: -1,
          });
        }
        //第三封信
        else if (m == 3) {
          this.setData({
            [sca]: 0.6,
            [slateX]: '40px',
            [zIndex]: -2,
          });
        }
        m++;
      }
    }
  },
})