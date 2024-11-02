
// 接口 API ，用于放置后端提供的 API ，因为环境不同需要在 env 获取 请求 hosts
const PREFIX = `${import.meta.env.VITE_APP_HOST}`;
const WEB_PREFIX = `${PREFIX}/api/web`;
const ADMIN_PREFIX = `${PREFIX}/api/admin`;
const ALI_PREFIX = `${PREFIX}/api/aliyun`;

export default {
  // 获取用户信息
  userInfo: `${WEB_PREFIX}/users/user-info`,
  ossToken: `${ALI_PREFIX}/alioss-token`,
  ossStore: `${ALI_PREFIX}/alioss-store`,
  permissions: `${ADMIN_PREFIX}/api/permissions/permissions`,
  sendCode: `${ALI_PREFIX}/aliyun-sms`,
  login: `${ADMIN_PREFIX}/login`,
  logout: `${ADMIN_PREFIX}/logout`,
  // 角色相关信息
  roleList: `${ADMIN_PREFIX}/api/role`,
  roleAdd: `${ADMIN_PREFIX}/api/role`,
  roleUpdate: (id) => `${ADMIN_PREFIX}/api/role/${id}`,
  roleDelete: (id) => `${ADMIN_PREFIX}/api/role/${id}`,
  getEnableRoleList: `${ADMIN_PREFIX}/api/role/enable`,
  getRolePermissions: (id) => `${ADMIN_PREFIX}/api/role/${id}/permissions`,
  assignRolePermissions: (id) => `${ADMIN_PREFIX}/api/role/${id}/permissions`,
  // 管理员相关API
  managerList: `${ADMIN_PREFIX}/api/manager`,
  managerAdd: `${ADMIN_PREFIX}/api/manager`,
  managerUpdate: (id) => `${ADMIN_PREFIX}/api/manager/${id}`,
  managerDelete: (id) => `${ADMIN_PREFIX}/api/manager/${id}`,

  // 灵感图类目
  categoryList: `${ADMIN_PREFIX}/api/category`,
  categoryAdd: `${ADMIN_PREFIX}/api/category`,
  categoryUpdate: (id) => `${ADMIN_PREFIX}/api/category/${id}`,
  categoryDelete: (id) => `${ADMIN_PREFIX}/api/category/${id}`,
  // 灵感图
  inspirationList: (id) => `${ADMIN_PREFIX}/api/images/${id}`,
  inspirationAdd: (id) => `${ADMIN_PREFIX}/api/images/${id}`,
  inspirationUpdate: (id) => `${ADMIN_PREFIX}/api/images/${id}`,
  inspirationDelete: (id) => `${ADMIN_PREFIX}/api/images/${id}`
};
