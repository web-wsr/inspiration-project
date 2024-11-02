const Collection = () => import(/* webpackChunkName: "collection" */ '@/views/Collection/CollectionIndex.vue');
const CollectionDetail = () => import(/* webpackChunkName: "collection" */ '@/views/Collection/CollectionDetail.vue')

export default [
    {
        path: '/collection',
        name: 'Collection',
        meta: {
            auth: true
        },
        component: Collection
    },
    {
        path: '/collection/detail/:id',
        name: 'CollectionDetail',

        component: CollectionDetail
    }
];
