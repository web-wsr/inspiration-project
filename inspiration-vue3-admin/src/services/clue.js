import utils from '@/utils/request';
import API from '@/consts/api';

const clueService = {
  assignClue(data) {
    return utils.post(API.assignClue, data);
  },
  getClueList(params) {
    return utils.get(API.clueList, params);
  },
  getClueDetails(params) {
    return utils.get(API.getCluedetails, params);
  },
  updateClue(data) {
    return utils.put(API.updateClue, data);
  },
  logAdd(data) {
    return utils.post(API.logAdd, data);
  },
  logList(params) {
    return utils.get(API.logList, params);
  }
};

export default clueService;
