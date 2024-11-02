import utils from '@/utils/request';
import API from '@/consts/api';

const userService = {
  getUserInfo() {
    return utils.get(API.userInfo);
  },
  sendCode(data) {
    return utils.post(API.sendCode, data);
  },
  login(data) {
    return utils.post(API.login, data);
  },
  logout() {
    return utils.get(API.logout);
  }
};

export default userService;
