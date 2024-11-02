const Category = require('../../model/classify');
const Collection = require('../../model/collection');
const Inspiration = require('../../model/inspiration');
const InspirationCollection = require('../../model/inspiration_collection');
const formatTree = require('../../utils/formatTree')

const inspirationController = {
    categoryList: async function (req, res, next) {
        const categorys = await Category.all()
        // const tree = formatTree(categorys)
        // // 查找指定id的节点及其所有子节点
        // const findChildrenById = (tree, id) => {
        //     let result = [];

        //     const dfs = (node) => {
        //         if (node.id === id) {
        //             result.push(...node.children); // 只添加子节点
        //         } else {
        //             node.children.forEach(child => dfs(child));
        //         }
        //     };
        //     tree.forEach(rootNode => dfs(rootNode));


        //     return result;
        // };

        // // 获取id为1的所有子类数据
        // const childrenOfParent1 = findChildrenById(tree, 197);
        res.json({
            code: 200,
            data: categorys
        })

    },
    categoryImages: async function (req, res, next) {
        const category_id = req.params.id;
        const page = req.query.page || 1;
        const size = req.query.pageSize || 10;
        const skip = (page - 1) * size;
        const result = await Inspiration.select({ category_id }).orderBy('id').offset(skip).limit(size); // knex.js 分页查询
        const total = await Inspiration.count({ category_id });
        res.json({
            code: 200,
            data: result,
            total
        })
    },
    collectionImages: async function (req, res, next) {
        const collection_id = req.params.id;
        const collectionImages = await Collection.select({ id: collection_id })
        // 使用连表查询，与收藏夹图片表关联，查询各自出图片列表
        let inspirations = await InspirationCollection.knex()
            .where('collection_id', collection_id)
            .leftJoin('inspiration', 'inspiration_collection.inspiration_id', 'inspiration.id',)
            .select({ id: 'inspiration.id' }, 'inspiration_collection.collection_id', 'inspiration.img_url', 'inspiration.width', 'inspiration.height')
        console.log('inspirations', inspirations);
        // 遍历出图片列表，并添加到当前收藏夹列表中
        collectionImages.forEach(item => {
            item.inspirations = inspirations.filter(inspiration => inspiration.collection_id === item.id)
        })
        res.json({
            code: 200,
            data: collectionImages
        })
    },
    deleteCollectionImages: async function (req, res, next) {
        const id = req.params.id;
        await InspirationCollection.select({ inspiration_id: id }).delete()
        res.json({
            code: 200,
            message: '移除图片成功'
        })
    },
}

module.exports = inspirationController;
