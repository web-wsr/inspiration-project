import utils from '@/utils/request';
import API from '@/consts/api';

const inspirationService = {
    getCategoryList() {
        return utils.get(API.categoryList);
    },
    categoryAdd(data) {
        return utils.post(API.categoryAdd, data);
    },
    categoryUpdate(id, data) {
        return utils.put(API.categoryUpdate(id), data);
    },
    categoryDelete(id) {
        return utils.delete(API.categoryDelete(id));
    },
    // 图库相关api
    getInspirationList(id, params) {
        return utils.get(API.inspirationList(id), params);
    },
    inspirationAdd(id, data) {
        return utils.post(API.inspirationAdd(id), data);
    },
    inspirationUpdate(id, data) {
        return utils.put(API.inspirationUpdate(id), data);
    },
    inspirationDelete(id) {
        return utils.delete(API.inspirationDelete(id));
    }
}
export default inspirationService;