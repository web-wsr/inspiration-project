const User = require('../../model/user')
const JWT = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const Cookies = require('js-cookie');
const { getCode } = require('../../utils/redis.js')

const schema = require('async-validator').default;
const rolePermission = require('../../model/role_permission.js')
const PermissionGroup = require('../../model/permission_group.js')
const Permission = require('../../model/permission.js')
// const jsCookie = require('js-cookie');

const userController = {
    // 登录接口
    login: async function (req, res, next) {
        let phone = req.body.phone;
        let code = req.body.code;
        try {
            const validataCode = await getCode(phone)
            if (validataCode) {
                if (code === validataCode) {
                    // 搜索匹配的用户
                    const users = await User.select({ phone });
                    //是否该用户存在
                    const user = users[0];
                    console.log(user);
                    if (user) {
                        // 登录成功，生成token
                        let token = JWT.sign({ user_id: user.id, user_name: user.name }, JWT_SECRET, { expiresIn: '30d' })
                        console.log(token);
                        res.json({
                            code: 200,
                            msg: '登录成功',
                            data: { token: token }
                        })
                    } else {
                        res.json({
                            code: 0,
                            msg: '用户不存在'
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
    // 退出登录接口
    logout: function (req, res, next) {
        res.json({
            code: 200,
            msg: '退出成功'
        })
    },
    // 获取权限信息接口
    getPermissions: async function (req, res, next) {
        try {
            if (res.locals.isLogin) {
                const id = res.locals.userInfo.id
                const permissionGroup = await PermissionGroup.all()
                const permissionsAll = await Permission.all()
                const permissionGroupDiv = {}
                permissionGroup.forEach(data => {
                    data.children = []
                    permissionGroupDiv[data.id] = data
                })
                permissionsAll.forEach(data => {
                    permissionGroupDiv[data.group_id].children.push(data)
                })
                const permissionsTransformAll = Object.values(permissionGroupDiv)
                console.log(permissionsTransformAll);


                // 获取角色关联的权限
                const permissions = await rolePermission.where({ role_id: id });
                console.log('1111111', permissions);
                const permissionsTransform = permissions.map(data => data.permission_id)
                console.log(permissionsTransform);
                //   const slugs = permissionsTransform.map(id=>{
                //     const item=permissionsAll.find(item => item.id===id)
                //     return item ? item.slug: ''
                //   }).filter(slug => slug !== '')
                const slugs = permissionsTransform.map(id => {
                    const item = permissionsAll.find(item => item.id === id)
                    return item.slug
                })
                console.log(slugs);

                res.json({ error_code: 0, data: { permissions: slugs } })
            }
        } catch (e) {
            res.json({ error_code: 1, message: e.message })
        }
    }


};

module.exports = userController;