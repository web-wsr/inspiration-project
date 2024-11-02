import BasicLayout from '@/components/Layout/BasicLayout.vue';
import Home from '@/views/HomeIndex.vue';
import NotFound from '@/views/Common/NotFound.vue';
import routesCollection from './routesCollection';
import AccountLogin from '@/views/Common/AccountLogin.vue';
import PersonalCenter from '@/views/Personal/PersonalCenter.vue';

export default [
  {
    path: '/',
    name: 'Root',
    component: BasicLayout,
    redirect: {
      name: 'Home'
    },
    children: [
      {
        path: '/',
        name: 'Home',
        component: Home
      },
      {
        // 去个人中心
        path: '/my',
        name: 'PersonalCenter',
        component: PersonalCenter
      },
      ...routesCollection

    ]
  },
  {
    path: '/login',
    name: 'AccountLogin',
    component: AccountLogin
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFound
  },
  {
    path: '/:pathMatch(.*)',
    redirect: '/404'
  }
];
