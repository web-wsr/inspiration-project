import utils from '@/utils/request';
import API from '@/consts/api';

const inspirationService = {
    getCategoryList() {
        return utils.get(API.categoryList);
    },
    getCategoryImages(id, params) {
        return utils.get(API.categoryImages(id), params);
    },
    getCollectionImages(id) {
        return utils.get(API.collectionImages(id));
    },
    deleteCollectionImages(id) {
        return utils.delete(API.deleteCollectionImages(id));
    },
}

export default inspirationService;