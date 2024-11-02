const Category = require('../../model/classify')
const formatTree = require('../../utils/formatTree')
const schema = require('async-validator').default

const categoryController = {
    categoryList: async function (req, res, next) {
        // const page = req.query.page || 1;
        // const size = req.query.pageSize || 10;
        // const skip = (page - 1) * size;
        // const categorys = await Category.all().orderBy('id').offset(skip).limit(size); // 使用 Knex.js 分页查;
        const categorys = await Category.all()
        const categoryList = formatTree(categorys)
        res.json({
            code: 200,
            data: categoryList
        })
    },
    categoryAdd: async function (req, res, next) {
        const { name, description, parent_id, level_id } = req.body
        const validator = new schema({
            name: { type: 'string', required: true },
            description: { type: 'string', required: true },
        })
        const params = {
            name,
            description,
            parent_id,
            level_id
        }
        try {
            await validator.validate(params)
            const category = await Category.insert(params)
            res.json({
                code: 200,
                data: category,
                message: '新增分类成功'
            })
        } catch (e) {
            res.json({ error_code: 1, message: e.message || e.errors });
        }

    },
    categoryUpdate: async function (req, res, next) {
        const id = req.params.id
        const { name, description } = req.body
        const validator = new schema({
            name: { type: 'string', required: true },
            description: { type: 'string', required: true },
        })
        const params = { name, description }
        try {
            await validator.validate(params)
            await Category.update(id, params)
            res.json({
                code: 200,
                message: '更新分类成功'
            })
        } catch (e) {
            res.json({ error_code: 1, message: e.message || e.errors })
        }
    },
    categoryDelete: async function (req, res, next) {
        const id = req.params.id
        await Category.delete(id)
        res.json({
            code: 200,
            message: '删除分类成功'
        })
    }
}
module.exports = categoryController