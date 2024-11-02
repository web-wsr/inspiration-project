import utils from '@/utils/request';
import API from '@/consts/api';

const collectionService = {
    collectionList() {
        return utils.get(API.collectionList);
    },
    addCollectionImage(id, data) {
        return utils.post(API.addCollectionImage(id), data);
    },
    addCollection(data) {
        return utils.post(API.addCollection, data);
    },
    updateCollection(id, data) {
        return utils.put(API.updateCollection(id), data);
    },
    deleteCollection(id) {
        return utils.delete(API.deleteCollection(id));
    },
}

export default collectionService;