const Customer = require('../../model/customer');
const JWT = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const Cookies = require('js-cookie');
const { getCode } = require('../../utils/redis')


const customerController = {
    // 登录接口
    register: async function (req, res, next) {
        let phone = req.body.phone;
        let code = req.body.code;
        try {
            const validataCode = await getCode(phone)
            if (validataCode) {
                if (code === validataCode) {
                    // 搜索匹配的用户
                    const customers = await Customer.select({ phone });
                    //是否该用户存在
                    const customer = customers[0];
                    if (customer) {
                        // 登录成功，生成token
                        let token = JWT.sign({ user_id: customer.id, user_name: customer.nickname, user_phone: customer.phone }, JWT_SECRET, { expiresIn: '30d' })
                        console.log(token);
                        res.json({
                            code: 200,
                            msg: '登录成功',
                            data: { token: token }
                        })
                    } else {
                        // 如果用户不存在，创建新用户并登录
                        const newCustomer = await Customer.insert({ phone, nickname: '新用户' })
                        // 登录成功，生成token
                        let token = JWT.sign({ user_id: newCustomer[0].id, user_name: newCustomer[0].nickname, user_phone: newCustomer[0].phone }, JWT_SECRET, { expiresIn: '30d' })
                        console.log(token);
                        res.json({
                            code: 200,
                            msg: '登录成功',
                            data: { token: token }
                        })
                    }
                } else {
                    res.json({
                        code: 0,
                        msg: '验证码输入错误'
                    })
                }
            } else {
                res.json({
                    code: 0,
                    msg: '验证码过期，请重新获取'
                })
            }
        } catch (e) {
            console.log(e);
            res.json({ code: 0, data: e })
        }
    },
    updateUserInfo: async function (req, res, next) {
        let id = req.params.id
        const { name, introduction } = req.body
        try {
            await Customer.update(id, { nickname: name, introduction })
            res.json({
                code: 200,
                message: '更新用户信息成功'
            })
        } catch (e) {
            res.json({ error_code: 1, message: e.message || e.errors })
        }
    },
    updateUserPhone: async function (req, res, next) {
        let id = req.params.id
        const { phone, code } = req.body

        try {
            const validataCode = await getCode(phone)
            if (validataCode) {
                if (code === validataCode) {
                    await Customer.update(id, { phone })
                    res.json({
                        code: 200,
                        message: '手机号修改成功'
                    })
                } else {
                    res.json({
                        code: 0,
                        message: '验证码输入错误'
                    })
                }
            } else {
                res.json({
                    code: 0,
                    message: '验证码过期，请重新获取'
                })
            }
        } catch (e) {
            res.json({ error_code: 1, message: e.message || e.errors })
        }
    }

}

module.exports = customerController;
