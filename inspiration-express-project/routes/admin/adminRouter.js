var express = require('express');
var router = express.Router();
const userController = require('../../controllers/admin/userController');
const roleController = require('../../controllers/admin/roleController');
const managerController = require('../../controllers/admin/managerController');
const categoryController = require('../../controllers/admin/categoryController');
const inspirationController = require('../../controllers/admin/inspirationController');


// 发送验证码的路由
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.get('/api/permissions/permissions', userController.getPermissions);

// 角色管理路由
// 获取所有角色
router.get('/api/role', roleController.roleList)
// 获取可用角色列表
router.get('/api/role/enable', roleController.getEnableRoleList)
// 新增角色
router.post('/api/role', roleController.addRole)
// 删除角色
router.delete('/api/role/:id', roleController.deleteRole)
// 更新角色
router.put('/api/role/:id', roleController.updateRole)
// 获取角色权限
router.get('/api/role/:id/permissions', roleController.getRolePermissions)
// 更新角色权限
router.put('/api/role/:id/permissions', roleController.updateRolePermissions)

// 管理员管理路由
// 获取所有管理员列表
router.get('/api/manager', managerController.managerList)
// 新增管理员
router.post('/api/manager', managerController.managerAdd)
// 更新管理员
router.put('/api/manager/:id', managerController.managerUpdate)
// 删除管理员
router.delete('/api/manager/:id', managerController.managerDelete)


// 灵感图类目管理路由
// 获取所有类目
router.get('/api/category', categoryController.categoryList)
// 新增类目
router.post('/api/category', categoryController.categoryAdd)
// 更新分类
router.put('/api/category/:id', categoryController.categoryUpdate)
// 删除分类
router.delete('/api/category/:id', categoryController.categoryDelete)

// 获取分类类目下的灵感图
router.get('/api/images/:id', inspirationController.inspirationList)
// 添加分类类目下的灵感图
router.post('/api/images/:id', inspirationController.inspirationAdd)
// 编辑分类类目下的灵感图
router.put('/api/images/:id', inspirationController.inspirationUpdate)
// 删除分类类目下的灵感图
router.delete('/api/images/:id', inspirationController.inspirationDelete)


module.exports = router;