// 进行获取用户信息处理，确保在用 token 的情况下用户打开页面一定能获取到用户信息。
import { createRouter, createWebHistory } from 'vue-router';
import cookies from 'js-cookie';
import routes from './routes';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; // 引入 CSS
import userService from '@/services/user';
import permissionServe from '@/services/permissions';
import { useStore } from '@/stores/index.js';

const TOKEN_KEY = 'web_token';
const appRouter = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { x: 0, y: 0 };
  }
});

// 只触发一次的锁
appRouter.firstInit = false;
appRouter.beforeEach(async (to, from, next) => {
  NProgress.start();

  if (to.meta.title) document.title = to.meta.title;

  const store = useStore();
  const token = cookies.get(TOKEN_KEY);

  /*
    新增登录
   */
  // 没有TOKEN 的情况下的处理 要么跳走 要么去登录页
  // 如果同时满足以上两个条件（即用户未登录且试图访问非登录页面），则将导航重定向到 'AccountLogin' 页面
  if (!token && !['AccountLogin'].includes(to.name) && !['Index'].includes(to.name)) {
    next({ name: 'AccountLogin' });
    return;
  }
  if (token && ['AccountLogin'].includes(to.name)) {
    next({ name: 'Home' });
    return;
  }

  // 有 TOKEN 的情况下只请求一次用户信息
  if (token && !appRouter.firstInit) {
    try {
      const userInfo = await userService.getUserInfo();
      // 获取权限
      const permissionsResults = await permissionServe.getPermissions();
      const permissions = permissionsResults.data.permissions;
      console.log('huoqu', permissions);

      store.setUserInfo(userInfo);
      // 设置权限 响应相应的权限路由
      store.setPermissions(permissions);

      // 没有权限要么跳走，要么去提示页面
      if (!permissions?.length && !['AccessDenied'].includes(to.name)) {
        next({ name: 'AccessDenied' });
        return;
      }
      // // 没有跟踪线索的权限，去提示页面
      // if(!['clue-details'].includes(permissions) && ['ClueDetails'].includes(to.name)){
      //   next({ name: 'AccessDenied' });
      //   return;
      // }
      appRouter.firstInit = true;
    } catch (e) {
      next();
    }
  }

  // if (!store.userInfo?.id && to.meta.auth) {
  //   next({ name: 'Home' });
  //   return;
  // }
  next();
});

// eslint-disable-next-line
appRouter.afterEach((to, from) => {
  NProgress.done();
});

export default appRouter;
