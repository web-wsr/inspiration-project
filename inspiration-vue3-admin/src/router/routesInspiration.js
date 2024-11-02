// 灵感图库模块

const CategoryIndex = () => import(/* webpackChunkName: "clue" */ '@/views/Inspiration/CategoryIndex.vue');
const ImagesIndex = () => import(/* webpackChunkName: "clue" */ '@/views/Inspiration/ImagesIndex.vue');

export default [
    {
        path: '/inspitation',
        name: 'Inspitation',
        redirect: { name: 'RoleIndex' },
        meta: {
            permission: 'inspiration-manage',
            nav: {
                icon: 'icon-file',
                title: '灵感图管理'
            },
            breadcrumb: {
                name: '灵感图'
            }
        },
        children: [
            {
                path: 'category',
                name: 'CategoryIndex',
                component: CategoryIndex,
                meta: {
                    permission: 'category-manage',
                    nav: {
                        title: '灵感图分类'
                    },
                    breadcrumb: {
                        name: '灵感图分类'
                    }
                }
            },
            {
                path: 'images',
                name: 'ImagesIndex',
                component: ImagesIndex,
                meta: {
                    permission: 'images-manage',
                    nav: {
                        title: '灵感图图库'
                    },
                    breadcrumb: {
                        name: '灵感图图库'
                    }
                }
            },
        ]
    }
]