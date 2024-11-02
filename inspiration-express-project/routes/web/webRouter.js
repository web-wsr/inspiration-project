var express = require('express');
var router = express.Router();

const userInfoController = require('../../controllers/web/userInfoController');
const collectionController = require('../../controllers/web/collectionController');
const inspirationController = require('../../controllers/web/inspirationController');
const customerController = require('../../controllers/web/customerController');


// 前台登录
router.post('/sms/register', customerController.register);
// 用户信息更新
router.put('/users/user-info/:id', customerController.updateUserInfo);
// 用户手机更新
router.put('/users/user-info/phone/:id', customerController.updateUserPhone);
// 获取前台用户信息
router.get('/user-info', userInfoController.webUserInfo);
// 获取后台用户信息
router.get('/users/user-info', userInfoController.index);
// 灵感图类目管理路由
// 获取所有类目
router.get('/api/category', inspirationController.categoryList)

// 灵感图路由
// 获取分类类目下的灵感图
router.get('/api/images/:id', inspirationController.categoryImages)


// 收藏夹路由
// 获取所有收藏夹
router.get('/api/collection', collectionController.collectionList)
// 添加收藏夹图片
router.post('/api/collection/:id/image', collectionController.addCollectionImage)
// 添加收藏夹
router.post('/api/collection', collectionController.addCollection)
// 修改收藏夹
router.put('/api/collection/:id', collectionController.updateCollection)
// 删除收藏夹
router.delete('/api/collection/:id', collectionController.deleteCollection)

// 收藏夹图片
// 获取当前收藏夹下的所有图片
router.get('/api/collection/:id/image', inspirationController.collectionImages)
// 删除当前收藏夹下的图片
router.delete('/api/collection/:id/image', inspirationController.deleteCollectionImages)

module.exports = router;