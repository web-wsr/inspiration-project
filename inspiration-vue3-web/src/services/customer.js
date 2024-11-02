import utils from '@/utils/request';
import API from '@/consts/api';

const customerService = {
    sendCode(data) {
        return utils.post(API.sendCode, data);
    },
    register(data) {
        return utils.post(API.register, data);
    },
    getUserInfo() {
        return utils.get(API.userInfo);
    },
    updateUserInfo(id, data) {
        return utils.put(API.updateUserInfo(id), data);
    },
    updateUserPhone(id, data) {
        return utils.put(API.updateUserPhone(id), data);
    },
};

export default customerService;
