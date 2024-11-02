import utils from '@/utils/request';
import API from '@/consts/api';

const managerService = {
  getManagerList(params) {
    return utils.get(API.managerList, params);
  },
  managerAdd(data) {
    return utils.post(API.managerAdd, data);
  },
  managerUpdate(id, data) {
    return utils.put(API.managerUpdate(id), data);
  },
  managerDelete(id) {
    return utils.delete(API.managerDelete(id));
  }
};

export default managerService;
