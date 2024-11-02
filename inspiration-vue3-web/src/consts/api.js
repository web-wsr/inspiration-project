// 接口 API ，用于放置后端提供的 API ，因为环境不同需要在 env 获取 请求 hosts
const PREFIX = `${import.meta.env.VITE_APP_HOST}`;
const WEB_PREFIX = `${PREFIX}/api/web`;
const ALI_PREFIX = `${PREFIX}/api/aliyun`;
export default {
  // 获取用户信息
  userInfo: `${WEB_PREFIX}/user-info`,
  ossToken: `${ALI_PREFIX}/api/file/alioss-token`,
  ossStore: `${ALI_PREFIX}/api/file/alioss-store`,
  sendCode: `${ALI_PREFIX}/aliyun-sms`,
  // 登录
  register: `${WEB_PREFIX}/sms/register`,
  // 修改个人信息
  updateUserInfo: (id) => `${WEB_PREFIX}/users/user-info/${id}`,
  // 修改手机号
  updateUserPhone: (id) => `${WEB_PREFIX}/users/user-info/phone/${id}`,

  // 获取所有分类列表
  categoryList: `${WEB_PREFIX}/api/category`,
  // 获取分类类目下的图片列表
  categoryImages: (id) => `${WEB_PREFIX}/api/images/${id}`,


  // 收藏夹
  // 获取收藏夹列表
  collectionList: `${WEB_PREFIX}/api/collection`,
  // 添加图片到收藏夹
  addCollectionImage: (id) => `${WEB_PREFIX}/api/collection/${id}/image`,
  // 添加收藏夹
  addCollection: `${WEB_PREFIX}/api/collection`,
  // 更新收藏夹
  updateCollection: (id) => `${WEB_PREFIX}/api/collection/${id}`,
  // 删除收藏夹
  deleteCollection: (id) => `${WEB_PREFIX}/api/collection/${id}`,

  // 收藏夹图片
  // 当前收藏夹图片列表
  collectionImages: (id) => `${WEB_PREFIX}/api/collection/${id}/image`,
  // 删除当前收藏夹下的图片
  deleteCollectionImages: (id) => `${WEB_PREFIX}/api/collection/${id}/image`,
};
