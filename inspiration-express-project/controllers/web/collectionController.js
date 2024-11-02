const Collection = require('../../model/collection');
const InspirationCollection = require('../../model/inspiration_collection');
const Inspiration = require('../../model/inspiration');
const schema = require('async-validator').default

const collectionController = {
    // 获取收藏夹列表 
    collectionList: async function (req, res, next) {
        const customerId = res.locals.userInfo.id;
        // const customerId = 2;
        if (customerId) {
            const collectionList = await Collection.select({
                customer_id: customerId
            })
            // 遍历出该用户的收藏夹ids
            const collectionIds = collectionList.map(item => item.id)
            // 使用连表查询，与收藏夹图片表关联，查询各自出图片列表
            let inspirations = await InspirationCollection.knex()
                .whereIn('collection_id', collectionIds)
                .leftJoin('inspiration', 'inspiration_collection.inspiration_id', 'inspiration.id',)
                .select({ id: 'inspiration.id' }, 'inspiration_collection.collection_id', 'inspiration.img_url', 'inspiration.width', 'inspiration.height')
            console.log('inspirations', inspirations);
            let inspirationIds = inspirations.map(item => item.id)
            // 遍历出图片列表，并添加到收藏夹列表中
            collectionList.forEach(item => {
                item.inspirations = inspirations.filter(inspiration => inspiration.collection_id === item.id)
            })
            res.json({
                code: 200,
                data: {
                    collectionList,
                    inspirationIds
                },
                message: '获取成功'
            })
        } else {
            res.json({
                code: 0,
                data: {
                    collectionList: [],
                    inspirationIds: []
                }
            })
        }


    },
    // 收藏图片到收藏夹
    addCollectionImage: async function (req, res, next) {
        const collection_id = req.params.id;
        const inspiration_id = req.body.imageId;
        const customer_id = res.locals.userInfo.id;
        const params = {
            collection_id,
            inspiration_id,
            customer_id
        }
        try {
            await InspirationCollection.insert({
                ...params
            })
            res.json({
                code: 200,
                message: '收藏成功'
            })
        } catch (e) {
            res.json({
                code: 0,
                message: e.message
            })
        }
    },
    // 添加收藏夹
    addCollection: async function (req, res, next) {
        const collection_name = req.body.collection_name;
        const description = req.body.description;
        const private_status = req.body.private_status || 1;
        const customerId = res.locals.userInfo.id;
        const validator = new schema({
            collection_name: { type: 'string', required: true },
            private_status: { type: 'number', required: true }
        })
        const params = {
            collection_name,
            private_status
        }
        try {
            await validator.validate(params);
            const collection = await Collection.insert({
                collection_name,
                description,
                private_status,
                customer_id: customerId
            })
            res.json({
                code: 200,
                data: {
                    collection
                },
                message: '添加成功'
            })
        } catch (e) {
            res.json({
                code: 0,
                message: e.message
            })
        }
    },
    // 更新收藏夹
    updateCollection: async function (req, res, next) {
        const id = req.params.id;
        const collection_name = req.body.collection_name;
        const description = req.body.description;
        const private_status = req.body.private_status || 1;
        const validator = new schema({
            collection_name: { type: 'string', required: true },
            private_status: { type: 'number', required: true }
        })
        const params = {
            collection_name,
            private_status
        }

        try {
            await validator.validate(params);
            await Collection.update(id, {
                collection_name,
                description,
                private_status,
            });
            res.json({
                code: 200,
                message: '更新成功'
            })
        } catch (e) {
            res.json({
                code: 0,
                message: e.message
            })
        }
    },
    deleteCollection: async function (req, res, next) {
        const id = req.params.id;
        await Collection.delete(id);
        await InspirationCollection.select({ collection_id: id }).delete()
        res.json({
            code: 200,
            message: '删除成功'
        })
    }
}

module.exports = collectionController;