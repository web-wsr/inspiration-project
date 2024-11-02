import utils from '@/utils/request';
import API from '@/consts/api';

const roleService = {
  getRoleList(params) {
    return utils.get(API.roleList, params);
  },
  getEnableRoleList() {
    return utils.get(API.getEnableRoleList);
  },
  addRole(data) {
    return utils.post(API.roleAdd, data);
  },
  updateRole(id, data) {
    return utils.put(API.roleUpdate(id), data);
  },
  deleteRole(id) {
    return utils.delete(API.roleDelete(id));
  },

  // 权限回显
  getRolePermissions(id) {
    return utils.get(API.getRolePermissions(id));
  },
  assignRolePermissions(id, data) {
    return utils.put(API.assignRolePermissions(id), data);
  }
};

export default roleService;
