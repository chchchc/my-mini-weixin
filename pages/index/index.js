import {areaList} from '../../arryData';

// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
    

    
    areaList:areaList,  //所有省的数据
    induction_nativePlace:'北京',  //默认展示的省的数据
    nativeIndex: [0, 0], //下标的选择
    nativeArray: [],     //省市选择 的范围
    native_province_id: '',  //记录一下 此时请求的省对应的id

  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }

    //过滤出只有省名的数组
    var provinceArr = this.data.areaList.map(item => { return item.province_name; })
    console.log('provinceArr',provinceArr)
    //给省市选择的数组赋值，第一项为所有省名字的数组，
    this.setData({
      provinceArr,
      nativeArray: [provinceArr, []]  //祖籍
    })
    console.log('刚开始的nativeArray',this.data.nativeArray)
    //默认获取北京对应的 pid
    var qu_id = this.data.areaList[0]['pid'];
    if (qu_id) {
      // 如果存在调用获取对应的区域数据
      this.searchNativeInfo(qu_id)　　　　　　
    }

  },

   //各列改变，发生的事件
   bindNativeColumnChange(e) {
     console.log('e列改变-发生的事件',e)
     // e.detail.column--------代表滑动的是第几列 下标从0开始  省这一列是0  区域这一列是1  
     // e.detail.value --------代表滑动当前列的第几个值  下标从0开始 
    var nativeData = {
      nativeArray: this.data.nativeArray,  // 默认[[北京，天津，河南],[东城区，海淀区]]
      nativeIndex: this.data.nativeIndex  // [0,0]
    };
    console.log('nativeData刚开始的',nativeData)
    nativeData.nativeIndex[e.detail.column] = e.detail.value  //滑动的第几列 = 选中的当前列的第几个值
    switch (e.detail.column) {
      //默认滑动的是第一列-----改变省的选择---因为只有改变省的选择 ，才需要请求对应的市区域
      case 0:
        let provinceId = this.data.areaList[e.detail.value]['pid']  //当前滑动列选中的省对应的pid值
        if (this.data.native_province_id != provinceId) {   //与 上次对应的省id 如果不相等---再次请求
          this.searchNativeInfo(provinceId)  //请求
        }
        nativeData.nativeIndex[1] = 0;  //默认第一列的值为第一个----区域的值默认为当前省的第一个区域
        console.log('nativeData后面的',nativeData)
        break;
    }
    this.setData({ nativeData })
  },

   //获取对应区域的数据
   searchNativeInfo(id) {
    var that = this
    if (id) {
      this.setData({
        native_province_id: id  //记录一下 此时请求的省对应的id
      }, () => {
        wx.request({
          url: "https://apis.map.qq.com/ws/district/v1/getchildren",
          data: {
            'id': id,
            'key': "GCOBZ-GS4ED-5RJ4D-HHGQH-2FYZ5-6GFWQ",
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          method: 'GET',
          success: (res) => {
            console.log('res.data请求回来的数据',res)
            //获取到对应的区域数据回来
            let native_quyu = res.data.result[0];
            //过滤出只有区域名的区域数组回来
            let native_quyu_array = native_quyu.map(item => {
              return item.fullname
            })
            //给省市选择的数组赋值，第一项仍为所有省的名字数组，第二项为默认请求到的北京市的区域的数组
            that.setData({
              nativeArray: [that.data.provinceArr, native_quyu_array],
              native_quyu_array
            })
            console.log('请求后的nativeArray',this.data.nativeArray)
            console.log('native_quyu_array',this.data.native_quyu_array)
          },
          fail: (res) => {
          }
        })
      })
    }
  },

 //value值改变触发事件-----
 bindNativeChange(e) {
  console.log('evalue值改变触发的事件',e)
  // deatil = {value:[1,2]} ------[]数组的第一个值：省列的第几个值   数组的第二个值：区域列的第几个值
  // 如[ 1,2,]  1 代表省列表的天津市   2 代表区域中的河西区
  var induction_nativePlace = this.data.areaList[e.detail.value[0]].province_name + this.data.native_quyu_array[e.detail.value[1]]
  
  this.setData({
    nativeIndex: e.detail.value,
    induction_nativePlace
  })
},

  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
