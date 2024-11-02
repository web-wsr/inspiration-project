// 使用 pinia 存放全局的数据，一般是用户信息、风格主题、或者用户本地或者线上的配置
import { defineStore } from 'pinia';

export const useStore = defineStore('main', {
  state: () => {
    return {
      userInfo: {
        avatar_url: 'https://img2.baidu.com/it/u=1699608862,1598215989&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=500',
        introduction: ''
      }
    };
  },
  actions: {
    setUserInfo(userInfo) {
      // 检查 userInfo 是否有 avatar_url，如果没有则使用默认值
      const updatedUserInfo = {
        ...this.userInfo,
        ...userInfo,
        avatar_url: userInfo.avatar_url || this.userInfo.avatar_url,
        introduction: userInfo.introduction || this.userInfo.introduction
      };
      this.userInfo = updatedUserInfo;
    }
  }
});
