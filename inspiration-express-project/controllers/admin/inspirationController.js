const Category = require('../../model/classify');
const Inspiration = require('../../model/inspiration');
const schema = require('async-validator').default

const InspirationController = {
    inspirationList: async function (req, res, next) {
        const category_id = req.params.id
        // 有单一分类图片全部删除的情况
        const page = Math.max(1, req.query.page)
        const size = req.query.pageSize || 10;
        const skip = (page - 1) * size;
        const result = await Inspiration.select({ category_id }).orderBy('id').offset(skip).limit(size); // 使用 Knex.js 分页查;
        const total = await Inspiration.count({ category_id });
        res.json({
            code: 200,
            data: result,
            total

        })
    },
    inspirationAdd: async function (req, res, next) {
        const category_id = Number(req.params.id);
        const { fileUrl, imageWidth, imageHeight } = req.body;
        console.log(req.body);
        console.log(category_id);
        const img_url = fileUrl;
        const width = imageWidth;
        const height = imageHeight;

        const validator = new schema({
            category_id: { type: 'number', required: true },
            img_url: { type: 'string', required: true },
            width: { type: 'number', required: true },
            height: { type: 'number', required: true }
        })
        const params = {
            category_id,
            img_url,
            width,
            height
        }
        try {
            await validator.validate(params)
            const result = await Inspiration.insert({ category_id, img_url, width, height });
            res.json({
                code: 200,
                message: '图片添加成功',
                data: result
            })
        } catch (e) {
            res.json({ error_code: 1, message: e.message || e.errors });
        }

    },
    inspirationUpdate: async function (req, res, next) {
        const id = req.params.id;
        const { fileUrl, imageWidth, imageHeight } = req.body;
        const img_url = fileUrl;
        const width = imageWidth;
        const height = imageHeight;

        const validator = new schema({
            img_url: { type: 'string', required: true },
            width: { type: 'number', required: true },
            height: { type: 'number', required: true }
        })
        const params = {
            img_url,
            width,
            height
        }
        try {
            await validator.validate(params)
            const result = await Inspiration.update(id, params);
            res.json({
                code: 200,
                message: '图片编辑成功',
                data: result
            })
        } catch (e) {
            res.json({ error_code: 1, message: e.message || e.errors });
        }

    },
    inspirationDelete: async function (req, res, next) {
        const id = req.params.id;
        const result = await Inspiration.delete(id);
        res.json({
            code: 200,
            message: '图片删除成功',
            data: result
        })
    }

}

module.exports = InspirationController